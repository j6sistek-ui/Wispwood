import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <img
        src="/game/title.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-bg/70" />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
        <p className="font-display text-sm tracking-[0.28em] text-muted uppercase">Wispwood</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-fg">Sign in</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          A lantern account is made for you when you open the game. Link Google or X only if you want the same name on another device.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="h-12 rounded-xl border border-border bg-elevated px-4 text-sm font-medium text-fg transition-opacity duration-150 hover:opacity-90"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-6 text-sm text-muted underline-offset-4 transition-opacity hover:text-fg hover:underline"
        >
          Back to the clearing
        </Link>
      </div>
    </main>
  );
}
