import { searchAcervoItems } from "@/lib/supabase/data";

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const results = await searchAcervoItems(query);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Modulo M8
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Busca Avancada
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Pesquisa em titulos, descricoes, tags e transcricoes.
        </p>
      </header>

      <form className="glass-card p-4 mb-6" method="get">
        <label htmlFor="q" className="text-xs uppercase tracking-wider block mb-2" style={{ color: "var(--text-muted)" }}>
          Termo de busca
        </label>
        <div className="flex gap-3">
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Ex.: guzonel, iatf, leilao..."
            className="flex-1 rounded-md px-3 py-2 bg-transparent border"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ background: "var(--rc-gold-dim)", color: "var(--rc-gold)", border: "1px solid var(--border)" }}
          >
            Buscar
          </button>
        </div>
      </form>

      <section className="mb-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {query ? `Resultados para "${query}": ${results.length}` : `Mostrando todos os itens: ${results.length}`}
        </p>
      </section>

      <section className="space-y-3">
        {results.map((item) => (
          <article key={item.id} className="glass-card p-4">
            <div className="text-xs uppercase mb-1" style={{ color: "var(--text-muted)" }}>
              {item.tipo_midia} | {item.status}
            </div>
            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {item.titulo}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {item.descricao ?? "Sem descricao"}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
