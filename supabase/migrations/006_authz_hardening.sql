-- ================================================================
-- Migration 006: Authorization hardening
-- - Auto-create profile on auth.users insert
-- - Restrict write access to admin/curador
-- - Prevent self role escalation in profiles
-- - Restrict storage write operations to admin/curador
-- ================================================================

-- ------------------------------------------------
-- Helper functions
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_profile_role(target_user UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = target_user
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_admin(target_user UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT p.role = 'admin'
    FROM public.profiles p
    WHERE p.id = target_user
    LIMIT 1
  ), false)
$$;

CREATE OR REPLACE FUNCTION public.is_curator(target_user UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT p.role IN ('admin', 'curador')
    FROM public.profiles p
    WHERE p.id = target_user
    LIMIT 1
  ), false)
$$;

GRANT EXECUTE ON FUNCTION public.current_profile_role(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_curator(UUID) TO anon, authenticated;

-- ------------------------------------------------
-- Keep profiles synchronized with auth.users
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role)
  VALUES (
    NEW.id,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email, '')), ''),
    'visitante'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

INSERT INTO public.profiles (id, nome, role)
SELECT
  u.id,
  NULLIF(TRIM(COALESCE(u.raw_user_meta_data ->> 'nome', u.email, '')), ''),
  'visitante'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------
-- Replace broad write policies with curator-only writes
-- ------------------------------------------------
DROP POLICY IF EXISTS "escrita_autenticados" ON public.fazendas;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.pessoas;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.acervo_items;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.colecoes;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.colecao_items;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.item_tags;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.item_pessoas;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.depoimentos;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.eventos_timeline;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.tags;
DROP POLICY IF EXISTS "escrita_autenticados" ON public.upload_logs;

CREATE POLICY "escrita_curadores" ON public.fazendas
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.pessoas
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.acervo_items
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.colecoes
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.colecao_items
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.item_tags
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.item_pessoas
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.depoimentos
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.eventos_timeline
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.tags
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

CREATE POLICY "escrita_curadores" ON public.upload_logs
  FOR ALL TO authenticated
  USING (public.is_curator(auth.uid()))
  WITH CHECK (public.is_curator(auth.uid()));

-- ------------------------------------------------
-- Profile policies: self-service without role escalation
-- ------------------------------------------------
DROP POLICY IF EXISTS "perfil_proprio" ON public.profiles;
DROP POLICY IF EXISTS "perfil_select" ON public.profiles;
DROP POLICY IF EXISTS "perfil_insert_proprio" ON public.profiles;
DROP POLICY IF EXISTS "perfil_update_proprio" ON public.profiles;
DROP POLICY IF EXISTS "perfil_admin_manage" ON public.profiles;

CREATE POLICY "perfil_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "perfil_insert_proprio" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'visitante');

CREATE POLICY "perfil_update_proprio" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = public.current_profile_role(auth.uid())
  );

CREATE POLICY "perfil_admin_manage" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------
-- Acervo read policies
-- ------------------------------------------------
DROP POLICY IF EXISTS "leitura_autenticados" ON public.acervo_items;
DROP POLICY IF EXISTS "leitura_autenticados_aprovados" ON public.acervo_items;
DROP POLICY IF EXISTS "leitura_curadores_todos" ON public.acervo_items;

CREATE POLICY "leitura_autenticados_aprovados" ON public.acervo_items
  FOR SELECT TO authenticated
  USING (status = 'aprovado');

CREATE POLICY "leitura_curadores_todos" ON public.acervo_items
  FOR SELECT TO authenticated
  USING (public.is_curator(auth.uid()));

-- ------------------------------------------------
-- Storage write policies
-- ------------------------------------------------
DROP POLICY IF EXISTS "upload_acervo" ON storage.objects;
DROP POLICY IF EXISTS "delete_acervo" ON storage.objects;
DROP POLICY IF EXISTS "update_acervo" ON storage.objects;

CREATE POLICY "upload_acervo" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'acervo'
    AND public.is_curator(auth.uid())
  );

CREATE POLICY "update_acervo" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'acervo'
    AND public.is_curator(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'acervo'
    AND public.is_curator(auth.uid())
  );

CREATE POLICY "delete_acervo" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'acervo'
    AND public.is_curator(auth.uid())
  );
