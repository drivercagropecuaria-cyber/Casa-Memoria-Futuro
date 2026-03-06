"use client";

import { useState, useTransition } from "react";
import { updateItemStatus } from "@/app/actions/curadoria";
import type { AcervoItem, StatusItem } from "@/types/database";

const STATUS_ORDER: StatusItem[] = [
  "rascunho",
  "em_revisao",
  "aprovado",
  "arquivado",
];

const STATUS_LABELS: Record<StatusItem, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em Revisao",
  aprovado: "Aprovado",
  arquivado: "Arquivado",
};

type CardItem = Pick<AcervoItem, "id" | "titulo" | "tipo_midia" | "status">;
type Grouped = Record<StatusItem, CardItem[]>;

export function CuradoriaKanban({ grouped }: { grouped: Grouped }) {
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  function handleMove(id: string, newStatus: StatusItem) {
    startTransition(async () => {
      const result = await updateItemStatus(id, newStatus);
      if (!result.success) {
        setActionError(result.error ?? "Falha ao mover item.");
      } else {
        setActionError(null);
      }
    });
  }

  return (
    <div>
      {actionError ? (
        <p
          className="mb-4 text-sm rounded px-3 py-2"
          style={{
            color: "var(--accent-red)",
            background: "rgba(248,113,113,0.08)",
          }}
        >
          {actionError}
        </p>
      ) : null}

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.15s" }}
      >
        {STATUS_ORDER.map((status) => {
          const items = grouped[status] ?? [];
          const idx = STATUS_ORDER.indexOf(status);
          const nextStatus = STATUS_ORDER[idx + 1] as StatusItem | undefined;
          const prevStatus = STATUS_ORDER[idx - 1] as StatusItem | undefined;

          return (
            <div key={status} className="glass-card p-4">
              <h2
                className="text-sm uppercase tracking-wide mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {STATUS_LABELS[status]}{" "}
                <span
                  className="ml-1 px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "var(--bg-hover)" }}
                >
                  {items.length}
                </span>
              </h2>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Sem itens neste estagio.
                  </p>
                ) : (
                  items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded border p-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p
                        className="text-sm font-medium mb-1 leading-snug"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.titulo}
                      </p>
                      <p
                        className="text-xs mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.tipo_midia}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {prevStatus && (
                          <button
                            onClick={() => handleMove(item.id, prevStatus)}
                            disabled={isPending}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: "var(--bg-hover)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {"<-"} {STATUS_LABELS[prevStatus]}
                          </button>
                        )}
                        {nextStatus && (
                          <button
                            onClick={() => handleMove(item.id, nextStatus)}
                            disabled={isPending}
                            className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{
                              background: "var(--rc-gold-dim)",
                              color: "var(--rc-gold)",
                            }}
                          >
                            {STATUS_LABELS[nextStatus]} {"->"}
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
