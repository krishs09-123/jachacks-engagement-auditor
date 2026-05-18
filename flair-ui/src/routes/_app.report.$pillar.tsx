import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera } from "lucide-react";
import { PageHeader } from "./_app.audit";

export const Route = createFileRoute("/_app/report/$pillar")({
  component: PillarPage,
});

type Tagged = { text: string; priority: "High" | "Medium" | "Low"; element: string };
type Issue = { n: string; title: string; evidence: string; priority: "High" | "Medium" | "Low"; element: string; recs: Tagged[] };

const PILLAR_DATA: Record<string, { label: string; score: number; issues: Issue[] }> = {
  aesthetics: {
    label: "Aesthetics", score: 96,
    issues: [
      { n: "1", title: "CTA contrast falls below WCAG AA on hero",
        evidence: "Hero button uses #ED93B1 on #F6F4F7, ratio 2.4:1.",
        priority: "High", element: "Button",
        recs: [
          { text: "Darken accent to #C7517A", priority: "High", element: "Color token" },
          { text: "Add 1px ink outline on hover", priority: "Medium", element: "Button" },
        ] },
      { n: "2", title: "Type scale compresses between H1 and H2",
        evidence: "H1 56px, H2 52px — only 8% difference.",
        priority: "Medium", element: "Typography",
        recs: [
          { text: "Drop H2 to 36px", priority: "Medium", element: "Heading" },
          { text: "Increase H1 to clamp(3rem, 8vw, 5rem)", priority: "Low", element: "Heading" },
        ] },
    ],
  },
  textual: {
    label: "Textual Clarity", score: 88,
    issues: [
      { n: "1", title: "Voice drifts between marketing & docs",
        evidence: "Pricing reads playful; docs read formal.",
        priority: "Medium", element: "Copy",
        recs: [
          { text: "Define 3 voice rules", priority: "High", element: "Guidelines" },
          { text: "Pass over /docs/* headings", priority: "Medium", element: "Headings" },
        ] },
      { n: "2", title: "Microcopy labels duplicate adjacent headings",
        evidence: "Form section: 'Account' heading + 'Account info' label.",
        priority: "Low", element: "Form label",
        recs: [
          { text: "Remove redundant label", priority: "Low", element: "Form label" },
          { text: "Use placeholder for hint", priority: "Low", element: "Input" },
        ] },
    ],
  },
  visual: {
    label: "Visual Clarity", score: 92,
    issues: [
      { n: "1", title: "Focus path competes with secondary chips",
        evidence: "Primary CTA and 3 chips share similar weight.",
        priority: "High", element: "CTA",
        recs: [
          { text: "Demote chips to outline", priority: "Medium", element: "Chip" },
          { text: "Reserve fill for one action", priority: "High", element: "Button" },
        ] },
      { n: "2", title: "Spacing rhythm breaks at 768px",
        evidence: "Gaps jump from 24px → 40px at tablet breakpoint.",
        priority: "Medium", element: "Layout",
        recs: [
          { text: "Set --gap: clamp(16px, 3vw, 32px)", priority: "Medium", element: "Token" },
          { text: "Audit grid gaps", priority: "Low", element: "Grid" },
        ] },
    ],
  },
};

function TagRow({ priority, element }: { priority: string; element: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] uppercase tracking-widest font-mono">
        Priority · {priority}
      </span>
      <span className="px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] uppercase tracking-widest font-mono">
        Element · {element}
      </span>
    </div>
  );
}

/* Screen 06 — {Pillar} - 96/100, Issues + Recommendations columns
   Matches the wireframe: two columns with rows per issue, "view captured evidence →"
*/
function PillarPage() {
  const { pillar } = Route.useParams();
  const data = PILLAR_DATA[pillar] ?? PILLAR_DATA.aesthetics;
  const dash = (data.score / 100) * 251.2;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb={`Report / ${data.label}`} />
      <div className="px-6 py-10 max-w-6xl mx-auto w-full">
        <Link to="/report" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-3 h-3" /> back to report
        </Link>

        <div className="mt-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Website Name — Audit Report
          </div>
          <div className="mt-3 inline-flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} 251.2`} />
              </svg>
              <div className="absolute inset-0 grid place-items-center font-display text-lg leading-none">
                {data.score}
              </div>
            </div>
            <h1 className="font-display text-5xl tracking-tight">
              {data.label} — <em className="italic text-primary">{data.score}/100</em>
            </h1>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-[80px_1fr_1fr] gap-6 text-xs uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-3">
          <div></div>
          <div>Issues</div>
          <div>Recommendations</div>
        </div>

        <div className="divide-y divide-border">
          {data.issues.map((iss) => (
            <div key={iss.n} className="grid grid-cols-[80px_1fr_1fr] gap-6 py-8 items-start">
              <div className="font-mono text-sm text-muted-foreground">#{iss.n}</div>

              <div className="paper-card p-5">
                <h3 className="font-display text-2xl leading-tight">{iss.title}</h3>
                <div className="mt-3 text-xs font-mono text-muted-foreground">
                  {iss.evidence}
                </div>
                <TagRow priority={iss.priority} element={iss.element} />
                <Link
                  to="/evidence/$id"
                  params={{ id: iss.n }}
                  className="mt-3 inline-flex items-center gap-1 text-xs hover:text-primary transition"
                >
                  <Camera className="w-3 h-3" /> view captured evidence →
                </Link>
              </div>

              <div className="space-y-4">
                {iss.recs.map((r) => (
                  <div key={r.text} className="paper-card p-5">
                    <div className="font-display text-lg leading-tight">{r.text}</div>
                    <TagRow priority={r.priority} element={r.element} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
