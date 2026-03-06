"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCuratorProfile } from "@/lib/supabase/authz";
import type { StatusItem } from "@/types/database";

export async function updateItemStatus(
  id: string,
  newStatus: StatusItem
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireCuratorProfile();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Permissao insuficiente.",
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("acervo_items")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/curadoria");
  revalidatePath("/acervo");

  return { success: true };
}
