"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

export async function signIn(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const next =
    (formData.get("next") as string | null) || "/admin/upload";

  if (!email || !password) {
    return { error: "Email e senha obrigatorios." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: userError?.message ?? "Falha ao recuperar sessao apos login." };
  }

  const nome =
    ((user.user_metadata?.nome as string | undefined) ?? "").trim() ||
    user.email ||
    null;

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      nome,
      role: "visitante",
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  if (profileError) {
    console.error("[auth:signIn] Falha ao sincronizar perfil", profileError);
  }

  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
