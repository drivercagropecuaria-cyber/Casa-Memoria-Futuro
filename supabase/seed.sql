-- ================================================================
-- Casa de Memoria e Futuro — Seed Data
-- Dados iniciais extraidos da documentacao institucional
-- ================================================================

-- ================================================================
-- FAZENDAS
-- ================================================================
INSERT INTO fazendas (nome, municipio, gps_lat, gps_lng, funcao_principal, funcoes_secundarias, area_hectares, infraestrutura, status, descricao, e_sede_casa) VALUES
('Fazenda Villa Canabrava', 'Engenheiro Navarro / Bocaiuva', -17.414268, -43.933870, 'Sede e centro de operacoes', ARRAY['maternidade', 'confinamento', 'silagem', 'feno', 'escritorio'], NULL, 'Curral e manejo, maternidade, confinamento de novilhas e terminacao, fabrica de racao (silos 2.000t), lavouras irrigadas (2 pivos / 95ha, milho Pioneer 4285, SNAPLAGE), campos de feno (6 pivos / 214ha, Tifton 85 e Vaquero), capela, moradias, escola, internet, composteira mecanica, tanques de biologicos', 'ativa', 'Centro de operacoes principal. Comunidade viva com passado reconhecido e futuro cuidado. 90%+ do conteudo Instagram e filmado aqui.', true),

('Fazenda Jequitai', 'Engenheiro Navarro', NULL, NULL, 'Unidade de cria', ARRAY['producao de bezerros GUZONEL', 'feno'], NULL, 'Margens do Rio Jequitai, Serra do Cabral ao fundo', 'ativa', 'Unidade de cria extensiva. Producao de bezerros GUZONEL. O rio Jequitai encheu em jan/2021. Representa o sertao bruto, o desafio climatico.', false),

('Fazenda Santa Maria / Olhos D''Agua', 'Bocaiuva', -17.11127, -43.81516, 'Cria e preparacao de lotes', ARRAY['desmama', 'recria', 'preparacao para leilao'], NULL, 'Recebe novilhas prenhas da Villa Canabrava via comitiva', 'ativa', 'Unidade de cria, desmama e preparacao de lotes para o Leilao Qualidade Total. As comitivas entre fazendas sao o conteudo mais epico.', false),

('Feno da Villa', 'Engenheiro Navarro', NULL, NULL, 'Producao e venda de feno', ARRAY['Tifton 85', 'Vaquero'], 214, '6 pivos de irrigacao, 220ha irrigados', 'ativa', 'Unidade dedicada de feno premium. PB 16-22%, NDT >60%. Atende mercado equino e bovino. @fenodavilla. Gerente de vendas: Hebert.', false),

('Retiro Uniao', 'Engenheiro Navarro', NULL, NULL, 'Protocolos IATF', ARRAY['inseminacao'], NULL, 'Sub-unidade da Villa Canabrava', 'ativa', 'Sub-unidade dedicada a protocolos de IATF. 297 novilhas primiparas + 455 novilhas em protocolo (jan/2026).', false),

('Fazenda Terra Nova', 'Bocaiuva', NULL, NULL, 'Nao documentada', NULL, NULL, 'Identificada apenas no site oficial', 'incerta', 'Funcao nao documentada no Instagram. Necessita validacao com Rodrigo.', false);

-- ================================================================
-- PESSOAS
-- ================================================================
INSERT INTO pessoas (nome_completo, papel, tipo, biografia, data_nascimento, tempo_empresa, citacao_destaque, ativo) VALUES
('Rodrigo Pinto Canabrava', 'Fundador, proprietario, gestor, comunicador', 'proprietario', 'Engenheiro civil pela EGESA Engenharia. Comprou todas as fazendas com recursos proprios. Iniciou selecao Guzera PO em 1988 (37+ anos). Dedicacao exclusiva a fazenda desde ~2000. Voz dupla: pragmatico-tecnica (falada) e poetico-contemplativa (escrita). 170.495 seguidores no Instagram.', '1957-06-03', '37+ anos', 'Eu sou um pecuarista apaixonado, faco tudo com muito entusiasmo e a minha vocacao na pecuaria e a cria.', true),

('Dr. Dalton Moreira Canabrava', 'Pai e fundador do legado moral', 'familiar', 'Presidente da Assembleia Legislativa de Minas Gerais. Deputado estadual por seis legislaturas. Deputado federal constituinte. Criador da raca Americana (Brahman). Valores: respeito a liberdade, espirito liberal e democrata, amor pelo sertao. A heranca nao foi financeira — foi moral.', '1924-12-22', NULL, 'Meu pai nos deixou licoes de respeito a liberdade, o seu espirito de liberal democrata, o seu gosto e prazer de viver e conviver com o nosso sertao mineiro.', false),

