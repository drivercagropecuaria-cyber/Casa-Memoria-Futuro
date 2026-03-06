-- ================================================================
-- Migration 007: Storage policy cleanup
-- - Remove legacy public write policies on acervo/thumbnails buckets
-- - Recreate curator-only write policies for acervo bucket
-- ================================================================

DROP POLICY IF EXISTS "acervo_upload_anon" ON storage.objects;
DROP POLICY IF EXISTS "acervo_update_anon" ON storage.objects;
DROP POLICY IF EXISTS "acervo_delete_anon" ON storage.objects;
DROP POLICY IF EXISTS "thumbnails_upload_anon" ON storage.objects;

DROP POLICY IF EXISTS "upload_acervo" ON storage.objects;
DROP POLICY IF EXISTS "update_acervo" ON storage.objects;
DROP POLICY IF EXISTS "delete_acervo" ON storage.objects;

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
