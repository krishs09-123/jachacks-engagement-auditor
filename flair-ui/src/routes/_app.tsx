import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Sparkles, LogOut, FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

/* Layout for all authenticated screens.
   - Hamburger ≡ at top-left (matches wireframe top-left icon)
   - Sidebar can be toggled open (matches the FLAIR sidebar wireframe tile)
   - Username / Logout pinned bottom-left
*/
function AppLayout() {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ---- Sidebar ---- */}
      <aside
        className={`${open ? "w-64" : "w-16"} shrink-0 bg-surface border-r border-border flex flex-col transition-[width] duration-300 ease-out`}
      >
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="w-10 h-10 grid place-items-center rounded-md hover:bg-background transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          {open && (
            <Link to="/audit" className="flex items-center gap-2">
              <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </span>
              <span className="font-display text-2xl leading-none">FLAIR</span>
            </Link>
          )}
        </div>

        <nav className="px-2 mt-4 flex-1 space-y-1">
          <SideLink to="/audit" icon={<Plus className="w-4 h-4" />} label="New audit" open={open} active={location.pathname === "/audit"} />
          <SideLink to="/audits" icon={<FileText className="w-4 h-4" />} label="Audits" open={open} active={location.pathname.startsWith("/audits")} />
        </nav>

        <div className="p-3 border-t border-border">
          {open ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">@Username</div>
                <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  <LogOut className="w-3 h-3" /> Logout
                </Link>
              </div>
            </div>
          ) : (
            <Link to="/" className="w-10 h-10 grid place-items-center rounded-md hover:bg-background transition" aria-label="Logout">
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </aside>

      {/* ---- Page content ---- */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function SideLink({
  to, icon, label, open, active,
}: { to: string; icon: React.ReactNode; label: string; open: boolean; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 h-10 rounded-md text-sm transition ${
        active ? "bg-background text-foreground" : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
    >
      {icon}
      {open && <span>{label}</span>}
    </Link>
  );
}
