"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BookOpen,
  Clock,
  Grid3X3,
  Home,
  MapPin,
  MessageSquareQuote,
  Search,
  Settings,
  Upload,
  Users,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  open?: boolean;
  onNavigate?: () => void;
}

const mainNav: NavItem[] = [
  { label: "Inicio", href: "/", icon: <Home size={18} /> },
  { label: "Acervo", href: "/acervo", icon: <Archive size={18} /> },
  { label: "Colecoes", href: "/colecoes", icon: <Grid3X3 size={18} /> },
  { label: "Busca", href: "/busca", icon: <Search size={18} /> },
];

const narrativeNav: NavItem[] = [
  { label: "Pessoas", href: "/pessoas", icon: <Users size={18} /> },
  { label: "Fazendas", href: "/fazendas", icon: <MapPin size={18} /> },
  { label: "Linha do Tempo", href: "/timeline", icon: <Clock size={18} /> },
  {
    label: "Depoimentos",
    href: "/depoimentos",
    icon: <MessageSquareQuote size={18} />,
  },
];

const adminNav: NavItem[] = [
  { label: "Upload", href: "/admin/upload", icon: <Upload size={18} /> },
  { label: "Curadoria", href: "/admin/curadoria", icon: <BookOpen size={18} /> },
  {
    label: "Configuracoes",
    href: "/admin/configuracoes",
    icon: <Settings size={18} />,
  },
];

function NavSection({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div>
      <p className="sidebar-section-label">{label}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              onClick={onNavigate}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ open = false, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <Link href="/" className="block no-underline" onClick={onNavigate}>
          <p
            className="text-xs font-mono tracking-widest uppercase"
            style={{ color: "var(--rc-gold)" }}
          >
            RC Agropecuaria
          </p>
          <h2
            className="text-lg font-bold mt-1"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: "var(--text-primary)",
            }}
          >
            Casa de Memoria
            <br />e Futuro
          </h2>
        </Link>
      </div>
      <div className="sidebar-nav">
        <NavSection label="Navegacao" items={mainNav} onNavigate={onNavigate} />
        <NavSection label="Narrativa" items={narrativeNav} onNavigate={onNavigate} />
        <NavSection label="Administracao" items={adminNav} onNavigate={onNavigate} />
      </div>
      <div
        className="px-6 py-4 text-xs border-t"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-jetbrains), monospace",
        }}
      >
        v1.0.0 &middot; MVP
      </div>
    </aside>
  );
}
