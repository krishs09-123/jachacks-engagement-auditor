import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "./_app.audit";

export const Route = createFileRoute("/_app/loading")({
  component: LoadingPage,
});

const PHRASES = [
  "measuring whitespace…",
  "reading between the lines…",
  "checking contrast ratios…",
  "judging your font pairings (gently)…",
  "looking for vibes…",
];

/* Screen 04 — loading… (alternating catchphrases) */
function LoadingPage() {
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const cycle = setInterval(() => setIdx((i) => (i + 1) % PHRASES.length), 900);
    const done = setTimeout(() => nav({ to: "/report" }), 3600);
    return () => { clearInterval(cycle); clearTimeout(done); };
  }, [nav]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb="Auditing" />
      <div className="flex-1 grid place-items-center px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 paper-card px-8 py-5">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="font-display text-3xl italic">loading…</span>
          </div>
          <div className="mt-8 font-display text-2xl italic text-muted-foreground transition-opacity duration-500">
            ({PHRASES[idx]})
          </div>
        </div>
      </div>
    </div>
  );
}
