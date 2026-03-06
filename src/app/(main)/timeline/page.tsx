import { getTimelineEvents } from "@/lib/supabase/data";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export default async function TimelinePage() {
  const eventosTimeline = await getTimelineEvents();

  const sorted = [...eventosTimeline].sort(
    (a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Modulo M5
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Linha do Tempo
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Cronologia da RC de 1988 a 2026 com marcos tecnicos, narrativos e reputacionais.
        </p>
      </header>

      <section className="space-y-3">
        {sorted.map((evento) => (
          <article key={evento.id} className="glass-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                {evento.tipo}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {formatDate(evento.data_evento)}
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              {evento.titulo}
            </h2>
            <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              {evento.descricao ?? "Sem descricao"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Fonte: {evento.fonte ?? "Nao informada"} {evento.destaque ? "| Destaque" : ""}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
