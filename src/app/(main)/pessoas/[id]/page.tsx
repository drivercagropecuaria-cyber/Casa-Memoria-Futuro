import Link from "next/link";
import { notFound } from "next/navigation";
import { getPessoaById } from "@/lib/supabase/data";

function formatDate(date: string | null) {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default async function PessoaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPessoaById(id);

  if (!detail) {
    notFound();
  }

  const { pessoa, itens, depoimentos } = detail;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Pessoa | Detalhe
        </p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {pessoa.nome_completo}
        </h1>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
          {pessoa.papel ?? "Sem papel informado"} | {pessoa.tipo}
        </p>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {pessoa.biografia ?? "Sem biografia cadastrada."}
        </p>
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Ativo: {pessoa.ativo ? "Sim" : "Nao"}</span>
          <span>Tempo na RC: {pessoa.tempo_empresa ?? "Nao informado"}</span>
          <span>Nascimento: {formatDate(pessoa.data_nascimento)}</span>
        </div>
      </header>

      {pessoa.citacao_destaque ? (
        <section className="glass-card p-6 mb-6">
          <p className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Citacao destaque
          </p>
          <blockquote className="text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>
            &ldquo;{pessoa.citacao_destaque}&rdquo;
          </blockquote>
        </section>
      ) : null}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <article className="glass-card p-6">
          <h2 className="text-sm uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Itens de acervo relacionados ({itens.length})
          </h2>
          {itens.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhum item vinculado no acervo.
            </p>
          ) : (
            <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {itens.map((item) => (
                <li key={item.id}>
                  <Link href={`/acervo/${item.id}`} className="underline">
                    {item.titulo}
                  </Link>
                  {" • "}
                  <span style={{ color: "var(--text-muted)" }}>{item.tipo_midia}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="glass-card p-6">
          <h2 className="text-sm uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Depoimentos ({depoimentos.length})
          </h2>
          {depoimentos.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhum depoimento cadastrado.
            </p>
          ) : (
            <ul className="space-y-4 text-sm">
              {depoimentos.map((depoimento) => (
                <li key={depoimento.id}>
                  <p style={{ color: "var(--text-secondary)" }}>
                    &ldquo;{depoimento.conteudo}&rdquo;
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {depoimento.item_origem ? (
                      <>
                        Origem:{" "}
                        <Link href={`/acervo/${depoimento.item_origem.id}`} className="underline">
                          {depoimento.item_origem.titulo}
                        </Link>
                      </>
                    ) : (
                      "Sem item de origem"
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <Link href="/pessoas" className="text-sm underline" style={{ color: "var(--text-muted)" }}>
        ← Voltar para pessoas
      </Link>
    </div>
  );
}
