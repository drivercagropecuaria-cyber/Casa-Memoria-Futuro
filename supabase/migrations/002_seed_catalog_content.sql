-- ================================================================
-- Casa de Memoria e Futuro - Seed incremental de catalogo inicial
-- Migration 002
-- ================================================================

-- ------------------------------------------------
-- ACERVO ITEMS (idempotente por id)
-- ------------------------------------------------
INSERT INTO acervo_items (
  id,
  titulo,
  descricao,
  tipo_midia,
  formato_original,
  tamanho_bytes,
  duracao_segundos,
  data_criacao,
  data_publicacao,
  status,
  autor_registro,
  transcricao,
  fazenda_id,
  tom_narrativo,
  classificacao
)
VALUES
(
  '00000000-0000-0000-0000-000000000101',
  'Leilao Qualidade Total 2025 - lote de destaque',
  'Registro de lote comercial com desempenho acima da media.',
  'video',
  'mp4',
  185200100,
  96,
  '2025-06-14T10:00:00Z',
  '2025-06-14T18:00:00Z',
  'aprovado',
  'Equipe RC',
  'Lote de alta consistencia, preparado em ciclo completo.',
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Villa Canabrava' LIMIT 1),
  'tecnico',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000102',
  'Comitiva entre Santa Maria e Villa Canabrava',
  'Transferencia de novilhas prenhas em deslocamento tradicional.',
  'video',
  'mp4',
  148300700,
  81,
  '2025-08-22T09:00:00Z',
  '2025-08-22T19:00:00Z',
  'aprovado',
  'Equipe RC',
  'A comitiva traduz cultura, territorio e continuidade.',
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Villa Canabrava' LIMIT 1),
  'poetico',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000103',
  'IATF - lote de 297 novilhas primiparas',
  'Protocolo tecnico de reproducao acompanhado em campo.',
  'video',
  'mp4',
  132450000,
  74,
  '2026-01-09T08:30:00Z',
  '2026-01-09T17:15:00Z',
  'aprovado',
  'Equipe RC',
  'IATF com foco em prenhez e ganho genetico.',
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Villa Canabrava' LIMIT 1),
  'tecnico',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000104',
  'Depoimento de Pereira Rocha',
  'Voz historica sobre trabalho e relacao com os animais.',
  'transcricao',
  'srt',
  12810,
  NULL,
  '2024-11-03T12:30:00Z',
  '2024-11-04T14:00:00Z',
  'aprovado',
  'Equipe RC',
  'Eu considero o cavalo de servico como colega de trabalho.',
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Villa Canabrava' LIMIT 1),
  'afetivo',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000105',
  'Feno da Villa - corte e enfardamento',
  'Registro operacional da unidade de feno premium.',
  'foto',
  'jpg',
  4190000,
  NULL,
  '2025-05-18T11:20:00Z',
  '2025-05-18T20:00:00Z',
  'aprovado',
  'Equipe RC',
  NULL,
  (SELECT id FROM fazendas WHERE nome = 'Feno da Villa' LIMIT 1),
  'tecnico',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000106',
  'Story - chuva no Jequitai e manejo de risco',
  'Registro curto sobre condicoes climaticas extremas.',
  'video',
  'mp4',
  32000000,
  18,
  '2025-01-12T13:10:00Z',
  '2025-01-12T13:11:00Z',
  'aprovado',
  'Equipe RC',
  NULL,
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Jequitai' LIMIT 1),
  'combativo',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000107',
  'Anotacoes sobre o ciclo Qualidade Total',
  'Documento interno de alinhamento metodologico.',
  'documento',
  'pdf',
  2680000,
  NULL,
  '2026-02-02T07:00:00Z',
  NULL,
  'em_revisao',
  'Equipe RC',
  NULL,
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Villa Canabrava' LIMIT 1),
  'tecnico',
  'fato'
),
(
  '00000000-0000-0000-0000-000000000108',
  'Rodrigo - fala sobre vocacao na cria',
  'Trecho de audio com posicionamento institucional.',
  'audio',
  'mp3',
  7820000,
  132,
  '2025-12-07T15:40:00Z',
  '2025-12-07T21:30:00Z',
  'aprovado',
  'Equipe RC',
  'Sou pecuarista apaixonado e minha vocacao e a cria.',
  (SELECT id FROM fazendas WHERE nome = 'Fazenda Villa Canabrava' LIMIT 1),
  'celebratorio',
  'fato'
)
ON CONFLICT (id) DO UPDATE
SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao,
  tipo_midia = EXCLUDED.tipo_midia,
  formato_original = EXCLUDED.formato_original,
  tamanho_bytes = EXCLUDED.tamanho_bytes,
  duracao_segundos = EXCLUDED.duracao_segundos,
  data_criacao = EXCLUDED.data_criacao,
  data_publicacao = EXCLUDED.data_publicacao,
  status = EXCLUDED.status,
  autor_registro = EXCLUDED.autor_registro,
  transcricao = EXCLUDED.transcricao,
  fazenda_id = EXCLUDED.fazenda_id,
  tom_narrativo = EXCLUDED.tom_narrativo,
  classificacao = EXCLUDED.classificacao,
  updated_at = now();

