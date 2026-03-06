-- ================================================================
-- Migration 003: Bucket de storage para o Acervo
-- ================================================================

-- Criar bucket principal do acervo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'acervo',
  'acervo',
  true,
  209715200,
  ARRAY[
    'image/jpeg','image/png','image/gif','image/webp','image/avif',
    'video/mp4','video/quicktime','video/x-msvideo','video/avi','video/mov',
    'audio/mpeg','audio/mp4','audio/wav','audio/ogg',
    'application/pdf','text/plain','text/vtt'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Politica de upload (qualquer usuario, controle feito na camada de app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'upload_acervo'
  ) THEN
    EXECUTE 'CREATE POLICY "upload_acervo" ON storage.objects
      FOR INSERT TO anon, authenticated
      WITH CHECK (bucket_id = ''acervo'')';
  END IF;
END$$;

-- Politica de leitura publica
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'leitura_acervo'
  ) THEN
    EXECUTE 'CREATE POLICY "leitura_acervo" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = ''acervo'')';
  END IF;
END$$;

-- Politica de delete (somente autenticados)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'delete_acervo'
  ) THEN
    EXECUTE 'CREATE POLICY "delete_acervo" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = ''acervo'')';
  END IF;
END$$;
