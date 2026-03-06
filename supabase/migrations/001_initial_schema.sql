-- ================================================================
-- Casa de Memoria e Futuro — Initial Schema
-- Migration 001
-- ================================================================

-- Enums
CREATE TYPE tipo_midia AS ENUM ('foto', 'video', 'documento', 'audio', 'transcricao');
CREATE TYPE status_item AS ENUM ('rascunho', 'em_revisao', 'aprovado', 'arquivado');
CREATE TYPE tom_narrativo AS ENUM ('tecnico', 'poetico', 'afetivo', 'combativo', 'celebratorio');
CREATE TYPE classificacao_tipo AS ENUM ('fato', 'inferencia', 'hipotese');
CREATE TYPE tipo_pessoa AS ENUM ('proprietario', 'familiar', 'colaborador', 'consultor', 'parceiro');
CREATE TYPE status_fazenda AS ENUM ('ativa', 'inativa', 'incerta');
CREATE TYPE tipo_colecao AS ENUM ('tematica', 'cronologica', 'editorial', 'educativa');
CREATE TYPE tipo_evento AS ENUM ('fundacao', 'marco', 'leilao', 'crescimento', 'incidente', 'midia', 'pessoal');
CREATE TYPE user_role AS ENUM ('admin', 'curador', 'visitante');
CREATE TYPE categoria_tag AS ENUM ('tema', 'periodo', 'formato', 'tom', 'geral');
CREATE TYPE operacao_audit AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ================================================================
-- PROFILES (extends auth.users)
-- ================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  role user_role NOT NULL DEFAULT 'visitante',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- FAZENDAS
-- ================================================================
CREATE TABLE fazendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  municipio TEXT,
  estado TEXT NOT NULL DEFAULT 'MG',
  gps_lat DECIMAL,
  gps_lng DECIMAL,
  funcao_principal TEXT,
  funcoes_secundarias TEXT[],
  area_hectares DECIMAL,
  infraestrutura TEXT,
  status status_fazenda NOT NULL DEFAULT 'ativa',
  descricao TEXT,
  foto_url TEXT,
  e_sede_casa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- PESSOAS
-- ================================================================
CREATE TABLE pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  papel TEXT,
  tipo tipo_pessoa NOT NULL DEFAULT 'colaborador',
  biografia TEXT,
  data_nascimento DATE,
  tempo_empresa TEXT,
  citacao_destaque TEXT,
  foto_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- TAGS
-- ================================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  categoria categoria_tag NOT NULL DEFAULT 'geral'
);

-- ================================================================
-- ACERVO_ITEMS (master table)
-- ================================================================
CREATE TABLE acervo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_midia tipo_midia NOT NULL,
  formato_original TEXT,
  tamanho_bytes BIGINT,
  duracao_segundos INTEGER,
  data_criacao TIMESTAMPTZ,
  data_ingestao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_publicacao TIMESTAMPTZ,
  status status_item NOT NULL DEFAULT 'rascunho',
  curador_id UUID REFERENCES profiles(id),
  autor_registro TEXT,
  url_original TEXT,
  url_thumbnail TEXT,
  url_proxy TEXT,
  transcricao TEXT,
  metadata_exif JSONB,
  gps_lat DECIMAL,
  gps_lng DECIMAL,
  fazenda_id UUID REFERENCES fazendas(id),
  tom_narrativo tom_narrativo,
  classificacao classificacao_tipo,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION update_acervo_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', COALESCE(NEW.titulo, '')), 'A') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.descricao, '')), 'B') ||
    setweight(to_tsvector('portuguese', COALESCE(NEW.transcricao, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER acervo_search_update
  BEFORE INSERT OR UPDATE ON acervo_items
  FOR EACH ROW EXECUTE FUNCTION update_acervo_search_vector();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER acervo_updated_at
  BEFORE UPDATE ON acervo_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fazendas_updated_at
  BEFORE UPDATE ON fazendas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pessoas_updated_at
  BEFORE UPDATE ON pessoas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- COLECOES
-- ================================================================
CREATE TABLE colecoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo tipo_colecao NOT NULL DEFAULT 'tematica',
  slug TEXT NOT NULL UNIQUE,
  capa_url TEXT,
  publicada BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  curador_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER colecoes_updated_at
  BEFORE UPDATE ON colecoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- JUNCTION TABLES
-- ================================================================

-- Colecao <-> Item
CREATE TABLE colecao_items (
  colecao_id UUID NOT NULL REFERENCES colecoes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES acervo_items(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (colecao_id, item_id)
);

-- Item <-> Pessoa
CREATE TABLE item_pessoas (
  item_id UUID NOT NULL REFERENCES acervo_items(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  papel_no_item TEXT,
  PRIMARY KEY (item_id, pessoa_id)
);

-- Item <-> Tag
CREATE TABLE item_tags (
  item_id UUID NOT NULL REFERENCES acervo_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- ================================================================
-- EVENTOS_TIMELINE
-- ================================================================
CREATE TABLE eventos_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento DATE NOT NULL,
  data_fim DATE,
  tipo tipo_evento NOT NULL DEFAULT 'marco',
  fonte TEXT,
  item_vinculado_id UUID REFERENCES acervo_items(id),
  destaque BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- DEPOIMENTOS
-- ================================================================
CREATE TABLE depoimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id),
  conteudo TEXT NOT NULL,
  contexto TEXT,
  item_origem_id UUID REFERENCES acervo_items(id),
  data_registro DATE,
  publicado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- AUDIT LOG
-- ================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  operacao operacao_audit NOT NULL,
  registro_id UUID NOT NULL,
  dados_antes JSONB,
  dados_depois JSONB,
  usuario_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX idx_acervo_search ON acervo_items USING gin(search_vector);
CREATE INDEX idx_acervo_status ON acervo_items(status);
CREATE INDEX idx_acervo_tipo ON acervo_items(tipo_midia);
CREATE INDEX idx_acervo_fazenda ON acervo_items(fazenda_id);
CREATE INDEX idx_acervo_data ON acervo_items(data_criacao);
CREATE INDEX idx_acervo_curador ON acervo_items(curador_id);
CREATE INDEX idx_colecoes_slug ON colecoes(slug);
CREATE INDEX idx_colecoes_publicada ON colecoes(publicada);
CREATE INDEX idx_eventos_data ON eventos_timeline(data_evento);
CREATE INDEX idx_depoimentos_pessoa ON depoimentos(pessoa_id);
CREATE INDEX idx_audit_tabela ON audit_log(tabela);
CREATE INDEX idx_audit_data ON audit_log(created_at);
