import { Suspense } from "react";
import Link from "next/link";
import { getAcervoItemsPaginated, getFazendas } from "@/lib/supabase/data";
import { FilterBar } from "@/components/acervo/FilterBar";
import type { AcervoFilters, TipoMidia, StatusItem } from "@/types/database";

type SearchParams = Promise<{
  tipo?: string;
  status?: string;
  fazenda?: string;
  de?: string;
  ate?: string;
  q?: string;
  page?: string;
  per_page?: string;
}>;

function formatDate(date: string | null) {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-BR");
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

function buildAcervoHref(
  params: Awaited<SearchParams>,
  nextPage: number,
  nextPerPage?: number
) {
  const query = new URLSearchParams();
  if (params.tipo) query.set("tipo", params.tipo);
  if (params.status) query.set("status", params.status);
  if (params.fazenda) query.set("fazenda", params.fazenda);
  if (params.de) query.set("de", params.de);
  if (params.ate) query.set("ate", params.ate);
  if (params.q) query.set("q", params.q);

  const perPage = nextPerPage ?? parsePositiveInt(params.per_page, 12);
  if (perPage !== 12) query.set("per_page", String(perPage));
  if (nextPage > 1) query.set("page", String(nextPage));

  const qs = query.toString();
  return qs ? `/acervo?${qs}` : "/acervo";
}

export default async function AcervoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = parsePositiveInt(params.page, 1);
  const perPage = parsePositiveInt(params.per_page, 12);

  const filters: AcervoFilters = {
    tipo_midia: params.tipo as TipoMidia | undefined,
    status: params.status as StatusItem | undefined,
    fazenda_id: params.fazenda || undefined,
    data_inicio: params.de || undefined,
    data_fim: params.ate || undefined,
    search: params.q || undefined,
    page,
    per_page: perPage,
  };

  const [acervoPage, fazendas] = await Promise.all([
    getAcervoItemsPaginated(filters),
    getFazendas(),
  ]);
  const acervoItems = acervoPage.data;

  const tipoCount = acervoItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.tipo_midia] = (acc[item.tipo_midia] ?? 0) + 1;
    return acc;
  }, {});

  const hasFilters = Object.values(filters).some(Boolean);
  const totalPages = acervoPage.total_pages;
  const hasPrev = acervoPage.page > 1;
  const hasNext = acervoPage.page < totalPages;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-widest font-mono mb-3"
          style={{ color: "var(--rc-gold)" }}
        >
          Modulo M1
        </p>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Acervo Digital
        </h1>
        <p className="max-w-3xl" style={{ color: "var(--text-secondary)" }}>
          {hasFilters
            ? `${acervoPage.total} item(s) encontrado(s) com os filtros aplicados.`
            : "Catalogo completo da Casa de Memoria e Futuro."}
        </p>
      </header>

      <Suspense>
        <FilterBar fazendas={fazendas.map((f) => ({ id: f.id, nome: f.nome }))} />
      </Suspense>

      {!hasFilters && Object.keys(tipoCount).length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(tipoCount).map(([tipo, total]) => (
            <div key={tipo} className="glass-card p-4">
              <p
                className="text-xs uppercase mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {tipo}
              </p>
              <p
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {total}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-4">
        {acervoItems.length === 0 ? (
          <div className="glass-card p-6">
            <p style={{ color: "var(--text-secondary)" }}>
              {hasFilters
                ? "Nenhum item encontrado com esses filtros."
                : "Sem itens no acervo ainda. Use o modulo de upload para iniciar a base."}
            </p>
          </div>
        ) : (
          acervoItems.map((item) => {
            const fazenda = item.fazenda;
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
                      <img
                        src={thumb}
                        alt={item.titulo}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      "Sem thumb"
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className="px-2 py-1 rounded text-xs uppercase"
                        style={{
                          background: "var(--rc-green-dim)",
                          color: "var(--rc-green-bright)",
                        }}
                      >
                        {item.tipo_midia}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs uppercase"
                        style={{
                          background: "var(--rc-gold-dim)",
                          color: "var(--rc-gold)",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h2
                      className="text-lg font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <Link href={`/acervo/${item.id}`} className="hover:underline">
                        {item.titulo}
                      </Link>
                    </h2>
                    <p
                      className="text-sm mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.descricao ?? "Sem descricao cadastrada."}
                    </p>
                    <div
                      className="flex flex-wrap gap-4 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span>Data: {formatDate(item.data_criacao)}</span>
                      <span>Fazenda: {fazenda?.nome ?? "Nao vinculada"}</span>
                      <span>Tom: {item.tom_narrativo ?? "Nao definido"}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {acervoPage.total > 0 && (
        <footer className="mt-8 glass-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Pagina {acervoPage.page} de {totalPages} | {acervoPage.total} item(s)
            </div>
            <div className="flex items-center gap-2">
              {[12, 24, 48].map((size) => (
                <Link
                  key={size}
                  href={buildAcervoHref(params, 1, size)}
                  className="text-xs px-2 py-1 rounded border"
                  style={{
                    borderColor: "var(--border)",
                    color:
                      perPage === size ? "var(--rc-gold)" : "var(--text-muted)",
                  }}
                >
                  {size}/pag
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {hasPrev ? (
                <Link
                  href={buildAcervoHref(params, acervoPage.page - 1)}
                  className="text-sm px-3 py-1.5 rounded border"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  ← Anterior
                </Link>
              ) : (
                <span className="text-sm px-3 py-1.5 rounded border opacity-50" style={{ borderColor: "var(--border)" }}>
                  ← Anterior
                </span>
              )}
              {hasNext ? (
                <Link
                  href={buildAcervoHref(params, acervoPage.page + 1)}
                  className="text-sm px-3 py-1.5 rounded border"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  Proxima →
                </Link>
              ) : (
                <span className="text-sm px-3 py-1.5 rounded border opacity-50" style={{ borderColor: "var(--border)" }}>
                  Proxima →
                </span>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
