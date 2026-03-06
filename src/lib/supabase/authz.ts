import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export const CURATOR_ROLES: UserRole[] = ["admin", "curador"];

export type SessionProfile = {
  userId: string;
  role: UserRole;
  nome: string | null;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await authClient
    .from("profiles")
    .select("id,nome,role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    const fallbackName =
      ((user.user_metadata?.nome as string | undefined) ?? "").trim() ||
      user.email ||
      null;

    const { data: inserted, error: insertError } = await authClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          nome: fallbackName,
          role: "visitante",
        },
        { onConflict: "id" }
      )
      .select("id,nome,role")
      .single();

    if (insertError) {
      throw insertError;
    }

    return {
      userId: inserted.id,
      role: inserted.role as UserRole,
      nome: inserted.nome ?? null,
    };
  }

  return {
    userId: profile.id,
    role: profile.role as UserRole,
    nome: profile.nome ?? null,
  };
}

export async function requireCuratorProfile(): Promise<SessionProfile> {
  const profile = await getSessionProfile();
  if (!profile) {
    throw new Error("Nao autenticado.");
  }
  if (!CURATOR_ROLES.includes(profile.role)) {
    throw new Error("Permissao insuficiente.");
  }
  return profile;
}
