import { getColecoes } from "@/lib/supabase/data";
import Link from "next/link";

export default async function ColecoesPage() {
  const colecoes = await getColecoes();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Modulo M2
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Colecoes
        </h1>
        <p className="max-w-3xl" style={{ color: "var(--text-secondary)" }}>
          Agrupamentos editoriais para transformar conteudo bruto em narrativa curada.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colecoes.length === 0 ? (
          <article className="glass-card p-6 md:col-span-2">
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhuma colecao criada ainda.
            </p>
          </article>
        ) : (
          colecoes.map((colecao) => (
            <article key={colecao.id} className="glass-card p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                  {colecao.tipo}
                </span>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    color: colecao.publicada ? "var(--rc-green-bright)" : "var(--accent-amber)",
                    background: colecao.publicada ? "var(--rc-green-dim)" : "rgba(245, 158, 11, 0.12)",
                  }}
                >
                  {colecao.publicada ? "Publicada" : "Rascunho"}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                {colecao.titulo}
              </h2>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {colecao.descricao ?? "Sem descricao"}
              </p>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Slug: {colecao.slug} | Itens: {colecao.item_count ?? colecao.items?.length ?? 0}
              </div>
              <Link
                href={`/colecoes/${colecao.slug}`}
                className="inline-block mt-3 text-sm underline"
                style={{ color: "var(--text-muted)" }}
              >
                Abrir colecao →
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
