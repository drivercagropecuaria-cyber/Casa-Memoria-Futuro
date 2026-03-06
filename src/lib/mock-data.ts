import type {
  AcervoItem,
  Colecao,
  Depoimento,
  EventoTimeline,
  Fazenda,
  Pessoa,
  Tag,
  TipoMidia,
} from "@/types/database";

const NOW = "2026-03-06T00:00:00.000Z";

export const fazendas: Fazenda[] = [
  {
    id: "f-villa",
    nome: "Fazenda Villa Canabrava",
    municipio: "Engenheiro Navarro / Bocaiuva",
    estado: "MG",
    gps_lat: -17.414268,
    gps_lng: -43.93387,
    funcao_principal: "Sede e centro de operacoes",
    funcoes_secundarias: ["maternidade", "confinamento", "silagem", "feno"],
    area_hectares: 12200,
    infraestrutura:
      "Curral, maternidade, confinamento, pivos de irrigacao, fabrica de racao, capela e escola.",
    status: "ativa",
    descricao:
      "Centro operacional da RC e sede da Casa de Memoria e Futuro.",
    foto_url: null,
    e_sede_casa: true,
    created_at: NOW,
  },
  {
    id: "f-jequitai",
    nome: "Fazenda Jequitai",
    municipio: "Engenheiro Navarro",
    estado: "MG",
    gps_lat: null,
    gps_lng: null,
    funcao_principal: "Cria",
    funcoes_secundarias: ["producao de bezerros GUZONEL"],
    area_hectares: null,
    infraestrutura: "Unidade de cria com foco em bezerros.",
    status: "ativa",
    descricao: "Unidade ligada ao Rio Jequitai e a fase de cria.",
    foto_url: null,
    e_sede_casa: false,
    created_at: NOW,
  },
  {
    id: "f-feno",
    nome: "Feno da Villa",
    municipio: "Engenheiro Navarro",
    estado: "MG",
    gps_lat: null,
    gps_lng: null,
    funcao_principal: "Producao de feno",
    funcoes_secundarias: ["Tifton 85", "Vaquero", "venda"],
    area_hectares: 214,
    infraestrutura: "Campos irrigados e estrutura de enfardamento.",
    status: "ativa",
    descricao: "Unidade dedicada ao feno premium para equinos e bovinos.",
    foto_url: null,
    e_sede_casa: false,
    created_at: NOW,
  },
  {
    id: "f-terra-nova",
    nome: "Fazenda Terra Nova",
    municipio: "Bocaiuva",
    estado: "MG",
    gps_lat: null,
    gps_lng: null,
    funcao_principal: "Nao documentada",
    funcoes_secundarias: null,
    area_hectares: null,
    infraestrutura: "Pendente de validacao institucional.",
    status: "incerta",
    descricao: "Unidade mapeada no site, sem detalhamento confirmado.",
    foto_url: null,
    e_sede_casa: false,
    created_at: NOW,
  },
];

export const pessoas: Pessoa[] = [
  {
    id: "p-rodrigo",
    nome_completo: "Rodrigo Pinto Canabrava",
    papel: "Fundador, gestor e narrador",
    tipo: "proprietario",
    biografia:
      "Lider da RC Agropecuaria. Iniciou a selecao Guzera em 1988 e conduz o ciclo completo da operacao.",
    data_nascimento: "1957-06-03",
    tempo_empresa: "37+ anos",
    citacao_destaque:
      "Consistencia nao e sorte; e ciencia, metodo e cuidado diario.",
    foto_url: null,
    ativo: true,
    created_at: NOW,
  },
  {
    id: "p-pereira",
    nome_completo: "Pereira Rocha",
    papel: "Funcionario historico",
    tipo: "colaborador",
    biografia:
      "Um dos maiores simbolos de continuidade da fazenda, com mais de 50 anos de servico.",
    data_nascimento: null,
    tempo_empresa: "52 anos",
    citacao_destaque:
      "Cavalo de servico e colega de servico, nao apenas um animal.",
    foto_url: null,
    ativo: true,
    created_at: NOW,
  },
  {
    id: "p-andre",
    nome_completo: "Andre Assis Santos",
    papel: "Vaqueiro",
    tipo: "colaborador",
    biografia: "Representa a cultura de alegria e disciplina no manejo diario.",
    data_nascimento: null,
    tempo_empresa: null,
    citacao_destaque: "Eu amo ser vaqueiro, amo do que faco com gado.",
    foto_url: null,
    ativo: true,
    created_at: NOW,
  },
  {
    id: "p-dalton",
    nome_completo: "Dr. Dalton Moreira Canabrava",
    papel: "Raiz moral da familia",
    tipo: "familiar",
    biografia:
      "Figura publica mineira e referencia de valores que estruturam a visao institucional da RC.",
    data_nascimento: "1924-12-22",
    tempo_empresa: null,
    citacao_destaque:
      "A heranca maior foi etica, nao financeira.",
    foto_url: null,
    ativo: false,
    created_at: NOW,
  },
];

