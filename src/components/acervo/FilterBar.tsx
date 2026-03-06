"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { StatusItem, TipoMidia } from "@/types/database";

type Fazenda = { id: string; nome: string };

type Props = {
  fazendas: Fazenda[];
};

const TIPOS: Array<{ value: TipoMidia; label: string }> = [
  { value: "foto", label: "Foto" },
  { value: "video", label: "Video" },
  { value: "documento", label: "Documento" },
  { value: "audio", label: "Audio" },
  { value: "transcricao", label: "Transcricao" },
];

const STATUS_LIST: Array<{ value: StatusItem; label: string }> = [
  { value: "rascunho", label: "Rascunho" },
  { value: "em_revisao", label: "Em Revisao" },
  { value: "aprovado", label: "Aprovado" },
  { value: "arquivado", label: "Arquivado" },
];

export function FilterBar({ fazendas }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const tipo = searchParams.get("tipo") ?? "";
  const status = searchParams.get("status") ?? "";
  const fazenda = searchParams.get("fazenda") ?? "";
  const de = searchParams.get("de") ?? "";
  const ate = searchParams.get("ate") ?? "";

  const hasFilters = !!(tipo || status || fazenda || de || ate);

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) {
      p.set(key, value);
    } else {
      p.delete(key);
    }
    startTransition(() => router.push(`${pathname}?${p.toString()}`));
  }

  function clearAll() {
    startTransition(() => router.push(pathname));
  }

  const selectClass =
    "rounded px-2 py-1.5 border text-sm h-9";
  const selectStyle = {
    borderColor: "var(--border)",
    color: "var(--text-primary)",
    background: "var(--bg-elevated)",
  };

  return (
    <div
      className="glass-card p-4 mb-6 flex flex-wrap items-center gap-2"
    >
      <span
        className="text-xs uppercase tracking-widest mr-1"
        style={{ color: "var(--text-muted)" }}
      >
        Filtros
      </span>

      <select
        value={tipo}
        onChange={(e) => update("tipo", e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        <option value="">Todos os tipos</option>
        {TIPOS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => update("status", e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        <option value="">Todos os status</option>
        {STATUS_LIST.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={fazenda}
        onChange={(e) => update("fazenda", e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        <option value="">Todas as fazendas</option>
        {fazendas.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={de}
        onChange={(e) => update("de", e.target.value)}
        className={selectClass}
        style={selectStyle}
        title="De (data inicio)"
      />
      <input
        type="date"
        value={ate}
        onChange={(e) => update("ate", e.target.value)}
        className={selectClass}
        style={selectStyle}
        title="Ate (data fim)"
      />

      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-xs px-3 py-1.5 rounded h-9"
          style={{
            color: "var(--accent-red)",
            background: "rgba(248,113,113,0.08)",
          }}
        >
          Limpar
        </button>
      )}
    </div>
  );
}
