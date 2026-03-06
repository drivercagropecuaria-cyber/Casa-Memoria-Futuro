"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCuratorProfile } from "@/lib/supabase/authz";
import type { TipoMidia } from "@/types/database";

export async function createAcervoItemFromUpload(opts: {
  titulo: string;
  tipo_midia: TipoMidia;
  fazenda_id: string | null;
  descricao: string | null;
  storage_path: string;
  tamanho_bytes: number;
  formato_original: string | null;
  url_public: string | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireCuratorProfile();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Permissao insuficiente.",
    };
  }

  const supabase = await createServerSupabaseClient();

  const { data: inserted, error } = await supabase
    .from("acervo_items")
    .insert({
      titulo: opts.titulo,
      descricao: opts.descricao,
      tipo_midia: opts.tipo_midia,
      fazenda_id: opts.fazenda_id,
      formato_original: opts.formato_original,
      tamanho_bytes: opts.tamanho_bytes,
      url_original: opts.url_public,
      status: "rascunho",
      data_ingestao: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/acervo");
  revalidatePath("/admin/curadoria");

  return { success: true, id: inserted.id };
}