export const tags: Tag[] = [
  { id: "t-guzonel", nome: "GUZONEL", categoria: "tema" },
  { id: "t-iatf", nome: "IATF", categoria: "tema" },
  { id: "t-leilao", nome: "Leilao Qualidade Total", categoria: "tema" },
  { id: "t-poetico", nome: "Poetico", categoria: "tom" },
  { id: "t-tecnico", nome: "Tecnico", categoria: "tom" },
  { id: "t-reel", nome: "Reel", categoria: "formato" },
  { id: "t-story", nome: "Story", categoria: "formato" },
];

function item(
  overrides: Partial<AcervoItem> & {
    id: string;
    titulo: string;
    tipo_midia: TipoMidia;
  }
): AcervoItem {
  return {
    id: overrides.id,
    titulo: overrides.titulo,
    descricao: overrides.descricao ?? null,
    tipo_midia: overrides.tipo_midia,
    formato_original: overrides.formato_original ?? null,
    tamanho_bytes: overrides.tamanho_bytes ?? null,
    duracao_segundos: overrides.duracao_segundos ?? null,
    data_criacao: overrides.data_criacao ?? null,
    data_ingestao: overrides.data_ingestao ?? NOW,
    data_publicacao: overrides.data_publicacao ?? null,
    status: overrides.status ?? "aprovado",
    curador_id: overrides.curador_id ?? null,
    autor_registro: overrides.autor_registro ?? "Equipe RC",
    url_original: overrides.url_original ?? null,
    url_thumbnail: overrides.url_thumbnail ?? null,
    url_proxy: overrides.url_proxy ?? null,
    transcricao: overrides.transcricao ?? null,
    metadata_exif: overrides.metadata_exif ?? null,
    gps_lat: overrides.gps_lat ?? null,
    gps_lng: overrides.gps_lng ?? null,
    fazenda_id: overrides.fazenda_id ?? null,
    tom_narrativo: overrides.tom_narrativo ?? null,
    classificacao: overrides.classificacao ?? "fato",
    created_at: overrides.created_at ?? NOW,
    updated_at: overrides.updated_at ?? NOW,
    fazenda: overrides.fazenda,
    pessoas: overrides.pessoas,
    tags: overrides.tags,
    colecoes: overrides.colecoes,
  };
}