-- ------------------------------------------------
-- COLECOES (idempotente por id)
-- ------------------------------------------------
INSERT INTO colecoes (
  id,
  titulo,
  descricao,
  tipo,
  slug,
  publicada,
  ordem
)
VALUES
(
  '00000000-0000-0000-0000-000000001001',
  '37 anos de Selecao',
  'Marcos geneticos do programa Guzera e GUZONEL.',
  'cronologica',
  '37-anos-selecao',
  true,
  1
),
(
  '00000000-0000-0000-0000-000000001002',
  'Vozes da Fazenda',
  'Depoimentos de trabalhadores, gestores e parceiros.',
  'editorial',
  'vozes-da-fazenda',
  true,
  2
),
(
  '00000000-0000-0000-0000-000000001003',
  'Leilao Qualidade Total',
  'Registros comerciais e historicos dos leiloes anuais.',
  'tematica',
  'leilao-qualidade-total',
  false,
  3
)
ON CONFLICT (id) DO UPDATE
SET
  titulo = EXCLUDED.titulo,
  descricao = EXCLUDED.descricao,
  tipo = EXCLUDED.tipo,
  slug = EXCLUDED.slug,
  publicada = EXCLUDED.publicada,
  ordem = EXCLUDED.ordem,
  updated_at = now();

-- ------------------------------------------------
-- COLECAO <-> ITEM
-- ------------------------------------------------
INSERT INTO colecao_items (colecao_id, item_id, ordem)
VALUES
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', 1),
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000103', 2),
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000108', 3),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000104', 1),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000108', 2),
('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000101', 1)
ON CONFLICT (colecao_id, item_id) DO UPDATE
SET ordem = EXCLUDED.ordem;

-- ------------------------------------------------
-- ITEM <-> TAG
-- ------------------------------------------------
INSERT INTO item_tags (item_id, tag_id)
SELECT x.item_id, t.id
FROM (
  VALUES
    ('00000000-0000-0000-0000-000000000101'::uuid, 'Leilao Qualidade Total'),
    ('00000000-0000-0000-0000-000000000101'::uuid, 'Tecnico'),
    ('00000000-0000-0000-0000-000000000101'::uuid, 'Reel'),
    ('00000000-0000-0000-0000-000000000102'::uuid, 'Poetico'),
    ('00000000-0000-0000-0000-000000000102'::uuid, 'Comitiva'),
    ('00000000-0000-0000-0000-000000000103'::uuid, 'IATF'),
    ('00000000-0000-0000-0000-000000000103'::uuid, 'Tecnico'),
    ('00000000-0000-0000-0000-000000000104'::uuid, 'Afetivo'),
    ('00000000-0000-0000-0000-000000000105'::uuid, 'Feno da Villa'),
    ('00000000-0000-0000-0000-000000000106'::uuid, 'Story'),
    ('00000000-0000-0000-0000-000000000107'::uuid, 'Ciclo Qualidade Total'),
    ('00000000-0000-0000-0000-000000000108'::uuid, 'Celebratorio')
) AS x(item_id, tag_nome)
JOIN tags t ON t.nome = x.tag_nome
ON CONFLICT (item_id, tag_id) DO NOTHING;

-- ------------------------------------------------
-- ITEM <-> PESSOA
-- ------------------------------------------------
INSERT INTO item_pessoas (item_id, pessoa_id, papel_no_item)
SELECT x.item_id, p.id, x.papel_no_item
FROM (
  VALUES
    ('00000000-0000-0000-0000-000000000104'::uuid, 'Pereira Rocha', 'voz'),
    ('00000000-0000-0000-0000-000000000108'::uuid, 'Rodrigo Pinto Canabrava', 'voz principal'),
    ('00000000-0000-0000-0000-000000000103'::uuid, 'Rodrigo Pinto Canabrava', 'apresentacao tecnica')
) AS x(item_id, pessoa_nome, papel_no_item)
JOIN pessoas p ON p.nome_completo = x.pessoa_nome
ON CONFLICT (item_id, pessoa_id) DO UPDATE
SET papel_no_item = EXCLUDED.papel_no_item;

-- ------------------------------------------------
-- VINCULO DEPOIMENTOS -> ITEM DE ORIGEM
-- ------------------------------------------------
UPDATE depoimentos
SET item_origem_id = '00000000-0000-0000-0000-000000000104'
WHERE pessoa_id = (SELECT id FROM pessoas WHERE nome_completo = 'Pereira Rocha' LIMIT 1)
  AND contexto = 'Sobre cavalos de trabalho e respeito'
  AND item_origem_id IS NULL;

UPDATE depoimentos
SET item_origem_id = '00000000-0000-0000-0000-000000000108'
WHERE pessoa_id = (SELECT id FROM pessoas WHERE nome_completo = 'Rodrigo Pinto Canabrava' LIMIT 1)
  AND contexto = 'Sobre vocacao'
  AND item_origem_id IS NULL;
