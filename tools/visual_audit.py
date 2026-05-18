import argparse
import base64
import json
import os
import socket
import struct
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageStat
except Exception:
    Image = None
    ImageStat = None


CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]


CLICKABLE_JS = r"""
(() => {
  const deny = /buy|purchase|checkout|pay|subscribe|delete|remove|sign out|logout|log out|submit|order|cart|trial|download/i;
  const isVisible = (el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width >= 24 && rect.height >= 18 && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
  };
  const textOf = (el) => (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || el.href || "").replace(/\s+/g, " ").trim().slice(0, 120);
  return Array.from(document.querySelectorAll("a,button,[role='button'],summary,input[type='button'],input[type='submit'],[tabindex]"))
    .map((el, index) => {
      const rect = el.getBoundingClientRect();
      const text = textOf(el);
      const href = el.href || "";
      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute("type") || "").toLowerCase();
      const inForm = !!el.closest("form");
      const safe = isVisible(el) && !deny.test(text) && !(inForm && (tag === "button" || type === "submit"));
      return {
        index, text, href, tag, type, inForm, safe,
        x: Math.round(rect.x), y: Math.round(rect.y),
        width: Math.round(rect.width), height: Math.round(rect.height)
      };
    })
    .filter((item) => item.width >= 24 && item.height >= 18)
    .slice(0, 80);
})()
"""


CLICK_JS = r"""
((targetIndex) => {
  const items = Array.from(document.querySelectorAll("a,button,[role='button'],summary,input[type='button'],input[type='submit'],[tabindex]"));
  const el = items[targetIndex];
  if (!el) return { ok: false, reason: "element not found" };
  el.scrollIntoView({ block: "center", inline: "center" });
  const rect = el.getBoundingClientRect();
  const label = (el.innerText || el.value || el.getAttribute("aria-label") || el.href || el.tagName || "").replace(/\s+/g, " ").trim().slice(0, 120);
  el.click();
  return { ok: true, label, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
})
"""


PAGE_METRICS_JS = r"""
(() => {
  const body = document.body || {};
  const doc = document.documentElement || {};
  const scrollHeight = Math.max(
    body.scrollHeight || 0,
    body.offsetHeight || 0,
    doc.clientHeight || 0,
    doc.scrollHeight || 0,
    doc.offsetHeight || 0
  );
  return {
    scrollHeight,
    innerHeight: window.innerHeight || 900,
    scrollY: window.scrollY || 0
  };
})()
"""


SCROLL_TO_JS = r"""
((y) => {
  window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
  return window.scrollY || 0;
})
"""


def find_chrome() -> str | None:
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    return None


def free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


