# Casa Memoria e Futuro

Aplicacao Next.js para gestao e exibicao do acervo historico da Casa Memoria e Futuro, integrada ao Supabase (Auth, Postgres e Storage).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (`@supabase/supabase-js` e `@supabase/ssr`)
- SQL migrations em `supabase/migrations`

## Requisitos

- Node.js 20+
- NPM 10+

## Configuracao de ambiente

1. Copie o exemplo:

```bash
cp .env.local.example .env.local
```

2. Preencha as variaveis em `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL` (opcional, para scripts/migracoes)
- `SUPABASE_DB_POOLER_URL` (opcional, para scripts/migracoes)

## Desenvolvimento local

```bash
npm ci
npm run dev
```

App local: `http://localhost:3000`

## Qualidade e build

```bash
npm run lint
npm run build
```

## Estrutura principal

- `src/app/(main)` paginas publicas e admin
- `src/lib/supabase` cliente e camada de dados
- `supabase/migrations` schema, seed complementar, storage e RLS
- `supabase/seed.sql` dados base de dominio

## Deploy (Vercel)

- O deploy e acionado por push no branch `main`.
- Configure no projeto Vercel as mesmas variaveis de ambiente do `.env.local`.
- Depois do deploy, valide:
  - login `/login`
  - rotas de conteudo (`/acervo`, `/colecoes`, `/timeline`)
  - rotas admin (`/admin/*`)

## Bootstrap de administrador

Para criar/atualizar um usuario administrador no Supabase (inclui perfil `role=admin`):

```bash
npm run admin:bootstrap -- --email admin@dominio.com --password <PASSWORD_FORTE> --name Administrador
```

Observacoes:
- O script usa `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` do ambiente (ou `.env.local`).
- Se o usuario ja existir, ele atualiza senha, confirma email e garante papel `admin`.

## Importacao de Reels (ultimos 3 anos)

Pipeline idempotente para:
- ler `reels.json` do export do Instagram;
- interpretar legenda (temas e tom narrativo);
- subir video para bucket `acervo`;
- inserir item no `acervo_items` + `item_tags`.

Dry-run (nao sobe arquivos, nao grava no banco):

```bash
npm run reels:dry-run
```

Importacao real:

```bash
npm run reels:import
```

Opcoes uteis:

```bash
node scripts/import-instagram-reels.mjs --dry-run --limit 50
node scripts/import-instagram-reels.mjs --limit 100 --offset 100
node scripts/import-instagram-reels.mjs --from-date 2023-03-06 --to-date 2026-03-06
node scripts/import-instagram-reels.mjs --only-uris "media/reels/202410/18088471381494551.mp4"
```

Deduplicacao de importacoes (quando necessario):

```bash
npm run reels:dedupe
npm run reels:dedupe:apply
```
