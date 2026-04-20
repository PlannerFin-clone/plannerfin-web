/**
 * Tipos TypeScript para o sistema PlannerFin
 * Mapeados dos DTOs Java do backend Spring Boot
 */

// ==================== ENUMS ====================

export const TipoTransacao = {
  RECEITA: 'RECEITA',
  DESPESA: 'DESPESA',
  TRANSFERENCIA: 'TRANSFERENCIA',
} as const;

export type TipoTransacao = (typeof TipoTransacao)[keyof typeof TipoTransacao];

export const TipoAlerta = {
  SALDO_NEGATIVO: 'SALDO_NEGATIVO',
  ORCAMENTO_EXCEDIDO: 'ORCAMENTO_EXCEDIDO',
  CARTAO_LIMITE: 'CARTAO_LIMITE',
  DIVIDA_VENCIDA: 'DIVIDA_VENCIDA',
} as const;

export type TipoAlerta = (typeof TipoAlerta)[keyof typeof TipoAlerta];

// ==================== RESPONSE WRAPPER ====================

/**
 * Resposta padronizada da API (ApiResponse<T> do backend)
 */
export interface ApiResponse<T = any> {
  timestamp: string;
  status: number;
  message: string | null;
  data: T | null;
  path?: string;
}

// ==================== ENTIDADES PRINCIPAIS ====================

export interface Transacao {
  id: string;
  descricao: string;
  dataLancamento: string; // ISO date string
  dataVencimento: string; // ISO date string
  valor: number;
  tipo: TipoTransacao;
  statusPaga: boolean;
  isFixa: boolean;
  contaId: string | null;
  contaNome: string | null;
  cartaoId: string | null;
  cartaoNome: string | null;
  categoriaId: string | null;
  categoriaNome: string | null;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface ContaBancaria {
  id: string;
  nomeBanco: string;
  icone: string | null;
  saldoInicial: number;
  dataSaldoInicial: string; // ISO date string
  saldoAtual: number;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface CartaoCredito {
  id: string;
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  limiteTotal: number;
  limiteDisponivel: number;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoTransacao;
  icone: string | null;
  cor: string | null;
  ordem: number | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== DASHBOARD RESPONSE ====================

export interface DashboardResponse {
  // Saldos e patrimônio
  saldoTotalContas: number;
  patrimonioTotal: number;
  saldoCartoesCredito: number;
  limiteTotalCartoes: number;
  limiteDisponivelCartoes: number;

  // Variações percentuais (mês atual vs anterior)
  variacaoPatrimonio: number;
  variacaoSaldoContas: number;
  variacaoReceitas: number;
  variacaoDespesas: number;
  variacaoSaldoMensal: number;

  // Resumo do mês atual
  resumoMesAtual: ResumoMensal;
  resumoMesAnterior: ResumoMensal;

  // Projeção diária (30 dias)
  projecaoDiaria: ProjecaoDia[];

  // Alertas e notificações
  alertas: Alerta[];

  // Metas em progresso
  metasProgresso: MetaResumo[];

  // Dívidas ativas
  dividasAtivas: DividaResumo[];

  // Dados para gráficos
  despesasPorCategoria: DespesaCategoria[];
  historicoMensal: HistoricoMensal[];
}

export interface ResumoMensal {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
  percentualOrcamento: number;
  categorias: CategoriaResumo[];
}

export interface CategoriaResumo {
  categoriaNome: string;
  valorPlanejado: number;
  valorRealizado: number;
  percentualAtingido: number;
}

export interface ProjecaoDia {
  data: string; // ISO date string
  saldoProjetado: number;
  receitasDia: number;
  despesasDia: number;
}

export interface Alerta {
  tipo: TipoAlerta;
  mensagem: string;
  dataRelevante: string; // ISO date string
  valorRelevante: number;
}

export interface MetaResumo {
  nome: string;
  valorAlvo: number;
  valorGuardado: number;
  percentualConcluido: number;
  mesesRestantes: number;
}

export interface DividaResumo {
  descricao: string;
  saldoDevedor: number;
  valorParcela: number;
  proximoVencimento: string; // ISO date string
  parcelasRestantes: number;
}

export interface DespesaCategoria {
  categoriaNome: string;
  cor: string; // Código hex da cor (ex: "#3B82F6")
  valorTotal: number;
}

export interface HistoricoMensal {
  mesLabel: string; // "Jan", "Fev", "Mar", etc.
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
}

// ==================== REQUEST DTOs ====================

export interface TransacaoRequest {
  descricao: string;
  dataLancamento: string;
  dataVencimento: string;
  valor: number;
  tipo: TipoTransacao;
  statusPaga?: boolean;
  isFixa?: boolean;
  contaId?: string | null;
  cartaoId?: string | null;
  categoriaId?: string | null;
}

export interface ContaBancariaRequest {
  nomeBanco: string;
  icone?: string;
  saldoInicial: number;
  dataSaldoInicial: string;
}

export interface CartaoCreditoRequest {
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  limiteTotal: number;
}

export interface CategoriaRequest {
  nome: string;
  tipo: TipoTransacao;
  descricao?: string | null;
  icone?: string | null;
  cor?: string | null;
}

export interface Orcamento {
  id: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaCor: string;
  valorLimite: number;
  mes: number;
  ano: number;
  valorRealizado: number;
  percentualAtingimento: number;
  estourado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrcamentoRequest {
  categoriaId: string;
  valorLimite: number;
  mes: number;
  ano: number;
}

// ==================== METAS ====================

export interface Meta {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  dataPrazo: string | null; // ISO date string
  imagemUrl: string | null;
  percentualConcluido: number;
  valorRestante: number;
  alcancada: boolean;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface MetaRequest {
  nome: string;
  valorAlvo: number;
  valorAtual?: number;
  dataPrazo?: string | null; // ISO date string
  imagemUrl?: string | null;
}

export interface MetaStats {
  valorGuardadoTotal: number;
  valorAlvoTotal: number;
  progressoTotal: number;
}

// ==================== UTILITY TYPES ====================

/**
 * Card de métrica para dashboard
 */
export interface MetricCard {
  title: string;
  value: number;
  change?: number; // percentual de mudança
  icon: React.ReactNode;
  colorClass: string; // classes CSS completas para Tailwind (ex: 'bg-blue-50 text-blue-600')
  bgColorClass: string; // classes para background do gradiente
  format?: 'currency' | 'percentage' | 'number';
}

/**
 * Item de navegação do sidebar
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // nome do ícone do lucide-react
  active?: boolean;
  badge?: number;
}

/**
 * Status de loading/error para componentes
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ==================== AUTENTICAÇÃO ====================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  numeroWhatsapp: string | null;
  diasNotificacao: number;
  notificarFixas: boolean;
  notificarNaoFixas: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  numeroWhatsapp?: string | null;
  diasNotificacao?: number;
  notificarFixas?: boolean;
  notificarNaoFixas?: boolean;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

// ==================== CONTEXTO DE AUTENTICAÇÃO ====================

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Formata data para exibição
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}