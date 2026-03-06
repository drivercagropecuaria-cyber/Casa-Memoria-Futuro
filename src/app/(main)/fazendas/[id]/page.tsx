import Link from "next/link";
import { notFound } from "next/navigation";
import { getFazendaById } from "@/lib/supabase/data";

export default async function FazendaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getFazendaById(id);

  if (!detail) {
    notFound();
  }

  const { fazenda, itens, depoimentos } = detail;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Fazenda | Detalhe
        </p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {fazenda.nome}
        </h1>
        <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
          {fazenda.municipio ?? "Municipio nao informado"} - {fazenda.estado}
        </p>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {fazenda.descricao ?? "Sem descricao cadastrada."}
        </p>
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Status: {fazenda.status}</span>
          <span>Area: {fazenda.area_hectares ? `${fazenda.area_hectares} ha` : "Nao informada"}</span>
          <span>Funcao: {fazenda.funcao_principal ?? "Nao definida"}</span>
          {fazenda.e_sede_casa ? <span>Sede da Casa de Memoria</span> : null}
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <article className="glass-card p-6">
          <h2 className="text-sm uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Itens de acervo ({itens.length})
          </h2>
          {itens.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhum item de acervo vinculado.
            </p>
          ) : (
            <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {itens.map((item) => (
                <li key={item.id}>
                  <Link href={`/acervo/${item.id}`} className="underline">
                    {item.titulo}
                  </Link>
                  {" • "}
                  <span style={{ color: "var(--text-muted)" }}>
                    {item.tipo_midia} | {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="glass-card p-6">
          <h2 className="text-sm uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Depoimentos relacionados ({depoimentos.length})
          </h2>
          {depoimentos.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhum depoimento vinculado aos itens desta fazenda.
            </p>
          ) : (
            <ul className="space-y-4 text-sm">
              {depoimentos.map((depoimento) => (
                <li key={depoimento.id}>
                  <p style={{ color: "var(--text-secondary)" }}>
                    &ldquo;{depoimento.conteudo}&rdquo;
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {depoimento.pessoa ? (
                      <>
                        Pessoa:{" "}
                        <Link href={`/pessoas/${depoimento.pessoa.id}`} className="underline">
                          {depoimento.pessoa.nome_completo}
                        </Link>
                      </>
                    ) : (
                      "Pessoa nao vinculada"
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <Link href="/fazendas" className="text-sm underline" style={{ color: "var(--text-muted)" }}>
        ← Voltar para fazendas
      </Link>
    </div>
  );
}
