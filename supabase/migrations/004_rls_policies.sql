-- ================================================================
-- Migration 004: Habilitar RLS e criar políticas em todas as tabelas públicas
-- Corrigido em relação ao plano original:
--   - colecoes usa coluna "publicada" (boolean), não "status"
--   - acervo_items status público = 'aprovado' (não existe 'publicado' no enum)
-- ================================================================

-- ============================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================================
ALTER TABLE fazendas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE acervo_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE colecoes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE colecao_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_pessoas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE depoimentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS DE LEITURA PÚBLICA (visitantes anônimos podem LER)
-- ============================================================
CREATE POLICY "leitura_publica" ON fazendas
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "leitura_publica" ON pessoas
  FOR SELECT TO anon, authenticated USING (true);

-- Colecoes: visitantes veem apenas as publicadas (publicada = true)
CREATE POLICY "leitura_publica" ON colecoes
  FOR SELECT TO anon, authenticated USING (publicada = true);

CREATE POLICY "leitura_publica" ON colecao_items
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "leitura_publica" ON item_tags
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "leitura_publica" ON item_pessoas
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "leitura_publica" ON depoimentos
  FOR SELECT TO anon, authenticated USING (publicado = true);

CREATE POLICY "leitura_publica" ON eventos_timeline
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "leitura_publica" ON tags
  FOR SELECT TO anon, authenticated USING (true);

-- Acervo: visitantes só veem itens aprovados
CREATE POLICY "leitura_publica_aprovados" ON acervo_items
  FOR SELECT TO anon USING (status = 'aprovado');

-- Autenticados veem todos os itens (para curadoria)
CREATE POLICY "leitura_autenticados" ON acervo_items
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- POLÍTICAS DE ESCRITA — APENAS USUÁRIOS AUTENTICADOS
-- ============================================================
CREATE POLICY "escrita_autenticados" ON fazendas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON pessoas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON acervo_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON colecoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON colecao_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON item_tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON item_pessoas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON depoimentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON eventos_timeline
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON upload_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Profiles: usuário só vê e edita o próprio perfil
CREATE POLICY "perfil_proprio" ON profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Audit log: apenas leitura para autenticados
CREATE POLICY "auditoria_autenticados" ON audit_log
  FOR SELECT TO authenticated USING (true);

-- ============================================================
-- CORRIGIR FUNÇÕES COM search_path MUTÁVEL (aviso de segurança)
-- ============================================================
ALTER FUNCTION public.update_acervo_search_vector() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
