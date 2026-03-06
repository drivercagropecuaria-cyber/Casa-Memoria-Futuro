/* ================================================================
   Database Types — Casa de Memoria e Futuro
   ================================================================ */

export type TipoMidia = "foto" | "video" | "documento" | "audio" | "transcricao";

export type StatusItem =
  | "rascunho"
  | "em_revisao"
  | "aprovado"
  | "arquivado";

export type TomNarrativo =
  | "tecnico"
  | "poetico"
  | "afetivo"
  | "combativo"
  | "celebratorio";

export type Classificacao = "fato" | "inferencia" | "hipotese";

export type TipoPessoa =
  | "proprietario"
  | "familiar"
  | "colaborador"
  | "consultor"
  | "parceiro";

export type StatusFazenda = "ativa" | "inativa" | "incerta";

export type TipoColecao =
  | "tematica"
  | "cronologica"
  | "editorial"
  | "educativa";

export type TipoEvento =
  | "fundacao"
  | "marco"
  | "leilao"
  | "crescimento"
  | "incidente"
  | "midia"
  | "pessoal";

export type UserRole = "admin" | "curador" | "visitante";

export type CategoriaTag =
  | "tema"
  | "periodo"
  | "formato"
  | "tom"
  | "geral";

/* ----------------------------------------------------------------
   Entities
   ---------------------------------------------------------------- */

export interface AcervoItem {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo_midia: TipoMidia;
  formato_original: string | null;
  tamanho_bytes: number | null;
  duracao_segundos: number | null;
  data_criacao: string | null;
  data_ingestao: string;
  data_publicacao: string | null;
  status: StatusItem;
  curador_id: string | null;
  autor_registro: string | null;
  url_original: string | null;
  url_thumbnail: string | null;
  url_proxy: string | null;
  transcricao: string | null;
  metadata_exif: Record<string, unknown> | null;
  gps_lat: number | null;
  gps_lng: number | null;
  fazenda_id: string | null;
  tom_narrativo: TomNarrativo | null;
  classificacao: Classificacao | null;
  created_at: string;
  updated_at: string;

  // Relations (populated by joins)
  fazenda?: Fazenda;
  pessoas?: Pessoa[];
  tags?: Tag[];
  colecoes?: Colecao[];
}

export interface Pessoa {
  id: string;
  nome_completo: string;
  papel: string | null;
  tipo: TipoPessoa;
  biografia: string | null;
  data_nascimento: string | null;
  tempo_empresa: string | null;
  citacao_destaque: string | null;
  foto_url: string | null;
  ativo: boolean;
  created_at: string;
}

export interface Fazenda {
  id: string;
  nome: string;
  municipio: string | null;
  estado: string;
  gps_lat: number | null;
  gps_lng: number | null;
  funcao_principal: string | null;
  funcoes_secundarias: string[] | null;
  area_hectares: number | null;
  infraestrutura: string | null;
  status: StatusFazenda;
  descricao: string | null;
  foto_url: string | null;
  e_sede_casa: boolean;
  created_at: string;
}

export interface Colecao {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoColecao;
  slug: string;
  capa_url: string | null;
  publicada: boolean;
  ordem: number;
  curador_id: string | null;
  created_at: string;

  // Relations
  items?: AcervoItem[];
  item_count?: number;
}

export interface Tag {
  id: string;
  nome: string;
  categoria: CategoriaTag;
}

export interface EventoTimeline {
  id: string;
  titulo: string;
  descricao: string | null;
  data_evento: string;
  data_fim: string | null;
  tipo: TipoEvento;
  fonte: string | null;
  item_vinculado_id: string | null;
  destaque: boolean;
  created_at: string;
}

export interface Depoimento {
  id: string;
  pessoa_id: string;
  conteudo: string;
  contexto: string | null;
  item_origem_id: string | null;
  data_registro: string | null;
  publicado: boolean;
  created_at: string;

  // Relations
  pessoa?: Pessoa;
  item_origem?: AcervoItem;
}

export interface Profile {
  id: string;
  nome: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tabela: string;
  operacao: "INSERT" | "UPDATE" | "DELETE";
  registro_id: string;
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
  usuario_id: string | null;
  created_at: string;
}

/* ----------------------------------------------------------------
   Query / Filter helpers
   ---------------------------------------------------------------- */

export interface AcervoFilters {
  tipo_midia?: TipoMidia;
  status?: StatusItem;
  fazenda_id?: string;
  tom_narrativo?: TomNarrativo;
  search?: string;
  tags?: string[];
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
