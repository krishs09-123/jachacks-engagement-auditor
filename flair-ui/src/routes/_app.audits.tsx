import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { PageHeader } from "./_app.audit";

export const Route = createFileRoute("/_app/audits")({
  component: AuditsPage,
});

type Category = "Aesthetics" | "Visual Clarity" | "Textual Clarity";
type Priority = "Low" | "Medium" | "High";
type Element =
  | "Typography"
  | "Color"
  | "Layout"
  | "Buttons"
  | "Imagery"
  | "Navigation";

type Audit = {
  n: number;
  name: string;
  date: string;
  link: string;
  score: number;
  category: Category;
  priority: Priority;
  element: Element;
};

const AUDITS: Audit[] = [
  // luna.studio — one issue per axis
  { n: 1,  name: "luna.studio",     date: "May 14, 2026", link: "luna.studio",     score: 94, category: "Aesthetics",      priority: "Low",    element: "Typography" },
  { n: 2,  name: "luna.studio",     date: "May 14, 2026", link: "luna.studio",     score: 82, category: "Visual Clarity",  priority: "Medium", element: "Color" },
  { n: 3,  name: "luna.studio",     date: "May 14, 2026", link: "luna.studio",     score: 71, category: "Textual Clarity", priority: "High",   element: "Buttons" },

  // northkit.co
  { n: 4,  name: "northkit.co",     date: "May 12, 2026", link: "northkit.co",     score: 88, category: "Aesthetics",      priority: "Medium", element: "Layout" },
  { n: 5,  name: "northkit.co",     date: "May 12, 2026", link: "northkit.co",     score: 81, category: "Visual Clarity",  priority: "Medium", element: "Layout" },
  { n: 6,  name: "northkit.co",     date: "May 12, 2026", link: "northkit.co",     score: 64, category: "Textual Clarity", priority: "High",   element: "Navigation" },

  // paper-press.com
  { n: 7,  name: "paper-press.com", date: "May 09, 2026", link: "paper-press.com", score: 76, category: "Textual Clarity", priority: "High",   element: "Buttons" },
  { n: 8,  name: "paper-press.com", date: "May 09, 2026", link: "paper-press.com", score: 90, category: "Aesthetics",      priority: "Low",    element: "Imagery" },
  { n: 9,  name: "paper-press.com", date: "May 09, 2026", link: "paper-press.com", score: 73, category: "Visual Clarity",  priority: "Medium", element: "Typography" },

  // soft-orbit.xyz
  { n: 10, name: "soft-orbit.xyz",  date: "May 05, 2026", link: "soft-orbit.xyz",  score: 88, category: "Aesthetics",      priority: "Medium", element: "Color" },
  { n: 11, name: "soft-orbit.xyz",  date: "May 05, 2026", link: "soft-orbit.xyz",  score: 79, category: "Visual Clarity",  priority: "Low",    element: "Layout" },

  // atelier-gris.fr
  { n: 12, name: "atelier-gris.fr", date: "Apr 30, 2026", link: "atelier-gris.fr", score: 69, category: "Visual Clarity",  priority: "High",   element: "Navigation" },
  { n: 13, name: "atelier-gris.fr", date: "Apr 30, 2026", link: "atelier-gris.fr", score: 84, category: "Aesthetics",      priority: "Low",    element: "Typography" },
  { n: 14, name: "atelier-gris.fr", date: "Apr 30, 2026", link: "atelier-gris.fr", score: 72, category: "Textual Clarity", priority: "Medium", element: "Buttons" },

  // mira.shop
  { n: 15, name: "mira.shop",       date: "Apr 22, 2026", link: "mira.shop",       score: 91, category: "Textual Clarity", priority: "Low",    element: "Imagery" },
  { n: 16, name: "mira.shop",       date: "Apr 22, 2026", link: "mira.shop",       score: 67, category: "Visual Clarity",  priority: "High",   element: "Color" },
  { n: 17, name: "mira.shop",       date: "Apr 22, 2026", link: "mira.shop",       score: 85, category: "Aesthetics",      priority: "Medium", element: "Layout" },
];