def http_json(url: str, timeout: float = 5.0) -> dict[str, Any]:
    with urllib.request.urlopen(url, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def ws_key() -> str:
    return base64.b64encode(os.urandom(16)).decode("ascii")


class CDP:
    def __init__(self, websocket_url: str):
        self.websocket_url = websocket_url
        self.sock: socket.socket | None = None
        self.next_id = 1

    def connect(self) -> None:
        assert self.websocket_url.startswith("ws://")
        rest = self.websocket_url[5:]
        host_port, path = rest.split("/", 1)
        host, port_text = host_port.split(":")
        port = int(port_text)
        key = ws_key()
        sock = socket.create_connection((host, port), timeout=5)
        request = (
            f"GET /{path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        sock.sendall(request.encode("ascii"))
        response = b""
        while b"\r\n\r\n" not in response:
            response += sock.recv(4096)
        if b"101" not in response.split(b"\r\n", 1)[0]:
            raise RuntimeError("Chrome DevTools websocket upgrade failed")
        self.sock = sock

    def send_frame(self, payload: str) -> None:
        if self.sock is None:
            raise RuntimeError("websocket not connected")
        data = payload.encode("utf-8")
        header = bytearray([0x81])
        length = len(data)
        if length < 126:
            header.append(0x80 | length)
        elif length < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        mask = os.urandom(4)
        header.extend(mask)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
        self.sock.sendall(bytes(header) + masked)

    def recv_exact(self, n: int) -> bytes:
        if self.sock is None:
            raise RuntimeError("websocket not connected")
        chunks = b""
        while len(chunks) < n:
            part = self.sock.recv(n - len(chunks))
            if not part:
                raise RuntimeError("websocket closed")
            chunks += part
        return chunks

    def recv_frame(self) -> str:
        first = self.recv_exact(2)
        opcode = first[0] & 0x0F
        length = first[1] & 0x7F
        if length == 126:
            length = struct.unpack("!H", self.recv_exact(2))[0]
        elif length == 127:
            length = struct.unpack("!Q", self.recv_exact(8))[0]
        masked = bool(first[1] & 0x80)
        mask = self.recv_exact(4) if masked else b""
        payload = self.recv_exact(length)
        if masked:
            payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        if opcode == 8:
            raise RuntimeError("websocket closed by Chrome")
        if opcode != 1:
            return self.recv_frame()
        return payload.decode("utf-8", errors="replace")

    def call(self, method: str, params: dict[str, Any] | None = None, timeout: float = 10.0) -> dict[str, Any]:
        command_id = self.next_id
        self.next_id += 1
        self.send_frame(json.dumps({"id": command_id, "method": method, "params": params or {}}))
        deadline = time.time() + timeout
        while time.time() < deadline:
            message = json.loads(self.recv_frame())
            if message.get("id") == command_id:
                if "error" in message:
                    raise RuntimeError(json.dumps(message["error"]))
                return message.get("result", {})
        raise TimeoutError(method)

    def close(self) -> None:
        if self.sock is not None:
            try:
                self.sock.close()
            except Exception:
                pass


def wait_ready(cdp: CDP, timeout: float = 10.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            result = cdp.call("Runtime.evaluate", {"expression": "document.readyState", "returnByValue": True}, timeout=3)
            if result.get("result", {}).get("value") == "complete":
                time.sleep(0.8)
                return
        except Exception:
            pass
        time.sleep(0.3)


def eval_js(cdp: CDP, expression: str, timeout: float = 8.0) -> Any:
    result = cdp.call("Runtime.evaluate", {"expression": expression, "returnByValue": True, "awaitPromise": True}, timeout=timeout)
    return result.get("result", {}).get("value")


def image_metrics(path: Path) -> dict[str, Any]:
    if Image is None or ImageStat is None:
        return {"width": 0, "height": 0, "brightness": 0.0, "color_variance": 0.0, "visual_complexity": 0.0}
    with Image.open(path) as img:
        rgb = img.convert("RGB")
        stat = ImageStat.Stat(rgb)
        brightness = sum(stat.mean) / 3.0
        variance = sum(stat.stddev) / 3.0
        small = rgb.resize((80, 45))
        pixels = list(small.getdata())
        changes = 0
        total = 0
        for y in range(45):
            for x in range(79):
                a = pixels[y * 80 + x]
                b = pixels[y * 80 + x + 1]
                if abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) > 60:
                    changes += 1
                total += 1
        complexity = (changes / max(1, total)) * 100.0
        return {
            "width": rgb.width,
            "height": rgb.height,
            "brightness": round(brightness, 2),
            "color_variance": round(variance, 2),
            "visual_complexity": round(complexity, 2),
        }


def psychology_rank(metrics: dict[str, Any], clickable_count: int) -> tuple[str, int, str]:
    score = 86
    notes: list[str] = []
    complexity = float(metrics.get("visual_complexity", 0.0))
    variance = float(metrics.get("color_variance", 0.0))
    brightness = float(metrics.get("brightness", 0.0))
    if clickable_count > 28:
        score -= 18
        notes.append("High choice density may increase Hick's-law decision cost.")
    elif clickable_count > 14:
        score -= 8
        notes.append("Moderate choice density; hierarchy must strongly guide the primary action.")
    if complexity > 38:
        score -= 14
        notes.append("High visual complexity can reduce processing fluency and scan speed.")
    elif complexity < 4:
        score -= 6
        notes.append("Very sparse visual structure may under-signal affordances or value.")
    if variance < 18:
        score -= 8
        notes.append("Low contrast/color variance may weaken figure-ground separation.")
    if brightness < 35 or brightness > 230:
        score -= 6
        notes.append("Extreme brightness can reduce readability or perceived polish.")
    score = max(0, min(100, score))
    if score >= 80:
        rank = "strong"
    elif score >= 65:
        rank = "mixed"
    else:
        rank = "weak"
    if not notes:
        notes.append("Visual hierarchy appears reasonably scannable from screenshot metrics.")
    return rank, score, " ".join(notes)


def capture(cdp: CDP, output_dir: Path, name: str, action: str, clickable_count: int) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    result = cdp.call("Page.captureScreenshot", {"format": "jpeg", "quality": 68, "fromSurface": True}, timeout=12)
    image_b64 = result["data"]
    path = output_dir / f"{name}.jpg"
    path.write_bytes(base64.b64decode(image_b64))
    metrics = image_metrics(path)
    rank, score, notes = psychology_rank(metrics, clickable_count)
    url = eval_js(cdp, "location.href") or ""
    title = eval_js(cdp, "document.title") or ""
    return {
        "url": url,
        "title": title,
        "action_label": action,
        "screenshot_path": str(path),
        "screenshot_data_url": f"data:image/jpeg;base64,{image_b64}",
        "clickable_count": clickable_count,
        "psychology_rank": rank,
        "psychology_score": score,
        "visual_notes": notes,
        **metrics,
    }


def capture_scroll_pass(cdp: CDP, output_dir: Path, prefix: str) -> list[dict[str, Any]]:
    metrics = eval_js(cdp, PAGE_METRICS_JS) or {}
    scroll_height = int(metrics.get("scrollHeight") or 0)
    viewport_height = int(metrics.get("innerHeight") or 900)
    max_y = max(0, scroll_height - viewport_height)
    positions: list[int] = [0]
    if max_y > 0:
        positions.append(max_y // 2)
        positions.append(max_y)
    screenshots: list[dict[str, Any]] = []
    seen_positions: set[int] = set()
    for idx, y in enumerate(positions):
        if y in seen_positions:
            continue
        seen_positions.add(y)
        eval_js(cdp, f"{SCROLL_TO_JS}({int(y)})")
        time.sleep(0.8)
        clickables = eval_js(cdp, CLICKABLE_JS) or []
        label = "full-page top"
        if idx == 1 and y != 0:
            label = "full-page middle"
        if y == max_y and max_y > 0:
            label = "full-page bottom"
        screenshots.append(capture(cdp, output_dir, f"{prefix}_scroll_{idx + 1}", label, len(clickables)))
    eval_js(cdp, f"{SCROLL_TO_JS}(0)")
    time.sleep(0.3)
    return screenshots


def same_origin(url: str, href: str) -> bool:
    try:
        from urllib.parse import urlparse

        a = urlparse(url)
        b = urlparse(href)
        return not href or (a.scheme, a.netloc) == (b.scheme, b.netloc)
    except Exception:
        return False


def run(url: str, output_dir: Path, max_clicks: int) -> dict[str, Any]:
    chrome = find_chrome()
    if not chrome:
        return {"ok": False, "reason": "Chrome or Edge was not found for visual screenshot capture.", "screenshots": [], "interactions": []}
    port = free_port()
    profile = tempfile.mkdtemp(prefix="jac-visual-audit-")
    proc = subprocess.Popen(
        [
            chrome,
            "--headless=new",
            "--disable-gpu",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-extensions",
            "--disable-background-networking",
            "--no-proxy-server",
            "--window-size=1366,900",
            f"--user-data-dir={profile}",
            f"--remote-debugging-port={port}",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    cdp: CDP | None = None
    try:
        ws_url = ""
        for _ in range(60):
            try:
                tabs = http_json(f"http://127.0.0.1:{port}/json")
                page_tabs = [tab for tab in tabs if tab.get("type") == "page" and tab.get("webSocketDebuggerUrl")]
                if page_tabs:
                    ws_url = page_tabs[0]["webSocketDebuggerUrl"]
                    break
            except Exception:
                time.sleep(0.2)
        if not ws_url:
            raise RuntimeError("Chrome DevTools endpoint did not start.")
        cdp = CDP(ws_url)
        cdp.connect()
        cdp.call("Page.enable")
        cdp.call("Runtime.enable")
        cdp.call("Page.navigate", {"url": url})
        wait_ready(cdp, 14)
        clickables = eval_js(cdp, CLICKABLE_JS) or []
        safe_clickables = [
            item for item in clickables
            if item.get("safe") and same_origin(url, item.get("href", "")) and item.get("text")
        ][:max_clicks]
        screenshots = capture_scroll_pass(cdp, output_dir, "initial")
        interactions: list[dict[str, Any]] = []
        for i, item in enumerate(safe_clickables):
            cdp.call("Page.navigate", {"url": url})
            wait_ready(cdp, 10)
            before_url = eval_js(cdp, "location.href") or url
            click_result = eval_js(cdp, f"{CLICK_JS}({int(item['index'])})") or {}
            time.sleep(1.2)
            after_url = eval_js(cdp, "location.href") or before_url
            fresh_clickables = eval_js(cdp, CLICKABLE_JS) or []
            shot = capture(cdp, output_dir, f"interaction_{i + 1}", f"clicked: {item.get('text', '')}", len(fresh_clickables))
            interactions.append({
                "step_order": i + 1,
                "element_label": item.get("text", ""),
                "element_tag": item.get("tag", ""),
                "from_url": before_url,
                "to_url": after_url,
                "result": "navigated" if after_url != before_url else "state changed or stayed on page",
                "screenshot_path": shot["screenshot_path"],
                "psychology_rank": shot["psychology_rank"],
                "psychology_score": shot["psychology_score"],
                "visual_notes": shot["visual_notes"],
                "friction_score": max(0, min(100, 100 - int(shot["psychology_score"]))),
            })
            screenshots.append(shot)
        avg_visual = int(sum(int(s["psychology_score"]) for s in screenshots) / max(1, len(screenshots)))
        avg_interaction = int(sum(100 - int(i["friction_score"]) for i in interactions) / max(1, len(interactions))) if interactions else avg_visual
        summary = (
            f"Captured {len(screenshots)} screenshot state(s) and safely clicked {len(interactions)} same-origin visible component(s). "
            f"Average visual psychology score {avg_visual}/100; interaction score {avg_interaction}/100. "
            "No forms were submitted, no credentials entered, no purchases attempted."
        )
        return {
            "ok": True,
            "reason": "",
            "summary": summary,
            "visual_score": avg_visual,
            "interaction_score": avg_interaction,
            "screenshots": screenshots,
            "interactions": interactions,
        }
    except Exception as exc:
        return {"ok": False, "reason": str(exc), "screenshots": [], "interactions": []}
    finally:
        if cdp is not None:
            cdp.close()
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--audit-id", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--max-clicks", type=int, default=8)
    args = parser.parse_args()
    result = run(args.url, Path(args.output_dir) / args.audit_id, max(0, min(args.max_clicks, 12)))
    print(json.dumps(result))


if __name__ == "__main__":
    main()
