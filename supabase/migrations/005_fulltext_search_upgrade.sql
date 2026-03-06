-- ================================================================
-- Migration 005: Full-text search hardening (Sprint 3)
-- - garante extensoes
-- - reforca trigger/search_vector
-- - atualiza registros existentes
-- ================================================================

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.update_acervo_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.titulo, ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.descricao, ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(COALESCE(NEW.transcricao, ''))), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS acervo_search_update ON public.acervo_items;

CREATE TRIGGER acervo_search_update
  BEFORE INSERT OR UPDATE ON public.acervo_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_acervo_search_vector();

UPDATE public.acervo_items
SET search_vector =
  setweight(to_tsvector('portuguese', unaccent(COALESCE(titulo, ''))), 'A') ||
  setweight(to_tsvector('portuguese', unaccent(COALESCE(descricao, ''))), 'B') ||
  setweight(to_tsvector('portuguese', unaccent(COALESCE(transcricao, ''))), 'C');

CREATE INDEX IF NOT EXISTS idx_acervo_search ON public.acervo_items USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_acervo_titulo_trgm ON public.acervo_items USING gin (titulo gin_trgm_ops);
