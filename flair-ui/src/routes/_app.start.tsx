import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "./_app.audit";

export const Route = createFileRoute("/_app/start")({
  component: StartPage,
});

/* Screen 03 — Big "AUDIT NOW" button screen */
function StartPage() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb="Ready" />
      <div className="flex-1 grid place-items-center px-6">
        <button
          onClick={() => nav({ to: "/loading" })}
          className="paper-card px-20 py-16 hover:-translate-y-1 hover:border-primary transition group"
        >
          <div className="font-display text-7xl tracking-tight leading-none">
            AUDIT
            <br />
            <em className="italic text-primary">NOW</em>
          </div>
          <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground group-hover:text-foreground transition">
            Click to begin →
          </div>
        </button>
      </div>
    </div>
  );
}
