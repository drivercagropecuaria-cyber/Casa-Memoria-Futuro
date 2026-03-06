import { getCuradoriaBuckets } from "@/lib/supabase/data";
import { CuradoriaKanban } from "@/components/admin/CuradoriaKanban";

export default async function AdminCuradoriaPage() {
  const grouped = await getCuradoriaBuckets();

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-widest font-mono mb-3"
          style={{ color: "var(--rc-gold)" }}
        >
          Modulo M7
        </p>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Curadoria
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Fluxo editorial de revisao e aprovacao. Use os botoes para mover
          itens entre etapas do processo.
        </p>
      </header>

      <CuradoriaKanban grouped={grouped} />
    </div>
  );
}
