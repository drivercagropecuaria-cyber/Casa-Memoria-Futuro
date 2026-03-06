import { getDepoimentos } from "@/lib/supabase/data";

export default async function DepoimentosPage() {
  const depoimentos = await getDepoimentos();

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Modulo M6
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Depoimentos
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Vozes da fazenda como patrimonio imaterial, com contexto e vinculo ao acervo.
        </p>
      </header>

      <section className="space-y-4">
        {depoimentos.map((depoimento) => (
          <article key={depoimento.id} className="glass-card p-6">
            <p className="text-xs uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              {depoimento.contexto ?? "Sem contexto"} | {depoimento.publicado ? "Publicado" : "Rascunho"}
            </p>
            <blockquote className="text-lg leading-relaxed mb-4" style={{ color: "var(--text-primary)" }}>
              &ldquo;{depoimento.conteudo}&rdquo;
            </blockquote>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>{depoimento.pessoa?.nome_completo ?? "Pessoa nao vinculada"}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {depoimento.data_registro
                  ? new Date(depoimento.data_registro).toLocaleDateString("pt-BR")
                  : "Data nao informada"}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
