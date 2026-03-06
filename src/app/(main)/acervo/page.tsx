import { Suspense } from "react";
import { getAcervoItems, getFazendas } from "@/lib/supabase/data";
import { FilterBar } from "@/components/acervo/FilterBar";
import type { AcervoFilters, TipoMidia, StatusItem } from "@/types/database";

type SearchParams = Promise<{
  tipo?: string;
  status?: string;
  fazenda?: string;
  de?: string;
  ate?: string;
  q?: string;
}>;

function formatDate(date: string | null) {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default async function AcervoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const filters: AcervoFilters = {
    tipo_midia: params.tipo as TipoMidia | undefined,
    status: params.status as StatusItem | undefined,
    fazenda_id: params.fazenda || undefined,
    data_inicio: params.de || undefined,
    data_fim: params.ate || undefined,
    search: params.q || undefined,
  };

  const [acervoItems, fazendas] = await Promise.all([
    getAcervoItems(filters),
    getFazendas(),
  ]);

  const tipoCount = acervoItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.tipo_midia] = (acc[item.tipo_midia] ?? 0) + 1;
    return acc;
  }, {});

  const hasFilters = Object.values(filters).some(Boolean);

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
            ? `${acervoItems.length} item(s) encontrado(s) com os filtros aplicados.`
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
            return (
              <article key={item.id} className="glass-card p-5">
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
                  {item.titulo}
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
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