export const acervoItems: AcervoItem[] = [
  item({
    id: "a-001",
    titulo: "Leilao Qualidade Total 2025 - lote de destaque",
    descricao: "Registro de lote comercial com desempenho acima da media.",
    tipo_midia: "video",
    formato_original: "mp4",
    tamanho_bytes: 185_200_100,
    duracao_segundos: 96,
    data_criacao: "2025-06-14T10:00:00.000Z",
    data_publicacao: "2025-06-14T18:00:00.000Z",
    fazenda_id: "f-villa",
    tom_narrativo: "tecnico",
    transcricao: "Lote de alta consistencia, preparado em ciclo completo.",
    tags: [tags[2], tags[4], tags[5]],
  }),
  item({
    id: "a-002",
    titulo: "Comitiva entre Santa Maria e Villa Canabrava",
    descricao: "Transferencia de novilhas prenhas em deslocamento tradicional.",
    tipo_midia: "video",
    formato_original: "mp4",
    tamanho_bytes: 148_300_700,
    duracao_segundos: 81,
    data_criacao: "2025-08-22T09:00:00.000Z",
    data_publicacao: "2025-08-22T19:00:00.000Z",
    fazenda_id: "f-villa",
    tom_narrativo: "poetico",
    transcricao: "A comitiva traduz cultura, territorio e continuidade.",
    tags: [tags[3], tags[5]],
  }),
  item({
    id: "a-003",
    titulo: "IATF - lote de 297 novilhas primiparas",
    descricao: "Protocolo tecnico de reproducao acompanhado em campo.",
    tipo_midia: "video",
    formato_original: "mp4",
    tamanho_bytes: 132_450_000,
    duracao_segundos: 74,
    data_criacao: "2026-01-09T08:30:00.000Z",
    data_publicacao: "2026-01-09T17:15:00.000Z",
    fazenda_id: "f-villa",
    tom_narrativo: "tecnico",
    transcricao: "IATF com foco em prenhez e ganho genetico.",
    tags: [tags[1], tags[4], tags[5]],
  }),
  item({
    id: "a-004",
    titulo: "Depoimento de Pereira Rocha",
    descricao: "Voz historica sobre trabalho e relacao com os animais.",
    tipo_midia: "transcricao",
    formato_original: "srt",
    tamanho_bytes: 12_810,
    duracao_segundos: null,
    data_criacao: "2024-11-03T12:30:00.000Z",
    data_publicacao: "2024-11-04T14:00:00.000Z",
    fazenda_id: "f-villa",
    tom_narrativo: "afetivo",
    transcricao:
      "Eu considero o cavalo de servico como colega de trabalho.",
    tags: [tags[3]],
  }),
  item({
    id: "a-005",
    titulo: "Feno da Villa - corte e enfardamento",
    descricao: "Registro operacional da unidade de feno premium.",
    tipo_midia: "foto",
    formato_original: "jpg",
    tamanho_bytes: 4_190_000,
    data_criacao: "2025-05-18T11:20:00.000Z",
    data_publicacao: "2025-05-18T20:00:00.000Z",
    fazenda_id: "f-feno",
    tom_narrativo: "tecnico",
    tags: [tags[4]],
  }),
  item({
    id: "a-006",
    titulo: "Story - chuva no Jequitai e manejo de risco",
    descricao: "Registro curto sobre condicoes climaticas extremas.",
    tipo_midia: "video",
    formato_original: "mp4",
    tamanho_bytes: 32_000_000,
    duracao_segundos: 18,
    data_criacao: "2025-01-12T13:10:00.000Z",
    data_publicacao: "2025-01-12T13:11:00.000Z",
    fazenda_id: "f-jequitai",
    tom_narrativo: "combativo",
    tags: [tags[6]],
  }),
  item({
    id: "a-007",
    titulo: "Anotacoes sobre o ciclo Qualidade Total",
    descricao: "Documento interno de alinhamento metodologico.",
    tipo_midia: "documento",
    formato_original: "pdf",
    tamanho_bytes: 2_680_000,
    data_criacao: "2026-02-02T07:00:00.000Z",
    data_publicacao: null,
    status: "em_revisao",
    fazenda_id: "f-villa",
    tom_narrativo: "tecnico",
    tags: [tags[4]],
  }),
  item({
    id: "a-008",
    titulo: "Rodrigo - fala sobre vocacao na cria",
    descricao: "Trecho de audio com posicionamento institucional.",
    tipo_midia: "audio",
    formato_original: "mp3",
    tamanho_bytes: 7_820_000,
    duracao_segundos: 132,
    data_criacao: "2025-12-07T15:40:00.000Z",
    data_publicacao: "2025-12-07T21:30:00.000Z",
    fazenda_id: "f-villa",
    tom_narrativo: "celebratorio",
    transcricao: "Sou pecuarista apaixonado e minha vocacao e a cria.",
    tags: [tags[3]],
  }),
];

export const colecoes: Colecao[] = [
  {
    id: "c-01",
    titulo: "37 anos de Selecao",
    descricao: "Marcos geneticos do programa Guzera e GUZONEL.",
    tipo: "cronologica",
    slug: "37-anos-selecao",
    capa_url: null,
    publicada: true,
    ordem: 1,
    curador_id: null,
    created_at: NOW,
    items: [acervoItems[0], acervoItems[2], acervoItems[7]],
    item_count: 3,
  },
  {
    id: "c-02",
    titulo: "Vozes da Fazenda",
    descricao: "Depoimentos de trabalhadores, gestores e parceiros.",
    tipo: "editorial",
    slug: "vozes-da-fazenda",
    capa_url: null,
    publicada: true,
    ordem: 2,
    curador_id: null,
    created_at: NOW,
    items: [acervoItems[3], acervoItems[7]],
    item_count: 2,
  },
  {
    id: "c-03",
    titulo: "Leilao Qualidade Total",
    descricao: "Registros comerciais e historicos dos leiloes anuais.",
    tipo: "tematica",
    slug: "leilao-qualidade-total",
    capa_url: null,
    publicada: false,
    ordem: 3,
    curador_id: null,
    created_at: NOW,
    items: [acervoItems[0]],
    item_count: 1,
  },
];

