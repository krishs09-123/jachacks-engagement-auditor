import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_app/audit")({
  component: AuditInputPage,
});

/* Screen 02 — INSERT LINK TO AUDIT (paste link + "Must be valid, public domain link") */
function AuditInputPage() {
  const [url, setUrl] = useState("");
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb="New audit" />

      <div className="flex-1 grid place-items-center px-6">
        <div className="w-full max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Insert link to audit:
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!url.trim()) return;
              nav({ to: "/start" });
            }}
            className="paper-card p-2 flex items-center gap-2"
          >
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="paste link"
              className="flex-1 bg-transparent outline-none px-4 py-4 text-center text-lg placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              className="w-12 h-12 grid place-items-center rounded-[calc(var(--radius)-4px)] bg-primary text-primary-foreground hover:opacity-90 transition"
              aria-label="Continue"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">* Must be a valid, public domain link.</p>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ crumb }: { crumb: string }) {
  return (
    <header className="px-6 py-5 border-b border-border flex items-center justify-between">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{crumb}</div>
      <div className="text-xs font-mono text-muted-foreground">flair.</div>
    </header>
  );
}
