import { getFazendas } from "@/lib/supabase/data";
import { UploadForm } from "@/components/admin/UploadForm";

export default async function AdminUploadPage() {
  const fazendas = await getFazendas();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <p
          className="text-xs uppercase tracking-widest font-mono mb-3"
          style={{ color: "var(--rc-gold)" }}
        >
          Modulo M8
        </p>
        <h1
          className="text-3xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Upload e Ingestao
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Adicione novos itens ao acervo. O arquivo e enviado diretamente ao
          Supabase Storage e o registro e criado como rascunho para curadoria.
        </p>
      </header>

      <section className="glass-card p-6">
        <UploadForm fazendas={fazendas.map((f) => ({ id: f.id, nome: f.nome }))} />
      </section>
    </div>
  );
}
