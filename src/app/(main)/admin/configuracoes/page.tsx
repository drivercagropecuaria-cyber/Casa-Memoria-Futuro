export default function AdminConfiguracoesPage() {
  const cards = [
    {
      title: "Workspace",
      text: "Ambiente principal da Casa de Memoria e Futuro para acervo e curadoria.",
      value: "MVP v1.0",
    },
    {
      title: "Integracao Supabase",
      text: "Projeto conectado, schema aplicado e leitura server-side ativa com service role.",
      value: "Ativa",
    },
    {
      title: "Politica de acesso",
      text: "Perfis previstos: admin, curador e visitante.",
      value: "Definida",
    },
    {
      title: "Upload e Storage",
      text: "Upload direto para Supabase Storage com criacao automatica de registro em rascunho.",
      value: "Ativo",
    },
    {
      title: "Autenticacao",
      text: "Login com Supabase Auth. Rotas /admin/* protegidas por proxy SSR com validacao de papel.",
      value: "Ativa",
    },
    {
      title: "Curadoria interativa",
      text: "Kanban com botoes de movimentacao entre etapas via Server Actions.",
      value: "Ativo",
    },
    {
      title: "Filtros no acervo",
      text: "Filtros por tipo, status, fazenda e periodo via URL search params.",
      value: "Ativo",
    },
    {
      title: "Proxima entrega",
      text: "Observabilidade de operacao, trilha de auditoria e melhorias de experiencia editorial.",
      value: "Sprint 4",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest font-mono mb-3" style={{ color: "var(--rc-gold)" }}>
          Administracao
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Configuracoes
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Painel institucional para estado do sistema e proximas etapas.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <article key={card.title} className="glass-card p-6">
            <p className="text-xs uppercase mb-2" style={{ color: "var(--text-muted)" }}>
              {card.title}
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {card.text}
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {card.value}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
