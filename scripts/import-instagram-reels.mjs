import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SOURCE_ROOT = "g:/baixados/instagram";
const DEFAULT_METADATA_FOLDER = "instagram-rcagropecuaria-2026-02-07-hZnBPz12";
const DEFAULT_STATUS = "em_revisao";
const IMPORT_VERSION = "instagram-reels-import-v1";

function loadEnvFromFile(filename) {
  const fullPath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(fullPath)) return;

  const raw = fs.readFileSync(fullPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const eq = trimmed.indexOf("=");
    if (eq === -1) return;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
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

function asInt(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function asDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDelimitedUris(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function listExportFolders(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("instagram-rcagropecuaria-"))
    .map((entry) => ({
      name: entry.name,
      fullPath: path.join(root, entry.name),
    }));
}

function findMetadataFolder(root, explicitFolder) {
  const exports = listExportFolders(root);
  if (explicitFolder) {
    const fullPath = path.join(root, explicitFolder);
    const reelsPath = path.join(fullPath, "your_instagram_activity", "media", "reels.json");
    if (!fs.existsSync(reelsPath)) {
      fail(`Metadata folder does not contain reels.json: ${fullPath}`);
    }
    return { name: explicitFolder, fullPath, reelsPath };
  }

  for (const folder of exports) {
    const reelsPath = path.join(
      folder.fullPath,
      "your_instagram_activity",
      "media",
      "reels.json"
    );
    if (fs.existsSync(reelsPath)) {
      return { name: folder.name, fullPath: folder.fullPath, reelsPath };
    }
  }

  fail("Could not find metadata folder with reels.json.");
}

function maybeFixEncoding(text) {
  if (typeof text !== "string" || !text) return "";
  if (!/[ÃÂâ]/.test(text)) return text;
  try {
    const fixed = Buffer.from(text, "latin1").toString("utf8");
    const badOriginal = (text.match(/[ÃÂâ]/g) || []).length;
    const badFixed = (fixed.match(/[ÃÂâ]/g) || []).length;
    return badFixed <= badOriginal ? fixed : text;
  } catch {
    return text;
  }
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function sanitizeJsonText(value) {
  if (typeof value !== "string" || value.length === 0) return "";

  let out = "";
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);

    if (code >= 0xd800 && code <= 0xdbff) {
      const nextCode = value.charCodeAt(i + 1);
      if (nextCode >= 0xdc00 && nextCode <= 0xdfff) {
        out += value[i] + value[i + 1];
        i += 1;
      }
      continue;
    }

    if (code >= 0xdc00 && code <= 0xdfff) {
      continue;
    }

    if (code === 0x0000) {
      continue;
    }

    if (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) {
      continue;
    }

    out += value[i];
  }

  return out;
}

function sanitizeJsonValue(value) {
  if (value === null) return null;
  if (Array.isArray(value)) return value.map((item) => sanitizeJsonValue(item));
  if (typeof value === "string") return sanitizeJsonText(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;
  if (typeof value === "object") {
    const out = {};
    Object.entries(value).forEach(([key, nested]) => {
      if (nested === undefined) return;
      out[sanitizeJsonText(String(key))] = sanitizeJsonValue(nested);
    });
    return out;
  }
  return null;
}

function normalizeForMatch(text) {
  return normalizeWhitespace(
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  );
}

function extractHashtags(text) {
  const tags = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  const normalized = tags.map((tag) => normalizeForMatch(tag.replace(/^#/, "")));
  return Array.from(new Set(normalized.filter(Boolean)));
}

function resolveUriAcrossExports(exportFolders, uri) {
  if (!uri) return null;
  const rel = uri.replace(/\\/g, "/");
  for (const folder of exportFolders) {
    const candidate = path.join(folder.fullPath, rel);
    if (fs.existsSync(candidate)) {
      return {
        filePath: candidate,
        exportFolder: folder.name,
      };
    }
  }
  return null;
}

function buildStoragePath(mediaUri, creationTimestamp) {
  const rel = mediaUri.replace(/\\/g, "/");
  const marker = "media/reels/";
  if (rel.startsWith(marker)) {
    return `instagram/reels/${rel.slice(marker.length)}`;
  }
  const basename = path.basename(rel);
  return `instagram/reels/misc/${creationTimestamp}-${basename}`;
}

function extractGps(videoMetadata) {
  const exif = videoMetadata?.exif_data ?? [];
  const latItem = exif.find((entry) => typeof entry?.latitude === "number");
  if (!latItem) return { lat: null, lng: null };
  return {
    lat: latItem.latitude,
    lng: latItem.longitude,
  };
}

function findClosestFazendaByGps(fazendas, lat, lng) {
  if (lat === null || lng === null) return null;
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const fazenda of fazendas) {
    if (typeof fazenda.gps_lat !== "number" || typeof fazenda.gps_lng !== "number") {
      continue;
    }
    const distance =
      Math.abs(lat - fazenda.gps_lat) + Math.abs(lng - fazenda.gps_lng);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = fazenda;
    }
  }
  if (!best) return null;
  return bestDistance <= 0.08 ? best : null;
}

function findFazendaByCaption(fazendas, captionNormalized) {
  const rules = [
    { match: ["villacanabrava", "villa canabrava"], nome: "Fazenda Villa Canabrava" },
    { match: ["jequitai"], nome: "Fazenda Jequitai" },
    {
      match: ["santa maria", "olhos d'agua", "olhos dagua"],
      nome: "Fazenda Santa Maria / Olhos D'Agua",
    },
    { match: ["feno da villa"], nome: "Feno da Villa" },
    { match: ["retiro uniao"], nome: "Retiro Uniao" },
    { match: ["terra nova"], nome: "Fazenda Terra Nova" },
  ];

  for (const rule of rules) {
    if (rule.match.some((keyword) => captionNormalized.includes(keyword))) {
      return fazendas.find((fazenda) => fazenda.nome === rule.nome) ?? null;
    }
  }
  return null;
}

function inferTone(captionNormalized) {
  if (/(deus|aben|domingo|oracao|fe )/.test(captionNormalized)) return "poetico";
  if (
    /(kg|@|iatf|dep|proteina|ndt|rendimento|indice|conversao|silagem|lote|prenhez|confinamento|nutricao|bromatolog)/.test(
      captionNormalized
    )
  ) {
    return "tecnico";
  }
  if (/(obrigad|paraben|familia|orgulho|alegria|gratid)/.test(captionNormalized)) {
    return "afetivo";
  }
  if (/(chega|injust|contra|nao aceit|revolt|indigna)/.test(captionNormalized)) {
    return "combativo";
  }
  return "celebratorio";
}

function inferThemes(captionNormalized, hashtags, musicGenreNormalized) {
  const themes = new Set();

  const add = (name) => themes.add(name);
  const has = (...terms) => terms.some((term) => captionNormalized.includes(term));

  if (has("leilao", "lotes", "terra viva", "estancia bahia")) add("Leilao Qualidade Total");
  if (has("comitiva", "boiadeiro", "boiada", "tangidas")) add("Comitiva");
  if (has("iatf", "inseminacao", "prenhez")) add("IATF");
  if (has("confinamento", "nutricao", "proteinado", "racao", "engorda")) {
    add("Nutricao e confinamento");
  }
  if (has("feno", "tifton", "vaquero")) add("Feno da Villa");
  if (has("genetica", "selecao", "dep", "melhoramento")) add("Genetica e selecao");
  if (has("guzera")) add("Guzera PO");
  if (has("guzonel")) add("GUZONEL");
  if (has("three cross", "tricross", "angus", "simental")) add("Three Cross");
  if (has("silagem", "lavoura", "milho")) add("Lavouras e silagem");
  if (has("manejo", "desmama", "apartacao", "vermifugacao", "pesagem")) add("Manejo diario");
  if (has("equipe", "vaqueiro", "colaborador", "trabalh")) add("Equipe e trabalhadores");
  if (has("paisagem", "serra", "rio", "por do sol", "amanhecer")) add("Paisagem e contemplacao");
  if (has("deus", "aben", "capela", "fe")) add("Fe e espiritualidade");
  if (has("sustent", "ambient", "biologico")) add("Sustentabilidade");
  if (has("bem estar animal", "temperamento", "sem acidente")) add("Bem-estar animal");
  if (has("seguidores", "170 mil", "120 mil", "50 mil", "marco")) add("Marcos de seguidores");
  if (has("mercado", "cadeia da carne", "setor", "politica")) add("Posicionamento de mercado");
  if (has("qualidade total")) add("Ciclo Qualidade Total");
  if (has("dalton")) add("Dalton Canabrava");
  if (has("santa ines", "ovinocultura")) add("Ovinocultura Santa Ines");
  if (has("villacanabrava", "villa canabrava")) add("Villa Canabrava");

  if (hashtags.includes("qualidadetotal")) add("Ciclo Qualidade Total");
  if (hashtags.includes("fazendavillacanabrava")) add("Villa Canabrava");
  if (hashtags.includes("guzonel")) add("GUZONEL");
  if (hashtags.includes("guzera")) add("Guzera PO");
  if (hashtags.includes("iatf")) add("IATF");
  if (hashtags.includes("comitiva")) add("Comitiva");
  if (hashtags.includes("fenodavilla")) add("Feno da Villa");

  if (musicGenreNormalized.includes("country")) add("Paisagem e contemplacao");
  if (musicGenreNormalized.includes("brazilian")) add("Ciclo Qualidade Total");

  if (themes.size === 0) add("Manejo diario");
  return Array.from(themes);
}

function choosePeriodTag(creationDate) {
  const year = creationDate.getUTCFullYear();
  return year >= 2024 ? "2024-presente" : "2021-2023";
}

function toneLabelFromEnum(tone) {
  const map = {
    tecnico: "Tecnico",
    poetico: "Poetico",
    afetivo: "Afetivo",
    combativo: "Combativo",
    celebratorio: "Celebratorio",
  };
  return map[tone] ?? "Celebratorio";
}

function buildInterpretation({
  caption,
  themes,
  tone,
  fazendaName,
  creationDate,
}) {
  const dateStr = creationDate.toISOString().slice(0, 10);
  const scope = fazendaName
    ? `Registro em ${fazendaName}`
    : "Registro de rotina da RC Agropecuaria";
  const themeList = themes.join(", ");
  const tonePhrase = {
    tecnico: "A narrativa assume foco tecnico e orientado a processo.",
    poetico: "A narrativa assume tom poetico e contemplativo.",
    afetivo: "A narrativa assume tom afetivo e de valorizacao humana.",
    combativo: "A narrativa assume tom combativo e de posicionamento setorial.",
    celebratorio: "A narrativa assume tom celebratorio e institucional.",
  }[tone];
  const compactCaption = normalizeWhitespace(caption);
  const snippet =
    compactCaption.length > 280
      ? `${compactCaption.slice(0, 277)}...`
      : compactCaption;

  return `${scope}, publicado em ${dateStr}, com foco em ${themeList}. ${tonePhrase} Interpretacao automatica baseada na legenda original: "${snippet}"`;
}

function titleFromCaption(caption, creationDate) {
  const lines = caption
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);
  const first = lines[0] ?? "";
  const withoutHashtag = normalizeWhitespace(first.replace(/#[\p{L}\p{N}_]+/gu, ""));
  if (withoutHashtag) {
    return withoutHashtag.length > 120
      ? `${withoutHashtag.slice(0, 117)}...`
      : withoutHashtag;
  }
  return `Reel Instagram ${creationDate.toISOString().slice(0, 10)}`;
}

function parseSrtToText(rawSrt) {
  if (!rawSrt) return null;
  const fixed = maybeFixEncoding(rawSrt);
  const lines = fixed.split(/\r?\n/);
  const kept = lines.filter((line) => {
    const value = line.trim();
    if (!value) return false;
    if (/^\d+$/.test(value)) return false;
    if (
      /^\d{2}:\d{2}:\d{2},\d{3}\s+-->\s+\d{2}:\d{2}:\d{2},\d{3}$/.test(value)
    ) {
      return false;
    }
    return true;
  });
  const joined = normalizeWhitespace(kept.join(" "));
  return joined || null;
}

function contentTypeFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".m4v") return "video/mp4";
  return "application/octet-stream";
}

async function fetchExistingImportUris(supabase) {
  const set = new Set();
  let from = 0;
  const pageSize = 500;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("acervo_items")
      .select("id,metadata_exif")
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;

    data.forEach((row) => {
      const uriPrimary = row?.metadata_exif?.instagram_uri;
      const uriFallback = row?.metadata_exif?.source_media_uri;
      if (typeof uriPrimary === "string" && uriPrimary) set.add(uriPrimary);
      if (typeof uriFallback === "string" && uriFallback) set.add(uriFallback);
    });

    if (data.length < pageSize) break;
    from += pageSize;
  }

  return set;
}

function ensureDir(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

async function main() {
  loadEnvFromFile(".env.local");
  const args = parseArgs();

  const sourceRoot = args["source-root"] ?? process.env.IG_SOURCE_ROOT ?? DEFAULT_SOURCE_ROOT;
  const metadataFolder = args["metadata-folder"] ?? process.env.IG_METADATA_FOLDER ?? DEFAULT_METADATA_FOLDER;
  const dryRun = Boolean(args["dry-run"]);
  const limit = asInt(args.limit, -1);
  const offset = Math.max(0, asInt(args.offset, 0));
  const status = args.status ?? DEFAULT_STATUS;
  const onlyUris = new Set(parseDelimitedUris(args["only-uris"]));
  const onlyUrisFile = args["only-uris-file"];
  const batchId = `${Date.now()}`;

  if (onlyUrisFile) {
    const onlyUrisFilePath = path.resolve(process.cwd(), String(onlyUrisFile));
    if (!fs.existsSync(onlyUrisFilePath)) {
      fail(`URI filter file does not exist: ${onlyUrisFilePath}`);
    }
    const rawUris = fs.readFileSync(onlyUrisFilePath, "utf8");
    rawUris
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((uri) => onlyUris.add(uri));
  }

  if (!fs.existsSync(sourceRoot)) {
    fail(`Source root does not exist: ${sourceRoot}`);
  }

  const metadata = findMetadataFolder(sourceRoot, metadataFolder);
  const exportFolders = listExportFolders(sourceRoot);
  const reelsJson = JSON.parse(fs.readFileSync(metadata.reelsPath, "utf8"));
  const reelsMedia = reelsJson.ig_reels_media ?? [];

  const fromDate =
    asDateOrNull(args["from-date"]) ??
    new Date(Date.UTC(new Date().getUTCFullYear() - 3, new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0));
  const toDate = asDateOrNull(args["to-date"]) ?? new Date();
  const fromTs = Math.floor(fromDate.getTime() / 1000);
  const toTs = Math.floor(toDate.getTime() / 1000);

  const flat = [];
  reelsMedia.forEach((entry) => {
    (entry.media ?? []).forEach((media) => flat.push(media));
  });

  const candidates = flat
    .filter((media) => {
      const ts = Number(media.creation_timestamp ?? 0);
      if (ts < fromTs || ts > toTs) return false;
      if (onlyUris.size === 0) return true;
      const uri = String(media.uri ?? "");
      return onlyUris.has(uri);
    })
    .sort((a, b) => Number(a.creation_timestamp ?? 0) - Number(b.creation_timestamp ?? 0))
    .slice(offset, limit > -1 ? offset + limit : undefined);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    fail("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [{ data: fazendas, error: fazendasError }, { data: tags, error: tagsError }, existingUris] =
    await Promise.all([
      supabase.from("fazendas").select("id,nome,gps_lat,gps_lng"),
      supabase.from("tags").select("id,nome,categoria"),
      fetchExistingImportUris(supabase),
    ]);

  if (fazendasError) throw fazendasError;
  if (tagsError) throw tagsError;

  const fazendasTyped = (fazendas ?? []).map((row) => ({
    ...row,
    gps_lat: row.gps_lat === null ? null : Number(row.gps_lat),
    gps_lng: row.gps_lng === null ? null : Number(row.gps_lng),
  }));
  const tagMap = new Map(
    (tags ?? []).map((tag) => [normalizeForMatch(tag.nome), tag.id])
  );

  const stats = {
    dry_run: dryRun,
    batch_id: batchId,
    metadata_folder: metadata.name,
    source_root: sourceRoot,
    from_date: fromDate.toISOString(),
    to_date: toDate.toISOString(),
    uri_filter_count: onlyUris.size,
    total_reels_json: flat.length,
    candidate_count: candidates.length,
    imported: 0,
    skipped_existing: 0,
    missing_media_file: 0,
    upload_errors: 0,
    insert_errors: 0,
    tag_link_errors: 0,
    processed: 0,
  };

  const failures = [];
  const maxFailureLog = 200;

  for (const media of candidates) {
    stats.processed += 1;
    const mediaUri = sanitizeJsonText(String(media.uri ?? "").trim());
    const creationTimestamp = Number(media.creation_timestamp ?? 0);
    const creationDate = new Date(creationTimestamp * 1000);

    if (!mediaUri) {
      stats.missing_media_file += 1;
      if (failures.length < maxFailureLog) {
        failures.push({ media_uri: "", reason: "invalid_media_uri" });
      }
      continue;
    }

    if (existingUris.has(mediaUri)) {
      stats.skipped_existing += 1;
      continue;
    }

    const resolved = resolveUriAcrossExports(exportFolders, mediaUri);
    if (!resolved) {
      stats.missing_media_file += 1;
      if (failures.length < maxFailureLog) {
        failures.push({ media_uri: mediaUri, reason: "missing_media_file" });
      }
      continue;
    }

    const videoMetadata = media.media_metadata?.video_metadata ?? {};
    const gps = extractGps(videoMetadata);
    const rawCaption = maybeFixEncoding(String(media.title ?? ""));
    const caption = sanitizeJsonText(normalizeWhitespace(rawCaption));
    const captionNormalized = normalizeForMatch(caption);
    const hashtags = extractHashtags(caption);
    const musicGenre = sanitizeJsonText(
      normalizeWhitespace(maybeFixEncoding(String(videoMetadata.music_genre ?? "")))
    );
    const musicGenreNormalized = normalizeForMatch(musicGenre);

    const fazendaByGps = findClosestFazendaByGps(fazendasTyped, gps.lat, gps.lng);
    const fazendaByCaption = findFazendaByCaption(fazendasTyped, captionNormalized);
    const fazenda = fazendaByGps ?? fazendaByCaption ?? null;

    const tone = inferTone(captionNormalized);
    const themeNames = inferThemes(captionNormalized, hashtags, musicGenreNormalized);
    const periodTag = choosePeriodTag(creationDate);
    const toneTag = toneLabelFromEnum(tone);

    const interpretation = sanitizeJsonText(
      buildInterpretation({
        caption,
        themes: themeNames,
        tone,
        fazendaName: fazenda?.nome ?? null,
        creationDate,
      })
    );

    const subtitleUriRaw = videoMetadata?.subtitles?.uri ?? null;
    const subtitleUri =
      typeof subtitleUriRaw === "string" && subtitleUriRaw
        ? sanitizeJsonText(subtitleUriRaw)
        : null;
    let transcriptText = null;
    if (subtitleUri) {
      const subtitleResolved = resolveUriAcrossExports(exportFolders, subtitleUri);
      if (subtitleResolved) {
        const rawSrt = fs.readFileSync(subtitleResolved.filePath, "utf8");
        transcriptText = sanitizeJsonText(parseSrtToText(rawSrt) ?? "");
        if (!transcriptText) transcriptText = null;
      }
    }

    const fileStat = fs.statSync(resolved.filePath);
    const storagePath = buildStoragePath(mediaUri, creationTimestamp);
    const contentType = contentTypeFromFile(resolved.filePath);

    const metadataExif = sanitizeJsonValue({
      source: "instagram",
      source_type: "reels",
      source_export_folder: metadata.name,
      instagram_uri: mediaUri,
      source_media_uri: mediaUri,
      source_creation_timestamp: creationTimestamp,
      source_creation_iso: creationDate.toISOString(),
      source_music_genre: musicGenre || null,
      source_caption: caption || null,
      source_hashtags: hashtags,
      source_cross_post_app: media.cross_post_source?.source_app ?? null,
      source_subtitle_uri: subtitleUri,
      storage_path: storagePath,
      interpreted_themes: themeNames,
      interpreted_tone: tone,
      interpreted_summary: interpretation,
      import_version: IMPORT_VERSION,
      import_batch_id: batchId,
    });

    if (dryRun) {
      stats.imported += 1;
      existingUris.add(mediaUri);
      if (stats.processed % 25 === 0) {
        console.log(
          `[dry-run] processed ${stats.processed}/${candidates.length} | imported=${stats.imported} | skipped=${stats.skipped_existing}`
        );
      }
      continue;
    }

    const videoBuffer = fs.readFileSync(resolved.filePath);
    const upload = await supabase.storage
      .from("acervo")
      .upload(storagePath, videoBuffer, {
        contentType,
        upsert: false,
      });

    if (upload.error && !/already exists|Duplicate/i.test(upload.error.message || "")) {
      stats.upload_errors += 1;
      if (failures.length < maxFailureLog) {
        failures.push({
          media_uri: mediaUri,
          reason: "upload_error",
          detail: upload.error.message,
        });
      }
      continue;
    }

    const { data: publicData } = supabase.storage.from("acervo").getPublicUrl(storagePath);
    const publicUrl = publicData.publicUrl;

    const itemInsert = await supabase
      .from("acervo_items")
      .insert({
        titulo: sanitizeJsonText(titleFromCaption(caption, creationDate)),
        descricao: interpretation,
        tipo_midia: "video",
        formato_original: path.extname(resolved.filePath).replace(".", "").toLowerCase() || "mp4",
        tamanho_bytes: fileStat.size,
        duracao_segundos: null,
        data_criacao: creationDate.toISOString(),
        data_ingestao: new Date().toISOString(),
        status,
        autor_registro: IMPORT_VERSION,
        url_original: sanitizeJsonText(publicUrl),
        transcricao: transcriptText,
        metadata_exif: metadataExif,
        gps_lat: gps.lat,
        gps_lng: gps.lng,
        fazenda_id: fazenda?.id ?? null,
        tom_narrativo: tone,
        classificacao: "inferencia",
      })
      .select("id")
      .single();

    if (itemInsert.error) {
      stats.insert_errors += 1;
      if (failures.length < maxFailureLog) {
        failures.push({
          media_uri: mediaUri,
          reason: "insert_error",
          detail: itemInsert.error.message,
        });
      }
      continue;
    }

    const itemId = itemInsert.data.id;
    const tagCandidates = new Set(["Reel", periodTag, toneTag, ...themeNames]);
    const tagRows = Array.from(tagCandidates)
      .map((name) => ({
        name,
        normalized: normalizeForMatch(name),
      }))
      .filter((item) => tagMap.has(item.normalized))
      .map((item) => ({
        item_id: itemId,
        tag_id: tagMap.get(item.normalized),
      }));

    if (tagRows.length > 0) {
      const tagUpsert = await supabase
        .from("item_tags")
        .upsert(tagRows, { onConflict: "item_id,tag_id", ignoreDuplicates: true });
      if (tagUpsert.error) {
        stats.tag_link_errors += 1;
        if (failures.length < maxFailureLog) {
          failures.push({
            media_uri: mediaUri,
            reason: "tag_link_error",
            detail: tagUpsert.error.message,
          });
        }
      }
    }

    stats.imported += 1;
    existingUris.add(mediaUri);

    if (stats.processed % 10 === 0) {
      console.log(
        `[import] processed ${stats.processed}/${candidates.length} | imported=${stats.imported} | skipped=${stats.skipped_existing} | upload_errors=${stats.upload_errors} | insert_errors=${stats.insert_errors}`
      );
    }
  }

  const report = {
    ...stats,
    failures,
    finished_at: new Date().toISOString(),
  };

  const reportDir = path.join(process.cwd(), "tmp", "import-reports");
  ensureDir(reportDir);
  const reportFile = path.join(
    reportDir,
    `reels-import-${batchId}${dryRun ? "-dry-run" : ""}.json`
  );
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), "utf8");

  console.log("");
  console.log("Import finished.");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Report file: ${reportFile}`);
}

main().catch((error) => {
  console.error("Import failed:", error?.message || error);
  process.exit(1);
});
