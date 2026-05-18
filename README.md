# Growth Lab

Growth Lab is a Jac fullstack app for auditing consumer app retention loops, screenshot-based UX/design psychology, and manipulative engagement risk. It crawls a public URL, captures sanitized page evidence, takes safe headless-browser screenshots, clicks only safe same-origin components, and asks an LLM for builder-friendly recommendations.

## What You Need

Install these before running the app from a fresh machine:

- Git, to clone the repository.
- Python 3.11 or newer. The app has been run locally with Python 3.14.
- Node.js 20 or newer, including `npm`, for the Jac-generated React/Vite client.
- Google Chrome or Microsoft Edge. The visual audit helper launches one of these in headless mode for screenshots.
- An OpenAI API key. The app uses `byllm` with `gpt-4o`, so `OPENAI_API_KEY` must be available in the shell that starts the server.

The main app is the Jac app in this directory. The `flair-ui/` folder is a separate TanStack/React prototype and is not required to run the Jac app.

## Get the Code

```powershell
git clone <repo-url>
cd jachacks-engagement-auditor
```

If the repo is nested inside another folder, run all commands from the directory that contains `main.jac`, `jac.toml`, `pages/`, `services/`, and `tools/`.

## Set Up Python

On Windows PowerShell:

```powershell
py -3 -m venv .jac\venv
.\.jac\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install "jaclang==0.15.2" "byllm==0.6.8" "pillow>=12.0.0"
```

On macOS or Linux:

```bash
python3 -m venv .jac/venv
source .jac/venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "jaclang==0.15.2" "byllm==0.6.8" "pillow>=12.0.0"
```

`byllm` brings in LiteLLM/OpenAI support. `pillow` is used by `tools/visual_audit.py` to calculate screenshot brightness, contrast, and visual-complexity metrics.

## Set Up Node

Make sure Node and npm are available:

```powershell
node --version
npm --version
```

You usually do not need to run `npm install` manually for the Jac client. Jac reads the npm dependencies from `jac.toml` and creates the generated client under `.jac/client/` when the app starts or builds.

## Configure the API Key

Set your OpenAI key in the same terminal where you will start the app.

Windows PowerShell:

```powershell
$env:OPENAI_API_KEY = "sk-your-key-here"
```

macOS or Linux:

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Do not commit API keys. `.env` files are ignored by git, but exporting the variable in your shell is the most direct setup.

## Run Locally

From the project root, with the Python virtual environment activated:

```powershell
jac start main.jac --dev --port 8000
```

Then open:

```text
http://127.0.0.1:8000/app
```

The first start can take longer because Jac generates the client app and installs/builds npm dependencies inside `.jac/client/`.

## How to Use the App

1. Open the local URL above.
2. Start a new audit.
3. Enter a public `http://` or `https://` URL.
4. Wait for the crawler, screenshot capture, safe click pass, deterministic checks, and LLM recommendation pass to finish.
5. Review the report sections for visual, textual, interaction, retention-loop, and dark-pattern findings.

The crawler intentionally blocks localhost, private networks, metadata IPs, internal hosts, credentialed URLs, non-HTML resources, oversized pages, form submission, purchases, credential entry, destructive actions, and unsafe cross-origin click-throughs.

## Flair Manual Audit Rubric

The Flair UI/UX rubric lives in `services/flair_rubric.sv.jac`. The GPT-4o prompt asks for a concise manual-style audit, not abstract UX theory or crawler-metric summaries. Each issue must name a concrete page object such as a hero headline, CTA button, navigation bar, pricing section, card grid, product screenshot, references section, form, footer, search bar, cookie banner, or popup.

The model must return strict JSON with:

- `Visual Clarity`, `Textual Clarity`, and `Aesthetics` categories.
- `Low`, `Medium`, or `High` priority.
- `Typography`, `Color`, `Layout`, `Buttons`, `Imagery`, or `Navigation` element.
- `targetElement`, `location`, and `visibleText` so each issue is tied to a specific page element.
- A non-empty problem, recommendation, deduction, and target-matching screenshot/text evidence when available.
- `sectionCoverage` with detected/audited sections and coverage notes.
- No model-calculated final scores.

The server validates every issue, rejects forbidden/vague wording, rejects generic targets like `layout` or `page`, removes mismatched evidence, corrects deduction from priority, and calculates scores in code:

- Start each category at `100`.
- `Low` priority subtracts `1`.
- `Medium` priority subtracts `2`.
- `High` priority subtracts `3`.
- Element never affects scoring.
- Final scores are clamped between `0` and `100`.

Forbidden user-facing language includes phrases such as `captured page states`, `grouped evidence`, `choice density`, `cognitive cost`, `visual anchor`, `improve hierarchy`, `improve clarity`, `make it cleaner`, and crawler internals like clickable counts, screenshot scores, ranks, or computer-vision metrics.

For normal full-page evidence, Flair expects 5 to 9 issues and at least 4 distinct audited targets. If GPT-4o returns too few issues, too few targets, vague language, mismatched target/recommendation text, mismatched evidence, or a one-area audit, the server adds one regeneration request and retries once. If the second pass still fails validation, only valid issues are saved and the limitation is stored.

The GPT-4o call is in `services/llm.sv.jac`, and the crawler screenshot/text evidence is assembled in `services/flair.sv.jac` before being sent to that call.

## Tests

Run the rubric scoring fixture from the project root:

```powershell
.\.jac\venv\Scripts\jac.exe run test_flair_rubric.jac
```

On macOS or Linux:

```bash
.jac/venv/bin/jac run test_flair_rubric.jac
```

The fixture covers the required Jaseci and Blender examples, empty issue lists, score clamping, invalid deduction correction, unknown field rejection, forbidden/vague phrase rejection, generic target rejection, target-bound recommendation validation, mismatched evidence removal, regeneration triggers, page-object validation, and duplicate valid issues being counted by the calculator.

## Generated and Local-Only Files

The `.jac/` directory is generated at runtime and is ignored by git. It can contain:

- `.jac/venv/` for the local Python environment.
- `.jac/client/` for the generated React/Vite client and its `node_modules`.
- `.jac/data/` for the local app database and visual audit screenshots.
- `.jac/server-*.log` for local server logs.

If the app gets into a strange local state, stop the server and remove generated files under `.jac/client/` or `.jac/data/` as needed. Do not delete data you want to keep.

## Troubleshooting

If `jac` is not recognized, activate the virtual environment again or run it directly:

```powershell
.\.jac\venv\Scripts\jac.exe start main.jac --dev --port 8000
```

If the LLM step fails, confirm `OPENAI_API_KEY` is set in the same terminal:

```powershell
$env:OPENAI_API_KEY
```

If screenshots are missing, install or update Google Chrome or Microsoft Edge. The helper looks for standard Windows Chrome/Edge install paths and uses headless browser debugging locally.

If npm/client generation fails, confirm Node 20+ is on `PATH`, then restart `jac start`. The npm dependencies are declared in `jac.toml`.

If a URL is rejected, it is probably blocked by the safety rules. Use a public HTML page with a normal `http://` or `https://` URL.

## Useful Commands

Check the Jac version:

```powershell
jac --version
```

Start without hot reload:

```powershell
jac start main.jac --port 8000
```

Build the generated client:

```powershell
.\.jac\client\configs\node_modules\.bin\vite.cmd build --config .jac/client/configs/vite.config.js
```

Run the standalone visual audit helper:

```powershell
python tools\visual_audit.py --url https://example.com --audit-id test --output-dir .jac\data\visual --max-clicks 3
```
