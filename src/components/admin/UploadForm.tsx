"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createAcervoItemFromUpload } from "@/app/actions/upload";
import type { TipoMidia } from "@/types/database";

type Fazenda = { id: string; nome: string };

type UploadResult = { success: boolean; id?: string; error?: string } | null;

type Props = {
  fazendas: Fazenda[];
};

const TIPO_LABELS: Record<TipoMidia, string> = {
  foto: "Foto",
  video: "Video",
  documento: "Documento",
  audio: "Audio",
  transcricao: "Transcricao",
};

export function UploadForm({ fazendas }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult>(null);
  const [dragOver, setDragOver] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setResult({ success: false, error: "Selecione um arquivo." });
      return;
    }

    const form = formRef.current!;
    const titulo = (
      form.elements.namedItem("titulo") as HTMLInputElement
    ).value.trim();
    const tipo_midia = (
      form.elements.namedItem("tipo_midia") as HTMLSelectElement
    ).value as TipoMidia;
    const fazenda_id =
      (form.elements.namedItem("fazenda_id") as HTMLSelectElement).value ||
      null;
    const descricao =
      (form.elements.namedItem("descricao") as HTMLTextAreaElement).value.trim() ||
      null;

    if (!titulo) {
      setResult({ success: false, error: "Titulo obrigatorio." });
      return;
    }

    setUploading(true);
    setResult(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("acervo")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (storageError) {
      setUploading(false);
      setResult({ success: false, error: `Storage: ${storageError.message}` });
      return;
    }

    const { data: urlData } = supabase.storage
      .from("acervo")
      .getPublicUrl(storagePath);

    const res = await createAcervoItemFromUpload({
      titulo,
      tipo_midia,
      fazenda_id,
      descricao,
      storage_path: storagePath,
      tamanho_bytes: file.size,
      formato_original: file.type || null,
      url_public: urlData?.publicUrl ?? null,
    });

    setUploading(false);
    setResult(res);

    if (res.success) {
      formRef.current?.reset();
      setFile(null);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
        style={{
          borderColor: dragOver ? "var(--rc-gold)" : "var(--border)",
          background: dragOver ? "var(--rc-gold-dim)" : "transparent",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
          accept="image/*,video/*,audio/*,.pdf,.txt,.vtt"
        />
        {file ? (
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {file.name}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Arraste um arquivo ou clique para selecionar
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Foto, Video, Audio, PDF, TXT, VTT — max 200 MB
            </p>
          </div>
        )}
      </div>

      {/* Titulo */}
      <div>
        <label
          htmlFor="titulo"
          className="text-xs uppercase block mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Titulo *
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          required
          className="w-full rounded-md px-3 py-2 bg-transparent border"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          placeholder="Ex.: Leilao 2026 — lote 31"
        />
      </div>

      {/* Tipo + Fazenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="tipo_midia"
            className="text-xs uppercase block mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Tipo de midia
          </label>
          <select
            id="tipo_midia"
            name="tipo_midia"
            className="w-full rounded-md px-3 py-2 border"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              background: "var(--bg-elevated)",
            }}
            defaultValue="video"
          >
            {(Object.keys(TIPO_LABELS) as TipoMidia[]).map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="fazenda_id"
            className="text-xs uppercase block mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Fazenda
          </label>
          <select
            id="fazenda_id"
            name="fazenda_id"
            className="w-full rounded-md px-3 py-2 border"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              background: "var(--bg-elevated)",
            }}
            defaultValue=""
          >
            <option value="">Nao vinculada</option>
            {fazendas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Descricao */}
      <div>
        <label
          htmlFor="descricao"
          className="text-xs uppercase block mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Descricao
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          className="w-full rounded-md px-3 py-2 bg-transparent border"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          placeholder="Contexto, objetivo e relevancia do item."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2 rounded-md text-sm font-semibold transition-opacity"
          style={{
            background: uploading ? "var(--rc-gold-dim)" : "var(--rc-gold)",
            color: uploading ? "var(--text-muted)" : "#000",
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? "Enviando..." : "Enviar para acervo"}
        </button>
        {file && !uploading && (
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Remover arquivo
          </button>
        )}
      </div>

      {/* Feedback */}
      {result && (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{
            background: result.success
              ? "var(--rc-green-dim)"
              : "rgba(248,113,113,0.08)",
            color: result.success
              ? "var(--rc-green-bright)"
              : "var(--accent-red)",
          }}
        >
          {result.success
            ? `Item salvo com sucesso no acervo. ID: ${result.id}`
            : `Erro: ${result.error}`}
        </div>
      )}
    </form>
  );
}
