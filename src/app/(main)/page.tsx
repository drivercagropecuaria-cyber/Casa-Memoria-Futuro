import Link from "next/link";
import {
  Archive,
  BookOpen,
  Clock,
  Grid3X3,
  MapPin,
  MessageSquareQuote,
  Search,
  Upload,
  Users,
} from "lucide-react";
import { getDashboardStats } from "@/lib/supabase/data";

const modules = [
  { label: "Acervo Digital", href: "/acervo", icon: <Archive size={24} />, desc: "Catalogo pesquisavel de fotos, videos, documentos e transcricoes" },
  { label: "Colecoes", href: "/colecoes", icon: <Grid3X3 size={24} />, desc: "Agrupamentos tematicos curados pela equipe" },
  { label: "Busca", href: "/busca", icon: <Search size={24} />, desc: "Pesquisa em titulos, descricoes, tags e transcricoes" },
  { label: "Pessoas", href: "/pessoas", icon: <Users size={24} />, desc: "Personagens que constroem a historia da RC" },
  { label: "Fazendas", href: "/fazendas", icon: <MapPin size={24} />, desc: "Territorio: 5 fazendas, 12.200 hectares" },
  { label: "Linha do Tempo", href: "/timeline", icon: <Clock size={24} />, desc: "Cronologia interativa de 1988 ate hoje" },
  { label: "Depoimentos", href: "/depoimentos", icon: <MessageSquareQuote size={24} />, desc: "Vozes dos trabalhadores e da fazenda" },
];

export default async function HomePage() {
  const dashboardStats = await getDashboardStats();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="mb-16">
        <p
          className="text-xs font-mono tracking-widest uppercase mb-4"
          style={{ color: "var(--rc-gold)" }}
        >
          Plataforma de Memoria Institucional
        </p>
        <h1
          className="text-4xl font-bold mb-4 leading-tight"
          style={{
            fontFamily: "var(--font-playfair), serif",
            color: "var(--text-primary)",
          }}
        >
          O futuro passa pelo registro
          <br />
          organizado da memoria.
        </h1>
        <p
          className="text-lg max-w-2xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          A Casa de Memoria e Futuro preserva, organiza e transmite 37 anos de
          historia da RC Agropecuaria como patrimonio institucional permanente.
        </p>
      </section>

      {/* Stats Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {dashboardStats.map((s) => (
          <div key={s.label} className="glass-card p-6 text-center">
            <p
              className="text-3xl font-bold mb-1"
              style={{
                fontFamily: "var(--font-playfair), serif",
                color: s.accent,
              }}
            >
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* Module Cards */}
      <section className="mb-16">
        <h2
          className="text-sm font-mono tracking-widest uppercase mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Modulos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="glass-card p-6 group transition-all duration-200 hover:border-[rgba(212,175,55,0.3)] no-underline"
            >
              <div
                className="mb-4 transition-colors"
                style={{ color: "var(--rc-gold)" }}
              >
                {m.icon}
              </div>
              <h3
                className="text-base font-semibold mb-2 transition-colors group-hover:text-white"
                style={{ color: "var(--text-primary)" }}
              >
                {m.label}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {m.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Admin Quick Actions */}
      <section className="mb-16">
        <h2
          className="text-sm font-mono tracking-widest uppercase mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          Acoes rapidas
        </h2>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/upload"
            className="glass-card px-6 py-4 flex items-center gap-3 no-underline transition-all hover:border-[rgba(74,222,128,0.3)]"
          >
            <Upload size={18} style={{ color: "var(--rc-green-bright)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Upload de arquivos
            </span>
          </Link>
          <Link
            href="/admin/curadoria"
            className="glass-card px-6 py-4 flex items-center gap-3 no-underline transition-all hover:border-[rgba(167,139,250,0.3)]"
          >
            <BookOpen size={18} style={{ color: "var(--accent-purple)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Curadoria
            </span>
          </Link>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer
        className="py-8 border-t text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p
          className="text-xs mb-1 font-mono"
          style={{ color: "var(--text-dim)" }}
        >
          Casa de Memoria e Futuro &middot; RC Agropecuaria
        </p>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Fazenda Villa Canabrava &middot; Engenheiro Navarro / Bocaiuva, MG
        </p>
      </footer>
    </div>
  );
}
