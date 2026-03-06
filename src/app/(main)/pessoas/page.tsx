import { getPessoas } from "@/lib/supabase/data";
import Link from "next/link";

export default async function PessoasPage() {
  const pessoas = await getPessoas();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Modulo M3
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Pessoas
        </h1>
        <p className="max-w-3xl" style={{ color: "var(--text-secondary)" }}>
          Personagens que constroem a historia, a tecnica e a cultura da RC Agropecuaria.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pessoas.map((pessoa) => (
          <article key={pessoa.id} className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                {pessoa.tipo}
              </span>
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  color: pessoa.ativo ? "var(--rc-green-bright)" : "var(--text-muted)",
                  background: pessoa.ativo ? "var(--rc-green-dim)" : "rgba(255,255,255,0.03)",
                }}
              >
                {pessoa.ativo ? "Ativo" : "Memoria historica"}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              <Link href={`/pessoas/${pessoa.id}`} className="hover:underline">
                {pessoa.nome_completo}
              </Link>
            </h2>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              {pessoa.papel ?? "Sem papel informado"}
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {pessoa.biografia ?? "Sem biografia"}
            </p>
            <div className="text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
              <p>Tempo na RC: {pessoa.tempo_empresa ?? "Nao informado"}</p>
              <p>Citacao: {pessoa.citacao_destaque ?? "Nao cadastrada"}</p>
            </div>
            <Link
              href={`/pessoas/${pessoa.id}`}
              className="inline-block mt-3 text-sm underline"
              style={{ color: "var(--text-muted)" }}
            >
              Ver detalhe →
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
