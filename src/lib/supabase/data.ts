import type {
  AcervoFilters,
  AcervoItem,
  Colecao,
  Depoimento,
  EventoTimeline,
  Fazenda,
  PaginatedResult,
  Pessoa,
  StatusItem,
  Tag,
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

export type PessoaDetail = {
  pessoa: Pessoa;
  itens: AcervoItem[];
  depoimentos: Depoimento[];
};

export type FazendaDetail = {
  fazenda: Fazenda;
  itens: AcervoItem[];
  depoimentos: Depoimento[];
};

const ACERVO_SELECT =
  "id,titulo,descricao,tipo_midia,formato_original,tamanho_bytes,duracao_segundos,data_criacao,data_ingestao,data_publicacao,status,curador_id,autor_registro,url_original,url_thumbnail,url_proxy,transcricao,metadata_exif,gps_lat,gps_lng,fazenda_id,tom_narrativo,classificacao,created_at,updated_at";

const PESSOA_SELECT =
  "id,nome_completo,papel,tipo,biografia,data_nascimento,tempo_empresa,citacao_destaque,foto_url,ativo,created_at";

const FAZENDA_SELECT =
  "id,nome,municipio,estado,gps_lat,gps_lng,funcao_principal,funcoes_secundarias,area_hectares,infraestrutura,status,descricao,foto_url,e_sede_casa,created_at";

const COLECAO_SELECT =
  "id,titulo,descricao,tipo,slug,capa_url,publicada,ordem,curador_id,created_at";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function shouldUseMockFallback() {
  return !IS_PRODUCTION;
}

function logScopeError(scope: string, error: unknown) {
  console.error(`[supabase-data:${scope}]`, error);
}

function toFazendaMap(rows: Fazenda[]) {
  const map = new Map<string, Fazenda>();
  rows.forEach((row) => map.set(row.id, row));
  return map;
}

function attachFazenda(rows: AcervoItem[], fazendas: Fazenda[]) {
  const fazendasMap = toFazendaMap(fazendas);
  return rows.map((row) => ({
    ...row,
    fazenda: row.fazenda_id ? fazendasMap.get(row.fazenda_id) : undefined,
  }));
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function normalizePagination(filters?: AcervoFilters) {
  const page = Math.max(1, Number(filters?.page ?? 1) || 1);
  const perPage = Math.max(
    1,
    Math.min(60, Number(filters?.per_page ?? 12) || 12)
  );
  return { page, perPage };
}

function paginate<T>(
  rows: T[],
  page: number,
  perPage: number
): PaginatedResult<T> {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * perPage;
  const to = from + perPage;

  return {
    data: rows.slice(from, to),
    total,
    page: safePage,
    per_page: perPage,
    total_pages: totalPages,
  };
}

function filterMockAcervo(filters?: AcervoFilters) {
  let rows = [...mockAcervoItems];

  if (filters?.tipo_midia) {
    rows = rows.filter((row) => row.tipo_midia === filters.tipo_midia);
  }
  if (filters?.status) {
    rows = rows.filter((row) => row.status === filters.status);
  }
  if (filters?.fazenda_id) {
    rows = rows.filter((row) => row.fazenda_id === filters.fazenda_id);
  }

  const fromTs = parseDate(filters?.data_inicio);
  if (fromTs) {
    rows = rows.filter((row) => {
      const itemTs = parseDate(row.data_criacao);
      return itemTs !== null && itemTs >= fromTs;
    });
  }

  const toTs = parseDate(filters?.data_fim);
  if (toTs) {
    const endOfDay = toTs + 24 * 60 * 60 * 1000 - 1;
    rows = rows.filter((row) => {
      const itemTs = parseDate(row.data_criacao);
      return itemTs !== null && itemTs <= endOfDay;
    });
  }

  const normalized = (filters?.search ?? "").trim().toLowerCase();
  if (normalized) {
    rows = rows.filter((row) => {
      const haystack = `${row.titulo} ${row.descricao ?? ""} ${
        row.transcricao ?? ""
      }`.toLowerCase();
      return haystack.includes(normalized);
    });
  }

  rows.sort((a, b) => {
    const aTs = parseDate(a.data_criacao) ?? parseDate(a.created_at) ?? 0;
    const bTs = parseDate(b.data_criacao) ?? parseDate(b.created_at) ?? 0;
    return bTs - aTs;
  });

  return rows;
}

async function fetchFazendasRaw(): Promise<Fazenda[]> {
  const supabase = createServerDataClient();
  const { data, error } = await supabase
    .from("fazendas")
    .select(FAZENDA_SELECT)
    .order("e_sede_casa", { ascending: false })
    .order("nome", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Fazenda[];
}

async function fetchAcervoRaw(
  filters?: AcervoFilters,
  useFullTextSearch = true
): Promise<AcervoItem[]> {
  const supabase = createServerDataClient();
  let dbQuery = supabase
    .from("acervo_items")
    .select(ACERVO_SELECT)
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
    if (useFullTextSearch) {
      dbQuery = dbQuery.textSearch("search_vector", normalized, {
        config: "portuguese",
        type: "websearch",
      });
    } else {
      const escaped = normalized.replace(/,/g, " ");
      dbQuery = dbQuery.or(
        `titulo.ilike.%${escaped}%,descricao.ilike.%${escaped}%,transcricao.ilike.%${escaped}%`
      );
    }
  }

  const [{ data, error }, fazendas] = await Promise.all([
    dbQuery,
    fetchFazendasRaw(),
  ]);

  if (error) {
    throw error;
  }

  return attachFazenda((data ?? []) as AcervoItem[], fazendas);
}

async function fetchAcervoPageRaw(
  filters: AcervoFilters | undefined,
  page: number,
  perPage: number,
  useFullTextSearch = true
): Promise<PaginatedResult<AcervoItem>> {
  const supabase = createServerDataClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let dbQuery = supabase
    .from("acervo_items")
    .select(ACERVO_SELECT, { count: "exact" })
    .order("data_criacao", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

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
    if (useFullTextSearch) {
      dbQuery = dbQuery.textSearch("search_vector", normalized, {
        config: "portuguese",
        type: "websearch",
      });
    } else {
      const escaped = normalized.replace(/,/g, " ");
      dbQuery = dbQuery.or(
        `titulo.ilike.%${escaped}%,descricao.ilike.%${escaped}%,transcricao.ilike.%${escaped}%`
      );
    }
  }

  const [{ data, error, count }, fazendas] = await Promise.all([
    dbQuery,
    fetchFazendasRaw(),
  ]);

  if (error) {
    throw error;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    data: attachFazenda((data ?? []) as AcervoItem[], fazendas),
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
  };
}

function emptyDashboardStats(): DashboardStat[] {
  return [
    {
      label: "Arquivos no acervo",
      value: "0",
      accent: "var(--rc-gold)",
    },
    {
      label: "Videos catalogados",
      value: "0",
      accent: "var(--rc-green-bright)",
    },
    {
      label: "Transcricoes SRT",
      value: "0",
      accent: "var(--accent-blue)",
    },
    {
      label: "Anos de registro",
      value: "0+",
      accent: "var(--accent-amber)",
    },
  ];
}

export async function getFazendas(): Promise<Fazenda[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockFazendas : [];
  }

  try {
    return await fetchFazendasRaw();
  } catch (error) {
    logScopeError("getFazendas", error);
    return shouldUseMockFallback() ? mockFazendas : [];
  }
}

export async function getFazendaById(id: string): Promise<FazendaDetail | null> {
  if (!isSupabaseConfigured()) {
    if (!shouldUseMockFallback()) return null;
    const fazenda = mockFazendas.find((row) => row.id === id);
    if (!fazenda) return null;
    const itens = mockAcervoItems.filter((row) => row.fazenda_id === id);
    const depoimentos = mockDepoimentos.filter((row) =>
      itens.some((item) => item.id === row.item_origem_id)
    );
    return { fazenda, itens, depoimentos };
  }

  try {
    const supabase = createServerDataClient();

    const { data: fazendaRow, error: fazendaError } = await supabase
      .from("fazendas")
      .select(FAZENDA_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (fazendaError) throw fazendaError;
    if (!fazendaRow) return null;

    const { data: itensRows, error: itensError } = await supabase
      .from("acervo_items")
      .select(ACERVO_SELECT)
      .eq("fazenda_id", id)
      .order("data_criacao", { ascending: false })
      .order("created_at", { ascending: false });

    if (itensError) throw itensError;

    const itens = ((itensRows ?? []) as AcervoItem[]).map((item) => ({
      ...item,
      fazenda: fazendaRow as Fazenda,
    }));
    const itemIds = itens.map((item) => item.id);

    let depoimentos: Depoimento[] = [];
    if (itemIds.length > 0) {
      const [
        { data: depoimentosRows, error: depoimentosError },
        { data: pessoasRows, error: pessoasError },
      ] = await Promise.all([
        supabase
          .from("depoimentos")
          .select(
            "id,pessoa_id,conteudo,contexto,item_origem_id,data_registro,publicado,created_at"
          )
          .in("item_origem_id", itemIds)
          .order("created_at", { ascending: false }),
        supabase.from("pessoas").select(PESSOA_SELECT),
      ]);

      if (depoimentosError) throw depoimentosError;
      if (pessoasError) throw pessoasError;

      const pessoaMap = new Map(
        ((pessoasRows ?? []) as Pessoa[]).map((row) => [row.id, row])
      );
      const itemMap = new Map(itens.map((row) => [row.id, row]));

      depoimentos = ((depoimentosRows ?? []) as Depoimento[]).map((row) => ({
        ...row,
        pessoa: pessoaMap.get(row.pessoa_id),
        item_origem: row.item_origem_id
          ? itemMap.get(row.item_origem_id)
          : undefined,
      }));
    }

    return {
      fazenda: fazendaRow as Fazenda,
      itens,
      depoimentos,
    };
  } catch (error) {
    logScopeError("getFazendaById", error);
    if (!shouldUseMockFallback()) return null;
    const fazenda = mockFazendas.find((row) => row.id === id);
    if (!fazenda) return null;
    const itens = mockAcervoItems.filter((row) => row.fazenda_id === id);
    const depoimentos = mockDepoimentos.filter((row) =>
      itens.some((item) => item.id === row.item_origem_id)
    );
    return { fazenda, itens, depoimentos };
  }
}

export async function getPessoas(): Promise<Pessoa[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockPessoas : [];
  }

  try {
    const supabase = createServerDataClient();
    const { data, error } = await supabase
      .from("pessoas")
      .select(PESSOA_SELECT)
      .order("nome_completo", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Pessoa[];
  } catch (error) {
    logScopeError("getPessoas", error);
    return shouldUseMockFallback() ? mockPessoas : [];
  }
}

export async function getPessoaById(id: string): Promise<PessoaDetail | null> {
  if (!isSupabaseConfigured()) {
    if (!shouldUseMockFallback()) return null;
    const pessoa = mockPessoas.find((row) => row.id === id);
    if (!pessoa) return null;
    const itens = mockAcervoItems.filter((row) =>
      row.pessoas?.some((p) => p.id === id)
    );
    const depoimentos = mockDepoimentos.filter((row) => row.pessoa_id === id);
    return { pessoa, itens, depoimentos };
  }

  try {
    const supabase = createServerDataClient();
    const { data: pessoaRow, error: pessoaError } = await supabase
      .from("pessoas")
      .select(PESSOA_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (pessoaError) throw pessoaError;
    if (!pessoaRow) return null;

    const [
      { data: itemLinks, error: itemLinksError },
      { data: depoimentosRows, error: depoimentosError },
    ] = await Promise.all([
      supabase
        .from("item_pessoas")
        .select("item_id,papel_no_item")
        .eq("pessoa_id", id),
      supabase
        .from("depoimentos")
        .select(
          "id,pessoa_id,conteudo,contexto,item_origem_id,data_registro,publicado,created_at"
        )
        .eq("pessoa_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (itemLinksError) throw itemLinksError;
    if (depoimentosError) throw depoimentosError;

    const itemIds = Array.from(
      new Set(
        ((itemLinks ?? []) as Array<{ item_id: string }>).map(
          (row) => row.item_id
        )
      )
    );
    ((depoimentosRows ?? []) as Depoimento[]).forEach((row) => {
      if (row.item_origem_id) itemIds.push(row.item_origem_id);
    });

    const uniqueItemIds = Array.from(new Set(itemIds));

    let itens: AcervoItem[] = [];
    if (uniqueItemIds.length > 0) {
      const [{ data: itensRows, error: itensError }, fazendas] = await Promise.all([
        supabase.from("acervo_items").select(ACERVO_SELECT).in("id", uniqueItemIds),
        fetchFazendasRaw(),
      ]);
      if (itensError) throw itensError;
      itens = attachFazenda((itensRows ?? []) as AcervoItem[], fazendas).sort(
        (a, b) => {
          const aTs = parseDate(a.data_criacao) ?? parseDate(a.created_at) ?? 0;
          const bTs = parseDate(b.data_criacao) ?? parseDate(b.created_at) ?? 0;
          return bTs - aTs;
        }
      );
    }

    const itemMap = new Map(itens.map((item) => [item.id, item]));
    const depoimentos = ((depoimentosRows ?? []) as Depoimento[]).map((row) => ({
      ...row,
      pessoa: pessoaRow as Pessoa,
      item_origem: row.item_origem_id ? itemMap.get(row.item_origem_id) : undefined,
    }));

    const itemLinkSet = new Set(
      ((itemLinks ?? []) as Array<{ item_id: string }>).map((row) => row.item_id)
    );
    const itensRelacionados = itens.filter((item) => itemLinkSet.has(item.id));

    return {
      pessoa: pessoaRow as Pessoa,
      itens: itensRelacionados,
      depoimentos,
    };
  } catch (error) {
    logScopeError("getPessoaById", error);
    if (!shouldUseMockFallback()) return null;
    const pessoa = mockPessoas.find((row) => row.id === id);
    if (!pessoa) return null;
    const itens = mockAcervoItems.filter((row) =>
      row.pessoas?.some((p) => p.id === id)
    );
    const depoimentos = mockDepoimentos.filter((row) => row.pessoa_id === id);
    return { pessoa, itens, depoimentos };
  }
}

export async function getAcervoItems(filters?: AcervoFilters): Promise<AcervoItem[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? filterMockAcervo(filters) : [];
  }

  try {
    return await fetchAcervoRaw(filters, true);
  } catch (error) {
    logScopeError("getAcervoItems", error);
    const hasSearch = Boolean((filters?.search ?? "").trim());
    if (hasSearch) {
      try {
        return await fetchAcervoRaw(filters, false);
      } catch (fallbackError) {
        logScopeError("getAcervoItems:ilike-fallback", fallbackError);
      }
    }
    return shouldUseMockFallback() ? filterMockAcervo(filters) : [];
  }
}

export async function getAcervoItemsPaginated(
  filters?: AcervoFilters
): Promise<PaginatedResult<AcervoItem>> {
  const { page, perPage } = normalizePagination(filters);

  if (!isSupabaseConfigured()) {
    if (!shouldUseMockFallback()) {
      return {
        data: [],
        total: 0,
        page,
        per_page: perPage,
        total_pages: 1,
      };
    }
    return paginate(filterMockAcervo(filters), page, perPage);
  }

  try {
    return await fetchAcervoPageRaw(filters, page, perPage, true);
  } catch (error) {
    logScopeError("getAcervoItemsPaginated", error);
    const hasSearch = Boolean((filters?.search ?? "").trim());
    if (hasSearch) {
      try {
        return await fetchAcervoPageRaw(filters, page, perPage, false);
      } catch (fallbackError) {
        logScopeError("getAcervoItemsPaginated:ilike-fallback", fallbackError);
      }
    }

    if (shouldUseMockFallback()) {
      return paginate(filterMockAcervo(filters), page, perPage);
    }

    return {
      data: [],
      total: 0,
      page,
      per_page: perPage,
      total_pages: 1,
    };
  }
}

export async function getAcervoItemById(id: string): Promise<AcervoItem | null> {
  if (!isSupabaseConfigured()) {
    if (!shouldUseMockFallback()) return null;
    return mockAcervoItems.find((row) => row.id === id) ?? null;
  }

  try {
    const supabase = createServerDataClient();
    const [
      { data: itemRow, error: itemError },
      fazendas,
      { data: itemPessoasRows, error: itemPessoasError },
      { data: itemTagsRows, error: itemTagsError },
      { data: colecaoLinksRows, error: colecaoLinksError },
    ] = await Promise.all([
      supabase
        .from("acervo_items")
        .select(ACERVO_SELECT)
        .eq("id", id)
        .maybeSingle(),
      fetchFazendasRaw(),
      supabase
        .from("item_pessoas")
        .select("pessoa_id,papel_no_item")
        .eq("item_id", id),
      supabase.from("item_tags").select("tag_id").eq("item_id", id),
      supabase
        .from("colecao_items")
        .select("colecao_id,ordem")
        .eq("item_id", id)
        .order("ordem", { ascending: true }),
    ]);

    if (itemError) throw itemError;
    if (itemPessoasError) throw itemPessoasError;
    if (itemTagsError) throw itemTagsError;
    if (colecaoLinksError) throw colecaoLinksError;
    if (!itemRow) return null;

    const pessoaIds = Array.from(
      new Set(
        ((itemPessoasRows ?? []) as Array<{ pessoa_id: string }>).map(
          (row) => row.pessoa_id
        )
      )
    );
    const tagIds = Array.from(
      new Set(
        ((itemTagsRows ?? []) as Array<{ tag_id: string }>).map(
          (row) => row.tag_id
        )
      )
    );
    const colecaoIds = Array.from(
      new Set(
        ((colecaoLinksRows ?? []) as Array<{ colecao_id: string }>).map(
          (row) => row.colecao_id
        )
      )
    );

    const [pessoasRows, tagsRows, colecoesRows] = await Promise.all([
      pessoaIds.length > 0
        ? supabase.from("pessoas").select(PESSOA_SELECT).in("id", pessoaIds)
        : Promise.resolve({ data: [], error: null }),
      tagIds.length > 0
        ? supabase.from("tags").select("id,nome,categoria").in("id", tagIds)
        : Promise.resolve({ data: [], error: null }),
      colecaoIds.length > 0
        ? supabase.from("colecoes").select(COLECAO_SELECT).in("id", colecaoIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (pessoasRows.error) throw pessoasRows.error;
    if (tagsRows.error) throw tagsRows.error;
    if (colecoesRows.error) throw colecoesRows.error;

    const pessoasMap = new Map(
      ((pessoasRows.data ?? []) as Pessoa[]).map((row) => [row.id, row])
    );
    const tagsMap = new Map(
      ((tagsRows.data ?? []) as Tag[]).map((row) => [row.id, row])
    );
    const colecoesMap = new Map(
      ((colecoesRows.data ?? []) as Colecao[]).map((row) => [row.id, row])
    );
    const colecaoOrderMap = new Map(
      ((colecaoLinksRows ?? []) as Array<{ colecao_id: string; ordem: number }>).map(
        (row) => [row.colecao_id, row.ordem]
      )
    );

    const [item] = attachFazenda([itemRow as AcervoItem], fazendas);
    item.pessoas = (
      (itemPessoasRows ?? []) as Array<{ pessoa_id: string }>
    ).flatMap((row) => {
      const pessoa = pessoasMap.get(row.pessoa_id);
      return pessoa ? [pessoa] : [];
    });
    item.tags = ((itemTagsRows ?? []) as Array<{ tag_id: string }>).flatMap(
      (row) => {
        const tag = tagsMap.get(row.tag_id);
        return tag ? [tag] : [];
      }
    );
    item.colecoes = (
      (colecaoLinksRows ?? []) as Array<{ colecao_id: string }>
    )
      .flatMap((row) => {
        const colecao = colecoesMap.get(row.colecao_id);
        return colecao ? [colecao] : [];
      })
      .sort((a, b) => {
        const aOrder = colecaoOrderMap.get(a.id) ?? 0;
        const bOrder = colecaoOrderMap.get(b.id) ?? 0;
        return aOrder - bOrder;
      });

    return item;
  } catch (error) {
    logScopeError("getAcervoItemById", error);
    if (!shouldUseMockFallback()) return null;
    return mockAcervoItems.find((row) => row.id === id) ?? null;
  }
}

export async function searchAcervoItems(query: string): Promise<AcervoItem[]> {
  const normalized = query.trim();
  if (!normalized) {
    return getAcervoItems();
  }

  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockSearchAcervo(normalized) : [];
  }

  try {
    return await fetchAcervoRaw({ search: normalized }, true);
  } catch (error) {
    logScopeError("searchAcervoItems", error);
    try {
      return await fetchAcervoRaw({ search: normalized }, false);
    } catch (fallbackError) {
      logScopeError("searchAcervoItems:ilike-fallback", fallbackError);
      return shouldUseMockFallback() ? mockSearchAcervo(normalized) : [];
    }
  }
}

export async function getColecoes(): Promise<Colecao[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockColecoes : [];
  }

  try {
    const supabase = createServerDataClient();
    const [
      { data: colecoesRows, error: colecoesError },
      { data: linksRows, error: linksError },
    ] =
      await Promise.all([
        supabase
          .from("colecoes")
          .select(COLECAO_SELECT)
          .order("ordem", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase.from("colecao_items").select("colecao_id"),
      ]);

    if (colecoesError) throw colecoesError;
    if (linksError) throw linksError;

    const countMap = new Map<string, number>();
    ((linksRows ?? []) as Array<{ colecao_id: string }>).forEach((row) => {
      countMap.set(row.colecao_id, (countMap.get(row.colecao_id) ?? 0) + 1);
    });

    return ((colecoesRows ?? []) as Colecao[]).map((row) => ({
      ...row,
      item_count: countMap.get(row.id) ?? 0,
    }));
  } catch (error) {
    logScopeError("getColecoes", error);
    return shouldUseMockFallback() ? mockColecoes : [];
  }
}

export async function getColecaoBySlug(slug: string): Promise<Colecao | null> {
  if (!isSupabaseConfigured()) {
    if (!shouldUseMockFallback()) return null;
    const local = mockColecoes.find((row) => row.slug === slug);
    return local ?? null;
  }

  try {
    const supabase = createServerDataClient();
    const { data: colecaoRow, error: colecaoError } = await supabase
      .from("colecoes")
      .select(COLECAO_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (colecaoError) throw colecaoError;
    if (!colecaoRow) return null;

    const { data: linksRows, error: linksError } = await supabase
      .from("colecao_items")
      .select("item_id,ordem")
      .eq("colecao_id", colecaoRow.id)
      .order("ordem", { ascending: true });

    if (linksError) throw linksError;

    const orderedIds = ((linksRows ?? []) as Array<{ item_id: string }>).map(
      (row) => row.item_id
    );

    let items: AcervoItem[] = [];
    if (orderedIds.length > 0) {
      const [{ data: itemRows, error: itemError }, fazendas] = await Promise.all([
        supabase.from("acervo_items").select(ACERVO_SELECT).in("id", orderedIds),
        fetchFazendasRaw(),
      ]);

      if (itemError) throw itemError;

      const mapById = new Map(
        attachFazenda((itemRows ?? []) as AcervoItem[], fazendas).map((row) => [
          row.id,
          row,
        ])
      );
      items = orderedIds.flatMap((itemId) => {
        const row = mapById.get(itemId);
        return row ? [row] : [];
      });
    }

    return {
      ...(colecaoRow as Colecao),
      items,
      item_count: orderedIds.length,
    };
  } catch (error) {
    logScopeError("getColecaoBySlug", error);
    if (!shouldUseMockFallback()) return null;
    return mockColecoes.find((row) => row.slug === slug) ?? null;
  }
}

export async function getTimelineEvents(): Promise<EventoTimeline[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockEventosTimeline : [];
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

    if (error) throw error;
    return (data ?? []) as EventoTimeline[];
  } catch (error) {
    logScopeError("getTimelineEvents", error);
    return shouldUseMockFallback() ? mockEventosTimeline : [];
  }
}

export async function getDepoimentos(): Promise<Depoimento[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockDepoimentos : [];
  }

  try {
    const supabase = createServerDataClient();
    const [
      { data: depoimentosRows, error: depoimentosError },
      { data: pessoasRows, error: pessoasError },
      { data: acervoRows, error: acervoError },
      fazendas,
    ] = await Promise.all([
      supabase
        .from("depoimentos")
        .select(
          "id,pessoa_id,conteudo,contexto,item_origem_id,data_registro,publicado,created_at"
        )
        .order("created_at", { ascending: false }),
      supabase.from("pessoas").select(PESSOA_SELECT),
      supabase.from("acervo_items").select(ACERVO_SELECT),
      fetchFazendasRaw(),
    ]);

    if (depoimentosError) throw depoimentosError;
    if (pessoasError) throw pessoasError;
    if (acervoError) throw acervoError;

    const pessoasMap = new Map(
      ((pessoasRows ?? []) as Pessoa[]).map((row) => [row.id, row])
    );
    const acervoComFazenda = attachFazenda((acervoRows ?? []) as AcervoItem[], fazendas);
    const acervoMap = new Map(acervoComFazenda.map((row) => [row.id, row]));

    return ((depoimentosRows ?? []) as Depoimento[]).map((row) => ({
      ...row,
      pessoa: pessoasMap.get(row.pessoa_id),
      item_origem: row.item_origem_id
        ? acervoMap.get(row.item_origem_id)
        : undefined,
    }));
  } catch (error) {
    logScopeError("getDepoimentos", error);
    return shouldUseMockFallback() ? mockDepoimentos : [];
  }
}

export async function getDashboardStats(): Promise<DashboardStat[]> {
  if (!isSupabaseConfigured()) {
    return shouldUseMockFallback() ? mockDashboardStats : emptyDashboardStats();
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
      : "0";

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
    return shouldUseMockFallback() ? mockDashboardStats : emptyDashboardStats();
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
    if (!shouldUseMockFallback()) return base;
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
    if (!shouldUseMockFallback()) return base;
    const local = toCuradoriaShape(mockAcervoItems);
    local.forEach((row) => base[row.status].push(row));
    return base;
  }
}
