import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "./_app.audit";

export const Route = createFileRoute("/_app/report")({
  component: ReportLayout,
});

function ReportLayout() {
  const { location } = useRouterState();
  const isIndex = location.pathname === "/report" || location.pathname === "/report/";
  if (isIndex) return <ReportOverview />;
  return <Outlet />;
}

/* Screen 05 — Website Name - Audit Report
   3 score rings with arrows between them (Aesthetics 96/100 top,
   Textual Clarity, Visual Clarity bottom). Click a ring → pillar detail.
*/
function ReportOverview() {
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb="Audit report" />
      <div className="px-6 py-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Website Name — Audit Report
          </div>
          <div className="text-sm font-mono text-muted-foreground">
            https://specific-url-crawled.com/
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto relative">
          {/* Top: Aesthetics */}
          <div className="flex justify-center">
            <ScorePillar to="/report/aesthetics" label="Aesthetics" score={96} />
          </div>

          {/* Arrows — pure SVG to mirror the wireframe's connecting lines */}
          <svg viewBox="0 0 600 200" className="w-full h-40 my-2 text-foreground/30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M 300 0 C 300 80, 140 80, 140 180" />
            <path d="M 300 0 C 300 80, 460 80, 460 180" />
            <polyline points="135,170 140,180 145,170" />
            <polyline points="455,170 460,180 465,170" />
          </svg>

          {/* Bottom: Textual + Visual */}
          <div className="grid grid-cols-2 gap-12 max-w-2xl mx-auto -mt-4">
            <ScorePillar to="/report/textual" label="Textual Clarity" score={88} />
            <ScorePillar to="/report/visual" label="Visual Clarity" score={92} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScorePillar({ to, label, score }: { to: string; label: string; score: number }) {
  const dash = (score / 100) * 251.2;
  return (
    <Link
      to={to}
      className="paper-card p-6 w-56 flex flex-col items-center text-center hover:border-primary hover:-translate-y-1 transition"
    >
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface)" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} 251.2`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl leading-none">{score}/</span>
          <span className="font-display text-3xl leading-none">100</span>
        </div>
      </div>
      <div className="mt-4 text-sm font-medium inline-flex items-center gap-1">
        {label} <span aria-hidden>→</span>
      </div>
    </Link>
  );
}
