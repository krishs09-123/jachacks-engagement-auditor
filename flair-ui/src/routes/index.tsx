import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: SignInPage,
});

/* Screen 01 — Sign Up / Sign In (matches first wireframe tile) */
function SignInPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary">
            <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
            <Sparkles className="w-4 h-4 text-primary-foreground relative" />
          </span>
          <span className="font-display text-2xl leading-none">Flair</span>
        </Link>
      </div>

      <main className="flex-1 grid place-items-center px-6 pb-16">
        <div className="paper-card w-full max-w-md p-10">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {mode === "signin" ? "Welcome back" : "Make an account"}
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight">
            {mode === "signin" ? (
              <>Sign <em className="italic text-primary">in</em></>
            ) : (
              <>Sign <em className="italic text-primary">up</em></>
            )}
          </h1>
          <p className="mt-4 text-muted-foreground">
            Audits, but with flair. Paste a link, get a designer-grade report.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              nav({ to: "/audit" });
            }}
            className="mt-8 space-y-3"
          >
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
              <input
                type="email"
                required
                placeholder="you@studio.com"
                className="mt-1.5 w-full bg-surface border border-border rounded-md px-4 py-3 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 pr-11 outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background/60 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Confirm password</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="mt-1.5 w-full bg-surface border border-border rounded-md px-4 py-3 outline-none focus:border-primary"
                />
              </label>
            )}
            <button
              type="submit"
              className="group w-full mt-3 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-md px-5 py-3 font-medium hover:opacity-90 transition"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </button>
          </form>

          <button
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin" ? "No account? Sign up →" : "Have an account? Sign in →"}
          </button>
        </div>
      </main>
    </div>
  );
}