const CATEGORIES: ("All" | Category)[] = ["All", "Aesthetics", "Visual Clarity", "Textual Clarity"];
const PRIORITIES: ("All" | Priority)[] = ["All", "Low", "Medium", "High"];
const ELEMENTS:   ("All" | Element)[]  = ["All", "Typography", "Color", "Layout", "Buttons", "Imagery", "Navigation"];

function AuditsPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("All");
  const [element,  setElement]  = useState<(typeof ELEMENTS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return AUDITS.filter((a) =>
      (category === "All" || a.category === category) &&
      (priority === "All" || a.priority === priority) &&
      (element  === "All" || a.element  === element)  &&
      (query.trim() === "" || a.name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [category, priority, element, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader crumb="Audits" />

      <div className="px-6 py-14 max-w-5xl mx-auto w-full text-center">
        {/* ---- Heading ---- */}
        <div className="animate-fade-up">
          <h1 className="font-display text-[clamp(3.5rem,9vw,7rem)] leading-[0.9] tracking-tight">
            List of <em className="italic text-shimmer">audits</em>
          </h1>
          <p className="mt-4 max-w-md mx-auto text-sm text-muted-foreground">
            A living archive of every site you've audited
          </p>
        </div>

        {/* ---- Search ---- */}
        <div className="mt-10 max-w-md mx-auto animate-fade-up [animation-delay:120ms]">
          <label className="relative block">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search audits…"
              className="w-full bg-card border border-border rounded-full pl-11 pr-5 py-3 text-sm outline-none focus:border-primary transition shadow-sm"
            />
          </label>
        </div>

        {/* ---- Filters ---- */}
        <div className="mt-12 space-y-5 animate-fade-up [animation-delay:200ms]">
          <FilterRow label="Sort by category"  options={CATEGORIES} value={category} onChange={setCategory} />
          <FilterRow label="Sort by priority"  options={PRIORITIES} value={priority} onChange={setPriority} />
          <FilterRow label="Sort by element"   options={ELEMENTS}   value={element}  onChange={setElement} />
        </div>

        {/* ---- Results count ---- */}
        <div className="mt-12 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          Showing {filtered.length} of {AUDITS.length}
        </div>

        {/* ---- Audit cards ---- */}
        <div className="mt-6 grid gap-4">
          {filtered.map((a, i) => (
            <Link
              key={a.n}
              to="/report"
              style={{ animationDelay: `${260 + i * 70}ms` }}
              className="group paper-card hover-lift animate-fade-up text-left px-7 py-6 grid grid-cols-[auto_1fr_auto] items-center gap-6 hover:border-primary"
            >
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
                AUDIT {String(a.n).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <div className="font-display text-3xl leading-none truncate">
                  {a.name}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>{a.date}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate">{a.link}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Tag>{a.category}</Tag>
                  <Tag tone={a.priority === "High" ? "primary" : "default"}>
                    {a.priority} priority
                  </Tag>
                  <Tag>{a.element}</Tag>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-display text-4xl leading-none">{a.score}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    / 100
                  </div>
                </div>
                <span className="w-10 h-10 rounded-full grid place-items-center bg-surface group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:rotate-12">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="paper-card py-16 text-center text-muted-foreground animate-fade-up">
              <div className="font-display text-2xl italic">Nothing matches.</div>
              <div className="text-xs mt-2">Try loosening your filters.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterRow<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground sm:w-44 sm:text-right">
        {label}
      </span>
      <div className="inline-flex flex-wrap justify-center gap-1.5 bg-surface/70 border border-border rounded-full p-1 backdrop-blur">
        {options.map((o) => {
          const active = o === value;
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                active
                  ? "bg-foreground text-background shadow-sm scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Tag({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "primary" }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border ${
        tone === "primary"
          ? "bg-primary/15 border-primary/30 text-foreground"
          : "bg-surface border-border text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
