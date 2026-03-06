import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_IMPORT_AUTHOR = "instagram-reels-import-v1";

function loadEnvFromFile(filename) {
  const fullPath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(fullPath)) return;

  const raw = fs.readFileSync(fullPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const idx = trimmed.indexOf("=");
    if (idx === -1) return;

    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function parseArgs() {
  const out = {};
  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function chunked(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) {
    out.push(values.slice(i, i + size));
  }
  return out;
}

function extractSourceUri(row) {
  const meta = row?.metadata_exif ?? {};
  const uri = meta.instagram_uri ?? meta.source_media_uri ?? null;
  return typeof uri === "string" && uri ? uri : null;
}

function sortRowsByOldestFirst(a, b) {
  const aDate = new Date(a.created_at ?? a.data_ingestao ?? 0).getTime();
  const bDate = new Date(b.created_at ?? b.data_ingestao ?? 0).getTime();
  if (aDate !== bDate) return aDate - bDate;
  return String(a.id).localeCompare(String(b.id));
}

async function fetchImportedRows(supabase, author) {
  const rows = [];
  const pageSize = 500;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("acervo_items")
      .select("id,autor_registro,created_at,data_ingestao,metadata_exif")
      .eq("autor_registro", author)
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function main() {
  loadEnvFromFile(".env.local");
  const args = parseArgs();
  const apply = Boolean(args.apply);
  const author = args.author ?? DEFAULT_IMPORT_AUTHOR;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    fail("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const rows = await fetchImportedRows(supabase, author);
  const uriMap = new Map();
  const noUriRows = [];

  for (const row of rows) {
    const uri = extractSourceUri(row);
    if (!uri) {
      noUriRows.push(row.id);
      continue;
    }
    const bucket = uriMap.get(uri) ?? [];
    bucket.push(row);
    uriMap.set(uri, bucket);
  }

  const toDelete = [];
  const duplicatesPreview = [];
  for (const [uri, uriRows] of uriMap.entries()) {
    if (uriRows.length <= 1) continue;
    uriRows.sort(sortRowsByOldestFirst);
    const keeper = uriRows[0];
    const dups = uriRows.slice(1);
    dups.forEach((row) => toDelete.push(row.id));
    duplicatesPreview.push({
      uri,
      keep_id: keeper.id,
      delete_ids: dups.map((row) => row.id),
    });
  }

  const summary = {
    apply,
    author,
    imported_rows_scanned: rows.length,
    rows_without_uri: noUriRows.length,
    duplicate_uri_groups: duplicatesPreview.length,
    duplicate_rows_to_delete: toDelete.length,
    sample_groups: duplicatesPreview.slice(0, 10),
  };

  if (!apply || toDelete.length === 0) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const chunks = chunked(toDelete, 100);
  for (const ids of chunks) {
    const del = await supabase.from("acervo_items").delete().in("id", ids);
    if (del.error) throw del.error;
  }

  console.log(
    JSON.stringify(
      {
        ...summary,
        deleted_rows: toDelete.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Failed to dedupe reels import:", error.message || error);
  process.exit(1);
});
