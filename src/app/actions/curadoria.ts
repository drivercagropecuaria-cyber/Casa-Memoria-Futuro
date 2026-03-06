"use server";

import { revalidatePath } from "next/cache";
import { createServerDataClient } from "@/lib/supabase/server";
import type { StatusItem } from "@/types/database";

export async function updateItemStatus(
  id: string,
  newStatus: StatusItem
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerDataClient();

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
