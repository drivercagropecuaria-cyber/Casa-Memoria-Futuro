import Link from "next/link";
import { notFound } from "next/navigation";
import { getColecaoBySlug } from "@/lib/supabase/data";

function formatDate(date: string | null) {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default async function ColecaoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const colecao = await getColecaoBySlug(slug);

  if (!colecao) {
    notFound();
  }

  const items = colecao.items ?? [];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Colecao | Detalhe
        </p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {colecao.titulo}
        </h1>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {colecao.descricao ?? "Sem descricao cadastrada."}
        </p>
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Slug: {colecao.slug}</span>
          <span>Tipo: {colecao.tipo}</span>
          <span>Itens: {colecao.item_count ?? items.length}</span>
          <span>Criada em: {formatDate(colecao.created_at)}</span>
        </div>
      </header>

      <section className="space-y-4 mb-8">
        {items.length === 0 ? (
          <article className="glass-card p-6">
            <p style={{ color: "var(--text-secondary)" }}>
              Esta colecao ainda nao possui itens vinculados.
            </p>
          </article>
        ) : (
          items.map((item) => {
            const thumb = item.url_thumbnail ?? item.url_original;
            return (
              <article key={item.id} className="glass-card p-5">
                <div className="flex gap-4">
                  <div
                    className="w-28 h-20 rounded overflow-hidden shrink-0 border flex items-center justify-center text-[10px] uppercase"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={item.titulo} className="w-full h-full object-cover" />
                    ) : (
                      "Sem thumb"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                      {item.tipo_midia} | {item.status}
                    </p>
                    <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      <Link href={`/acervo/${item.id}`} className="underline">
                        {item.titulo}
                      </Link>
                    </h2>
                    <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                      {item.descricao ?? "Sem descricao"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
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
                </div>
              </article>
            );
          })
        )}
      </section>

      <Link href="/colecoes" className="text-sm underline" style={{ color: "var(--text-muted)" }}>
        ← Voltar para colecoes
      </Link>
    </div>
  );
}
