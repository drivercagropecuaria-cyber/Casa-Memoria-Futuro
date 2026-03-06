import Link from "next/link";
import { notFound } from "next/navigation";
import { getAcervoItemById } from "@/lib/supabase/data";

function formatDate(date: string | null) {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default async function AcervoItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAcervoItemById(id);

  if (!item) {
    notFound();
  }

  const thumb = item.url_thumbnail ?? item.url_original;

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-widest font-mono mb-3"
          style={{ color: "var(--rc-gold)" }}
        >
          Acervo | Detalhe
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          {item.titulo}
        </h1>
        <div className="flex flex-wrap gap-2 text-xs">
          <span
            className="px-2 py-1 rounded uppercase"
            style={{ background: "var(--rc-green-dim)", color: "var(--rc-green-bright)" }}
          >
            {item.tipo_midia}
          </span>
          <span
            className="px-2 py-1 rounded uppercase"
            style={{ background: "var(--rc-gold-dim)", color: "var(--rc-gold)" }}
          >
            {item.status}
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-8">
        <article className="glass-card p-6">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt={item.titulo}
              className="w-full rounded mb-5 max-h-[420px] object-cover border"
              style={{ borderColor: "var(--border)" }}
            />
          ) : null}

          <h2 className="text-sm uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Descricao
          </h2>
          <p className="mb-5" style={{ color: "var(--text-secondary)" }}>
            {item.descricao ?? "Sem descricao cadastrada."}
          </p>

          {item.transcricao ? (
            <>
              <h2 className="text-sm uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Transcricao
              </h2>
              <pre
                className="text-sm whitespace-pre-wrap rounded border p-4 max-h-[320px] overflow-auto"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {item.transcricao}
              </pre>
            </>
          ) : null}
        </article>

        <aside className="space-y-4">
          <article className="glass-card p-5">
            <h2 className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Metadados
            </h2>
            <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>Data criacao: {formatDate(item.data_criacao)}</p>
              <p>Data ingestao: {formatDate(item.data_ingestao)}</p>
              <p>Autor registro: {item.autor_registro ?? "Nao informado"}</p>
              <p>Tom: {item.tom_narrativo ?? "Nao definido"}</p>
              <p>Classificacao: {item.classificacao ?? "Nao definida"}</p>
              <p>
                Fazenda:{" "}
                {item.fazenda ? (
                  <Link href={`/fazendas/${item.fazenda.id}`} className="underline">
                    {item.fazenda.nome}
                  </Link>
                ) : (
                  "Nao vinculada"
                )}
              </p>
            </div>
          </article>

          {item.pessoas && item.pessoas.length > 0 ? (
            <article className="glass-card p-5">
              <h2 className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Pessoas vinculadas
              </h2>
              <ul className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {item.pessoas.map((pessoa) => (
                  <li key={pessoa.id}>
                    <Link href={`/pessoas/${pessoa.id}`} className="underline">
                      {pessoa.nome_completo}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          {item.tags && item.tags.length > 0 ? (
            <article className="glass-card p-5">
              <h2 className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 rounded border"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  >
                    {tag.nome}
                  </span>
                ))}
              </div>
            </article>
          ) : null}

          {item.colecoes && item.colecoes.length > 0 ? (
            <article className="glass-card p-5">
              <h2 className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                Colecoes
              </h2>
              <ul className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {item.colecoes.map((colecao) => (
                  <li key={colecao.id}>
                    <Link href={`/colecoes/${colecao.slug}`} className="underline">
                      {colecao.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </aside>
      </section>

      <Link href="/acervo" className="text-sm underline" style={{ color: "var(--text-muted)" }}>
        ← Voltar para o acervo
      </Link>
    </div>
  );
}
