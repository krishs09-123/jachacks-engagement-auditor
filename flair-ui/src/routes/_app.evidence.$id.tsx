import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "./_app.audit";

export const Route = createFileRoute("/_app/evidence/$id")({
  component: EvidencePage,
});

/* Screen 07 — Captured Evidence for Issue #X
   Screenshot from element + text from element
*/
function EvidencePage() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb={`Evidence / Issue #${id}`} />
      <div className="px-6 py-10 max-w-4xl mx-auto w-full">
        <Link to="/report/aesthetics" className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-3 h-3" /> back
        </Link>

        <h1 className="mt-6 font-display text-4xl text-center tracking-tight">
          Captured Evidence for Issue <em className="italic text-primary">#{id}</em>
        </h1>

        <div className="mt-10 paper-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Screenshot from element
          </div>
          <div className="aspect-[16/9] rounded-md bg-surface border border-border grid place-items-center text-muted-foreground text-sm">
            [ rendered element snapshot ]
          </div>
        </div>

        <div className="mt-6 paper-card p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Text from element
          </div>
          <pre className="font-mono text-sm whitespace-pre-wrap text-foreground/80">
{`<button class="cta">Audit now →</button>
/* computed: color #FFF on #ED93B1; ratio 2.4:1 */`}
          </pre>
        </div>
      </div>
    </div>
  );
}
