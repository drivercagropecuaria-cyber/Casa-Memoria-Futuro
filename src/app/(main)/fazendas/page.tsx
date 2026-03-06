import { getFazendas } from "@/lib/supabase/data";
import Link from "next/link";

export default async function FazendasPage() {
  const fazendas = await getFazendas();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Modulo M4
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Fazendas e Territorio
        </h1>
        <p className="max-w-3xl" style={{ color: "var(--text-secondary)" }}>
          Panorama das unidades operacionais e territoriais que sustentam o ciclo completo.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fazendas.map((fazenda) => (
          <article key={fazenda.id} className="glass-card p-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                {fazenda.status}
              </span>
              {fazenda.e_sede_casa ? (
                <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--rc-gold-dim)", color: "var(--rc-gold)" }}>
                  Sede da Casa
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              <Link href={`/fazendas/${fazenda.id}`} className="hover:underline">
                {fazenda.nome}
              </Link>
            </h2>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              {fazenda.municipio ?? "Municipio nao informado"} - {fazenda.estado}
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {fazenda.descricao ?? "Sem descricao"}
            </p>
            <div className="text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
              <p>Funcao: {fazenda.funcao_principal ?? "Nao definida"}</p>
              <p>Area: {fazenda.area_hectares ? `${fazenda.area_hectares} ha` : "Nao informada"}</p>
              <p>Infraestrutura: {fazenda.infraestrutura ?? "Nao detalhada"}</p>
            </div>
            <Link
              href={`/fazendas/${fazenda.id}`}
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