export const eventosTimeline: EventoTimeline[] = [
  {
    id: "e-1988",
    titulo: "Inicio da selecao Guzera PO",
    descricao: "Marco fundador da linha genetica da RC.",
    data_evento: "1988-01-01",
    data_fim: null,
    tipo: "fundacao",
    fonte: "Base institucional",
    item_vinculado_id: null,
    destaque: true,
    created_at: NOW,
  },
  {
    id: "e-2013",
    titulo: "Criacao da conta @rcagropecuaria",
    descricao: "Entrada na camada digital com Instagram.",
    data_evento: "2013-09-30",
    data_fim: null,
    tipo: "marco",
    fonte: "Instagram export",
    item_vinculado_id: null,
    destaque: false,
    created_at: NOW,
  },
  {
    id: "e-2025",
    titulo: "16o Leilao Qualidade Total",
    descricao: "Edicao com oferta historica de animais.",
    data_evento: "2025-06-14",
    data_fim: null,
    tipo: "leilao",
    fonte: "Documentacao RC",
    item_vinculado_id: "a-001",
    destaque: true,
    created_at: NOW,
  },
  {
    id: "e-2026",
    titulo: "170 mil seguidores organicos",
    descricao: "Consolidacao da capilaridade digital.",
    data_evento: "2026-02-01",
    data_fim: null,
    tipo: "crescimento",
    fonte: "Instagram export",
    item_vinculado_id: null,
    destaque: true,
    created_at: NOW,
  },
];

export const depoimentos: Depoimento[] = [
  {
    id: "d-01",
    pessoa_id: "p-pereira",
    conteudo:
      "Cavalo de servico e colega de servico. Isso define o respeito no manejo.",
    contexto: "Relacao com animais de trabalho",
    item_origem_id: "a-004",
    data_registro: "2024-11-03",
    publicado: true,
    created_at: NOW,
    pessoa: pessoas[1],
    item_origem: acervoItems[3],
  },
  {
    id: "d-02",
    pessoa_id: "p-andre",
    conteudo: "Ser vaqueiro e responsabilidade, tecnica e alegria.",
    contexto: "Cultura de trabalho no campo",
    item_origem_id: null,
    data_registro: "2025-02-18",
    publicado: true,
    created_at: NOW,
    pessoa: pessoas[2],
  },
  {
    id: "d-03",
    pessoa_id: "p-rodrigo",
    conteudo: "Minha vocacao e a cria, com metodo e consistencia.",
    contexto: "Posicionamento institucional",
    item_origem_id: "a-008",
    data_registro: "2025-12-07",
    publicado: true,
    created_at: NOW,
    pessoa: pessoas[0],
    item_origem: acervoItems[7],
  },
];

export const dashboardStats = [
  { label: "Arquivos no acervo", value: "8.928", accent: "var(--rc-gold)" },
  {
    label: "Videos catalogados",
    value: "3.360",
    accent: "var(--rc-green-bright)",
  },
  { label: "Transcricoes SRT", value: "632", accent: "var(--accent-blue)" },
  { label: "Anos de registro", value: "37+", accent: "var(--accent-amber)" },
];

export function getFazendaById(id: string | null | undefined): Fazenda | null {
  if (!id) return null;
  return fazendas.find((fazenda) => fazenda.id === id) ?? null;
}

export function searchAcervo(query: string): AcervoItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return acervoItems;

  return acervoItems.filter((itemData) => {
    const source = [
      itemData.titulo,
      itemData.descricao ?? "",
      itemData.transcricao ?? "",
      ...(itemData.tags ?? []).map((tag) => tag.nome),
    ]
      .join(" ")
      .toLowerCase();

    return source.includes(normalizedQuery);
  });
}

export function filterAcervoByTipo(tipo: TipoMidia | "todos"): AcervoItem[] {
  if (tipo === "todos") return acervoItems;
  return acervoItems.filter((itemData) => itemData.tipo_midia === tipo);
}
