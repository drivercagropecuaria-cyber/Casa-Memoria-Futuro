"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthState } from "@/app/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin/upload";
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null
  );

  return (
    <div className="w-full max-w-sm">
      <div className="glass-card p-8">
        <div className="mb-8 text-center">
          <p
            className="text-xs uppercase tracking-widest font-mono mb-2"
            style={{ color: "var(--rc-gold)" }}
          >
            Casa de Memoria e Futuro
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Acesso restrito
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Administracao e curadoria
          </p>
        </div>

        <form action={action} className="grid gap-4">
          <input type="hidden" name="next" value={next} />

          <div>
            <label
              htmlFor="email"
              className="text-xs uppercase block mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md px-3 py-2 bg-transparent border"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="admin@rcagropecuaria.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs uppercase block mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md px-3 py-2 bg-transparent border"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {state?.error && (
            <p
              className="text-sm rounded px-3 py-2"
              style={{
                color: "var(--accent-red)",
                background: "rgba(248,113,113,0.08)",
              }}
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 rounded-md text-sm font-semibold mt-2 transition-opacity"
            style={{
              background: pending ? "var(--rc-gold-dim)" : "var(--rc-gold)",
              color: pending ? "var(--text-muted)" : "#000",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
