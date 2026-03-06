# Plano de Ingestao Reels (3 anos)

## Objetivo

Catalogar e importar para a Casa de Memoria e Futuro todos os Reels dos ultimos 3 anos, com:
- upload do video para Supabase Storage (`acervo`);
- item catalogado no `acervo_items`;
- interpretacao narrativa automatica baseada na legenda;
- vinculacao de tags em `item_tags`.

## Fonte de dados

- Export metadata: `your_instagram_activity/media/reels.json`
- Midias distribuidas em 11 pastas de export `instagram-rcagropecuaria-*`
- Recorte temporal padrao: `hoje - 3 anos` ate `hoje`

## Regras de catalogacao

- `tipo_midia`: `video`
- `status`: `em_revisao` (curadoria humana depois da ingestao)
- `classificacao`: `inferencia` (interpretacao automatica)
- `tom_narrativo`: inferido por heuristica de legenda
- `fazenda_id`: inferido por GPS e/ou palavras-chave da legenda
- `metadata_exif`: inclui `instagram_uri`, hashtags, musica, resumo narrativo e metadados de importacao

## Idempotencia e seguranca

- O importador verifica URI existente por `metadata_exif.instagram_uri` e `metadata_exif.source_media_uri`.
- Upload no Storage usa path deterministico (`instagram/reels/...`).
- Sanitizacao de texto/JSON remove caracteres invalidos antes da insercao no Postgres.
- Relatorio JSON por execucao em `tmp/import-reports`.
- Possui `--dry-run`, `--limit`, `--offset` e `--only-uris` para execucao em lotes/reprocessamento.
- Script de dedupe disponivel para eliminar duplicatas por URI quando necessario.

## Comandos

```bash
npm run reels:dry-run
npm run reels:import
npm run reels:dedupe
npm run reels:dedupe:apply
```

Lotes:

```bash
node scripts/import-instagram-reels.mjs --limit 100 --offset 0
node scripts/import-instagram-reels.mjs --limit 100 --offset 100
```
