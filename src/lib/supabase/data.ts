import type {
  AcervoFilters,
  AcervoItem,
  Colecao,
  Depoimento,
  EventoTimeline,
  Fazenda,
  Pessoa,
  StatusItem,
} from "@/types/database";
import {
  acervoItems as mockAcervoItems,
  colecoes as mockColecoes,
  dashboardStats as mockDashboardStats,
  depoimentos as mockDepoimentos,
  eventosTimeline as mockEventosTimeline,
  fazendas as mockFazendas,
  pessoas as mockPessoas,
  searchAcervo as mockSearchAcervo,
} from "@/lib/mock-data";
import { createServerDataClient } from "@/lib/supabase/server";

type DashboardStat = {
  label: string;
  value: string;
  accent: string;
};

type CuradoriaBuckets = Record<StatusItem, Array<Pick<AcervoItem, "id" | "titulo" | "tipo_midia" | "status">>>;

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function logScopeError(scope: string, error: unknown) {
  console.error(`[supabase-data:${scope}]`, error);
}

function toFazendaMap(rows: Fazenda[]) {
  const map = new Map<string, Fazenda>();
  rows.forEach((row) => map.set(row.id, row));
  return map;
}

async function fetchFazendasRaw(): Promise<Fazenda[]> {
  const supabase = createServerDataClient();
  const { data, error } = await supabase
    .from("fazendas")
    .select(
      "id,nome,municipio,estado,gps_lat,gps_lng,funcao_principal,funcoes_secundarias,area_hectares,infraestrutura,status,descricao,foto_url,e_sede_casa,created_at"
    )
    .order("e_sede_casa", { ascending: false })
    .order("nome", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Fazenda[];
}

async function fetchAcervoRaw(filters?: AcervoFilters): Promise<AcervoItem[]> {
  const supabase = createServerDataClient();
  let dbQuery = supabase
    .from("acervo_items")
    .select(
      "id,titulo,descricao,tipo_midia,formato_original,tamanho_bytes,duracao_segundos,data_criacao,data_ingestao,data_publicacao,status,curador_id,autor_registro,url_original,url_thumbnail,url_proxy,transcricao,metadata_exif,gps_lat,gps_lng,fazenda_id,tom_narrativo,classificacao,created_at,updated_at"
    )
    .order("data_criacao", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters?.tipo_midia) {
    dbQuery = dbQuery.eq("tipo_midia", filters.tipo_midia);
  }
  if (filters?.status) {
    dbQuery = dbQuery.eq("status", filters.status);
  }
  if (filters?.fazenda_id) {
    dbQuery = dbQuery.eq("fazenda_id", filters.fazenda_id);
  }
  if (filters?.data_inicio) {
    dbQuery = dbQuery.gte("data_criacao", filters.data_inicio);
  }
  if (filters?.data_fim) {
    dbQuery = dbQuery.lte("data_criacao", filters.data_fim);
  }

  const normalized = (filters?.search ?? "").trim();
  if (normalized) {
    const escaped = normalized.replace(/,/g, " ");
    dbQuery = dbQuery.or(
      `titulo.ilike.%${escaped}%,descricao.ilike.%${escaped}%,transcricao.ilike.%${escaped}%`
    );
  }

  const [{ data, error }, fazendas] = await Promise.all([
    dbQuery,
    fetchFazendasRaw(),
  ]);

  if (error) {
    throw error;
  }

  const fazendasMap = toFazendaMap(fazendas);
  const rows = (data ?? []) as AcervoItem[];

  return rows.map((row) => ({
    ...row,
    fazenda: row.fazenda_id ? fazendasMap.get(row.fazenda_id) : undefined,
  }));
}

export async function getFazendas(): Promise<Fazenda[]> {
  if (!isSupabaseConfigured()) {
    return mockFazendas;
  }

  try {
    const rows = await fetchFazendasRaw();
    return rows;
  } catch (error) {
    logScopeError("getFazendas", error);
    return mockFazendas;
  }
}

export async function getPessoas(): Promise<Pessoa[]> {
  if (!isSupabaseConfigured()) {
    return mockPessoas;
  }

  try {
    const supabase = createServerDataClient();
    const { data, error } = await supabase
      .from("pessoas")
      .select(
        "id,nome_completo,papel,tipo,biografia,data_nascimento,tempo_empresa,citacao_destaque,foto_url,ativo,created_at"
      )
      .order("nome_completo", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as Pessoa[];
    return rows;
  } catch (error) {
    logScopeError("getPessoas", error);
    return mockPessoas;
  }
}

export async function getAcervoItems(filters?: AcervoFilters): Promise<AcervoItem[]> {
  if (!isSupabaseConfigured()) {
    return mockAcervoItems;
  }

  try {
    const rows = await fetchAcervoRaw(filters);
    return rows;
  } catch (error) {
    logScopeError("getAcervoItems", error);
    return mockAcervoItems;
  }
}

export async function searchAcervoItems(query: string): Promise<AcervoItem[]> {
  const normalized = query.trim();
  if (!normalized) {
    return getAcervoItems();
  }

  if (!isSupabaseConfigured()) {
    return mockSearchAcervo(normalized);
  }

  try {
    const rows = await fetchAcervoRaw({ search: normalized });
    return rows;
  } catch (error) {
    logScopeError("searchAcervoItems", error);
    return mockSearchAcervo(normalized);
  }
}

export async function getColecoes(): Promise<Colecao[]> {
  if (!isSupabaseConfigured()) {
    return mockColecoes;
  }

  try {
    const supabase = createServerDataClient();
    const [{ data: colecoes, error: colecoesError }, { data: links, error: linksError }] =
      await Promise.all([
        supabase
          .from("colecoes")
          .select(
            "id,titulo,descricao,tipo,slug,capa_url,publicada,ordem,curador_id,created_at"
          )
          .order("ordem", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase.from("colecao_items").select("colecao_id"),
      ]);

    if (colecoesError) {
      throw colecoesError;
    }

    if (linksError) {
      throw linksError;
    }

    const countMap = new Map<string, number>();
    ((links ?? []) as Array<{ colecao_id: string }>).forEach((row) => {
      countMap.set(row.colecao_id, (countMap.get(row.colecao_id) ?? 0) + 1);
    });

    const rows = ((colecoes ?? []) as Colecao[]).map((row) => ({
      ...row,
      item_count: countMap.get(row.id) ?? 0,
    }));

    return rows;
  } catch (error) {
    logScopeError("getColecoes", error);
    return mockColecoes;
  }
}

export async function getTimelineEvents(): Promise<EventoTimeline[]> {
  if (!isSupabaseConfigured()) {
    return mockEventosTimeline;
  }

  try {
    const supabase = createServerDataClient();
    const { data, error } = await supabase
      .from("eventos_timeline")
      .select(
        "id,titulo,descricao,data_evento,data_fim,tipo,fonte,item_vinculado_id,destaque,created_at"
      )
      .order("data_evento", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as EventoTimeline[];
    return rows;
  } catch (error) {
    logScopeError("getTimelineEvents", error);
    return mockEventosTimeline;
  }
}

export async function getDepoimentos(): Promise<Depoimento[]> {
  if (!isSupabaseConfigured()) {
    return mockDepoimentos;
  }

  try {
    const supabase = createServerDataClient();
    const [
      { data: depoimentos, error: depoimentosError },
      { data: pessoas, error: pessoasError },
      { data: acervo, error: acervoError },
    ] = await Promise.all([
      supabase
        .from("depoimentos")
        .select(
          "id,pessoa_id,conteudo,contexto,item_origem_id,data_registro,publicado,created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("pessoas")
        .select(
          "id,nome_completo,papel,tipo,biografia,data_nascimento,tempo_empresa,citacao_destaque,foto_url,ativo,created_at"
        ),
      supabase
        .from("acervo_items")
        .select(
          "id,titulo,descricao,tipo_midia,formato_original,tamanho_bytes,duracao_segundos,data_criacao,data_ingestao,data_publicacao,status,curador_id,autor_registro,url_original,url_thumbnail,url_proxy,transcricao,metadata_exif,gps_lat,gps_lng,fazenda_id,tom_narrativo,classificacao,created_at,updated_at"
        ),
    ]);

    if (depoimentosError) {
      throw depoimentosError;
    }
    if (pessoasError) {
      throw pessoasError;
    }
    if (acervoError) {
      throw acervoError;
    }

    const pessoasMap = new Map((pessoas ?? []).map((row) => [row.id, row as Pessoa]));
    const acervoMap = new Map((acervo ?? []).map((row) => [row.id, row as AcervoItem]));

    const rows = ((depoimentos ?? []) as Depoimento[]).map((row) => ({
      ...row,
      pessoa: pessoasMap.get(row.pessoa_id),
      item_origem: row.item_origem_id
        ? acervoMap.get(row.item_origem_id)
        : undefined,
    }));

    return rows;
  } catch (error) {
    logScopeError("getDepoimentos", error);
    return mockDepoimentos;
  }
}

export async function getDashboardStats(): Promise<DashboardStat[]> {
  if (!isSupabaseConfigured()) {
    return mockDashboardStats;
  }

  try {
    const supabase = createServerDataClient();
    const [
      { count: totalAcervo, error: totalError },
      { count: totalVideos, error: videosError },
      { count: totalSrt, error: srtError },
      { data: firstItem, error: firstItemError },
    ] = await Promise.all([
      supabase
        .from("acervo_items")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("acervo_items")
        .select("*", { count: "exact", head: true })
        .eq("tipo_midia", "video"),
      supabase
        .from("acervo_items")
        .select("*", { count: "exact", head: true })
        .eq("tipo_midia", "transcricao"),
      supabase
        .from("acervo_items")
        .select("data_criacao")
        .not("data_criacao", "is", null)
        .order("data_criacao", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    if (totalError || videosError || srtError || firstItemError) {
      throw totalError ?? videosError ?? srtError ?? firstItemError;
    }

    const startYear = firstItem?.data_criacao
      ? new Date(firstItem.data_criacao).getFullYear()
      : null;
    const years = startYear
      ? String(Math.max(1, new Date().getFullYear() - startYear + 1))
      : "37+";

    return [
      {
        label: "Arquivos no acervo",
        value: (totalAcervo ?? 0).toLocaleString("pt-BR"),
        accent: "var(--rc-gold)",
      },
      {
        label: "Videos catalogados",
        value: (totalVideos ?? 0).toLocaleString("pt-BR"),
        accent: "var(--rc-green-bright)",
      },
      {
        label: "Transcricoes SRT",
        value: (totalSrt ?? 0).toLocaleString("pt-BR"),
        accent: "var(--accent-blue)",
      },
      {
        label: "Anos de registro",
        value: `${years}+`,
        accent: "var(--accent-amber)",
      },
    ];
  } catch (error) {
    logScopeError("getDashboardStats", error);
    return mockDashboardStats;
  }
}

export async function getCuradoriaBuckets(): Promise<CuradoriaBuckets> {
  const base: CuradoriaBuckets = {
    rascunho: [],
    em_revisao: [],
    aprovado: [],
    arquivado: [],
  };

  const toCuradoriaShape = (rows: AcervoItem[]) =>
    rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      tipo_midia: row.tipo_midia,
      status: row.status,
    }));

  if (!isSupabaseConfigured()) {
    const local = toCuradoriaShape(mockAcervoItems);
    local.forEach((row) => base[row.status].push(row));
    return base;
  }

  try {
    const supabase = createServerDataClient();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("id,titulo,tipo_midia,status")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = ((data ?? []) as Array<Pick<AcervoItem, "id" | "titulo" | "tipo_midia" | "status">>);
    rows.forEach((row) => {
      base[row.status].push(row);
    });

    return base;
  } catch (error) {
    logScopeError("getCuradoriaBuckets", error);
    const local = toCuradoriaShape(mockAcervoItems);
    local.forEach((row) => base[row.status].push(row));
    return base;
  }
}