('Pereira Rocha', 'Funcionario historico', 'colaborador', 'O funcionario mais antigo documentado da RC Agropecuaria. 52 anos de servico. Memoria viva da fazenda. Sua relacao com os cavalos de servico exemplifica a cultura de respeito pelo trabalho.', NULL, '52 anos', 'Eu nao considero um cavalo de servico como um animal, eu considero um cavalo de servico como um colega de servico meu.', true),

('Andre Assis Santos', 'Vaqueiro', 'colaborador', 'Vaqueiro da RC Agropecuaria. Representa a alegria e o orgulho profissional que definem a cultura de trabalho da fazenda.', NULL, NULL, 'Eu sou desse jeito alegre. Tudo que eu estou tocando gado eu estou sorrindo. Eu amo ser vaqueiro, amo do que faco com gado.', true),

('Newton Biffi', 'Consultor de nutricao animal', 'consultor', 'Consultor da Vaccinar. Assessoria tecnica em nutricao animal para a RC Agropecuaria. Todas as decisoes nutricionais lastreadas em viabilidade economica.', NULL, NULL, NULL, true),

('Gustavo Faria', 'Consultor de genetica/nutricao', 'consultor', 'Consultor da Vaccinar. Trabalha junto com Newton Biffi na assessoria tecnica da RC.', NULL, NULL, NULL, true);

-- ================================================================
-- TAGS (temas iniciais)
-- ================================================================
INSERT INTO tags (nome, categoria) VALUES
('Manejo diario', 'tema'),
('IATF', 'tema'),
('Paisagem e contemplacao', 'tema'),
('Fe e espiritualidade', 'tema'),
('Nutricao e confinamento', 'tema'),
('Leilao Qualidade Total', 'tema'),
('Equipe e trabalhadores', 'tema'),
('Lavouras e silagem', 'tema'),
('Feno da Villa', 'tema'),
('Marcos de seguidores', 'tema'),
('Posicionamento de mercado', 'tema'),
('Genetica e selecao', 'tema'),
('Ovinocultura Santa Ines', 'tema'),
('Guzera PO', 'tema'),
('GUZONEL', 'tema'),
('Three Cross', 'tema'),
('Sustentabilidade', 'tema'),
('Bem-estar animal', 'tema'),
('Comitiva', 'tema'),
('Dalton Canabrava', 'tema'),
('Villa Canabrava', 'tema'),
('Ciclo Qualidade Total', 'tema'),
-- Periodos
('1988-1999', 'periodo'),
('2000-2010', 'periodo'),
('2011-2015', 'periodo'),
('2016-2020', 'periodo'),
('2021-2023', 'periodo'),
('2024-presente', 'periodo'),
-- Formatos
('Reel', 'formato'),
('Story', 'formato'),
('Post feed', 'formato'),
('IGTV', 'formato'),
('Carousel', 'formato'),
-- Tons
('Tecnico', 'tom'),
('Poetico', 'tom'),
('Afetivo', 'tom'),
('Combativo', 'tom'),
('Celebratorio', 'tom');

-- ================================================================
-- EVENTOS TIMELINE
-- ================================================================
INSERT INTO eventos_timeline (titulo, descricao, data_evento, tipo, fonte, destaque) VALUES
('Inicio da selecao Guzera PO', 'Rodrigo Canabrava inicia o programa de selecao genetica Guzera PO, marca GUZERATI. Marco fundacional da RC Agropecuaria.', '1988-01-01', 'fundacao', 'BASE_DE_CONHECIMENTO', true),
('Criacao da conta @rcagropecuaria', 'Conta criada no Instagram em 30/09/2013. Sem conteudo preservado ate 2016.', '2013-09-30', 'marco', 'Instagram export', false),
('Primeiros registros preservados', 'Primeiras 8 fotos arquivadas datam de jan-fev/2016.', '2016-01-01', 'marco', 'Instagram export', false),
('Ativacao digital', 'Primeiros videos publicados. IGTV lancado. Bio atualizada com marca GUZERATI.', '2020-04-01', 'marco', 'Instagram export', false),
('Primeiro Reel publicado', 'RC entra no formato Reels, que se tornara o motor de crescimento.', '2022-06-01', 'marco', 'Instagram export', false),
('13o Leilao Qualidade Total', '4.200 animais (2.000 da RC). Canal Terra Viva + EBL Web.', '2022-06-25', 'leilao', 'BASE_DE_CONHECIMENTO', true),
('25 mil seguidores', 'Primeiro marco significativo de audiencia.', '2022-05-01', 'crescimento', 'Instagram export', false),
('14o Leilao Qualidade Total', '3.200 animais, 40 lotes de carretas.', '2023-06-24', 'leilao', 'BASE_DE_CONHECIMENTO', false),
('50 mil seguidores', 'Duplicacao em 12 meses.', '2023-05-01', 'crescimento', 'Instagram export', false),
('75 mil seguidores', 'Crescimento acelerado via Reels.', '2024-02-01', 'crescimento', 'Instagram export', false),
('16o Leilao Qualidade Total', '3.500 animais (3.000 da RC — oferta inedita). Boi Virtual + Lance Rural.', '2025-06-14', 'leilao', 'BASE_DE_CONHECIMENTO', true),
('Materia no Agro Estadao', 'Como Rodrigo Canabrava lidera a RC com foco em Qualidade Total. Ponto de inflexao reputacional.', '2025-12-01', 'midia', 'Agro Estadao', true),
('120 mil seguidores', 'Crescimento continuo pos-materia.', '2025-04-01', 'crescimento', 'Instagram export', false),
('170 mil seguidores', 'Marca atual. 580% de crescimento em 45 meses.', '2026-02-01', 'crescimento', 'Instagram export', true),
('Centenario de Dr. Dalton Canabrava', 'Homenagem ao pai: 100 anos de Dr. Dalton Moreira Canabrava.', '2024-12-22', 'pessoal', 'Instagram (@rcagropecuaria)', true),
('Discurso CHEGA!', 'Rodrigo publica texto combativo sobre cadeia da carne. Posicionamento setorial.', '2026-01-15', 'marco', 'Instagram export', true),
('Conta comprometida', 'Email alterado para dominio suspeito. Revertido em 3 horas.', '2025-07-01', 'incidente', 'Instagram export', false);

-- ================================================================
-- DEPOIMENTOS
-- ================================================================
INSERT INTO depoimentos (pessoa_id, conteudo, contexto, data_registro, publicado)
SELECT p.id, d.conteudo, d.contexto, d.data_registro::date, true
FROM (VALUES
  ('Pereira Rocha', 'Eu nao considero um cavalo de servico como um animal, eu considero um cavalo de servico como um colega de servico meu. O que eu ia falar pro pessoal e o seguinte: e facil de gostar de um animal porque animal e uma coisa que e boa para a saude do povo.', 'Sobre cavalos de trabalho e respeito', NULL),
  ('Andre Assis Santos', 'Eu sou desse jeito alegre. Tudo que eu estou tocando gado eu estou sorrindo, nao estou triste. O que mais gosto? Acho que nao tem segredo. Voce tem que saber lidar e ser carinhoso com o animal. Ser vaqueiro pra mim e ser profissional naquilo que faz. Eu amo ser vaqueiro, amo do que faco com gado.', 'Sobre a profissao de vaqueiro', NULL),
  ('Rodrigo Pinto Canabrava', 'Eu sou um pecuarista apaixonado, faco tudo com muito entusiasmo e a minha vocacao na pecuaria e a cria. Gosto muito de acompanhar o nascimento dos bezerros — e o maior prazer da fazenda.', 'Sobre vocacao', NULL),
  ('Rodrigo Pinto Canabrava', 'A genetica superior nao e um slogan publicitario. Tem muito trabalho atras disto. Tem que ter fazenda com boa oferta de pastagem, rebanho bom de matriz formado ao longo de mais de trinta anos, e reprodutores que participem de programas de avaliacao.', 'Sobre genetica', NULL),
  ('Rodrigo Pinto Canabrava', 'O Mega Leilao Qualidade Total e o coroamento de um ciclo de trabalho. Sao quase dois anos que comecam com o planejamento da estacao de monta. E na pecuaria uma festa — e o dia da colheita.', 'Sobre o leilao', NULL),
  ('Rodrigo Pinto Canabrava', 'Consistencia nao e sorte, e ciencia, e metodo, e cuidado diario.', 'Sobre metodo', NULL)
) AS d(pessoa_nome, conteudo, contexto, data_registro)
JOIN pessoas p ON p.nome_completo = d.pessoa_nome;
