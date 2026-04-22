import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Configuração da instância Axios para o backend Spring Boot
 */
const api: AxiosInstance = axios.create({
  //baseURL: 'http://localhost:8080/api',
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // 60 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Função para obter token JWT do localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem('plannerfin_token');
};

/**
 * Função para fazer logout quando token expirar
 */
const handleLogout = () => {
  localStorage.removeItem('plannerfin_token');
  localStorage.removeItem('plannerfin_user');
  delete api.defaults.headers.common['Authorization'];
  // Redirecionar para login
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Interceptor para injetar token JWT e logging de requisições
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adicionar token JWT se disponível
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Logging em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params || {},
        headers: config.headers,
      });
    }
    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Interceptor para logging de respostas em desenvolvimento
 */
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Tratamento de erros comuns
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Não autorizado - token expirado ou inválido');
          handleLogout(); // Fazer logout e redirecionar
          break;
        case 403:
          console.error('Acesso proibido - você não tem permissão para este recurso');
          break;
        case 404:
          console.error('Recurso não encontrado');
          break;
        case 500:
          console.error('Erro interno do servidor');
          break;
        default:
          console.error(`Erro ${error.response.status}: ${error.response.statusText}`);
      }
    } else if (error.request) {
      console.error('Sem resposta do servidor - verifique sua conexão');
    } else {
      console.error('Erro ao configurar requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Serviços da API organizados por módulo
 */
export const dashboardService = {
  getDashboard: (usuarioId: string) =>
    api.get(`/dashboard?usuarioId=${usuarioId}`),

  getDashboardRapido: (usuarioId: string) =>
    api.get(`/dashboard/rapido?usuarioId=${usuarioId}`),
};

export const transacaoService = {
  getAll: (usuarioId: string) =>
    api.get(`/transacoes?usuarioId=${usuarioId}`),

  getById: (id: string, usuarioId: string) =>
    api.get(`/transacoes/${id}?usuarioId=${usuarioId}`),

  create: (data: any, usuarioId: string) =>
    api.post(`/transacoes?usuarioId=${usuarioId}`, data),

  update: (id: string, data: any, usuarioId: string) =>
    api.put(`/transacoes/${id}?usuarioId=${usuarioId}`, data),

  delete: (id: string, usuarioId: string) =>
    api.delete(`/transacoes/${id}?usuarioId=${usuarioId}`),
};

export const contaBancariaService = {
  getAll: (usuarioId: string) =>
    api.get(`/contas-bancarias?usuarioId=${usuarioId}`),

  getById: (id: string, usuarioId: string) =>
    api.get(`/contas-bancarias/${id}?usuarioId=${usuarioId}`),

  create: (data: any, usuarioId: string) =>
    api.post(`/contas-bancarias?usuarioId=${usuarioId}`, data),

  update: (id: string, data: any, usuarioId: string) =>
    api.put(`/contas-bancarias/${id}?usuarioId=${usuarioId}`, data),

  delete: (id: string, usuarioId: string) =>
    api.delete(`/contas-bancarias/${id}?usuarioId=${usuarioId}`),

  atualizarSaldo: (id: string, usuarioId: string) =>
    api.put(`/contas-bancarias/${id}/atualizar-saldo?usuarioId=${usuarioId}`),

  calcularSaldoTotal: (usuarioId: string) =>
    api.get(`/contas-bancarias/saldo-total?usuarioId=${usuarioId}`),
};

export const cartaoCreditoService = {
  getAll: (usuarioId: string) =>
    api.get(`/cartoes-credito?usuarioId=${usuarioId}`),

  getById: (id: string, usuarioId: string) =>
    api.get(`/cartoes-credito/${id}?usuarioId=${usuarioId}`),

  create: (data: any, usuarioId: string) =>
    api.post(`/cartoes-credito?usuarioId=${usuarioId}`, data),

  update: (id: string, data: any, usuarioId: string) =>
    api.put(`/cartoes-credito/${id}?usuarioId=${usuarioId}`, data),

  delete: (id: string, usuarioId: string) =>
    api.delete(`/cartoes-credito/${id}?usuarioId=${usuarioId}`),

  calcularLimiteTotal: (usuarioId: string) =>
    api.get(`/cartoes-credito/limite-total?usuarioId=${usuarioId}`),
};

export const categoriaService = {
  getAll: (usuarioId: string) =>
    api.get(`/categorias?usuarioId=${usuarioId}`),

  getById: (id: string, usuarioId: string) =>
    api.get(`/categorias/${id}?usuarioId=${usuarioId}`),

  create: (data: any, usuarioId: string) =>
    api.post(`/categorias?usuarioId=${usuarioId}`, data),

  update: (id: string, data: any, usuarioId: string) =>
    api.put(`/categorias/${id}?usuarioId=${usuarioId}`, data),

  delete: (id: string, usuarioId: string) =>
    api.delete(`/categorias/${id}?usuarioId=${usuarioId}`),
};

export const orcamentoService = {
  getAll: (usuarioId: string) =>
    api.get(`/orcamentos?usuarioId=${usuarioId}`),

  getByMesAno: (usuarioId: string, mes: number, ano: number) =>
    api.get(`/orcamentos/por-mes?usuarioId=${usuarioId}&mes=${mes}&ano=${ano}`),

  getById: (id: string, usuarioId: string) =>
    api.get(`/orcamentos/${id}?usuarioId=${usuarioId}`),

  create: (data: any, usuarioId: string) =>
    api.post(`/orcamentos?usuarioId=${usuarioId}`, data),

  update: (id: string, data: any, usuarioId: string) =>
    api.put(`/orcamentos/${id}?usuarioId=${usuarioId}`, data),

  delete: (id: string, usuarioId: string) =>
    api.delete(`/orcamentos/${id}?usuarioId=${usuarioId}`),
};

export const metaService = {
  getAll: (usuarioId: string) =>
    api.get(`/metas?usuarioId=${usuarioId}`),

  getAlcancadas: (usuarioId: string) =>
    api.get(`/metas/alcancadas?usuarioId=${usuarioId}`),

  getNaoAlcancadas: (usuarioId: string) =>
    api.get(`/metas/nao-alcancadas?usuarioId=${usuarioId}`),

  getById: (id: string, usuarioId: string) =>
    api.get(`/metas/${id}?usuarioId=${usuarioId}`),

  create: (data: any, usuarioId: string) =>
    api.post(`/metas?usuarioId=${usuarioId}`, data),

  update: (id: string, data: any, usuarioId: string) =>
    api.put(`/metas/${id}?usuarioId=${usuarioId}`, data),

  delete: (id: string, usuarioId: string) =>
    api.delete(`/metas/${id}?usuarioId=${usuarioId}`),

  adicionarValor: (id: string, valor: number, usuarioId: string) =>
    api.post(`/metas/${id}/adicionar-valor?valor=${valor}&usuarioId=${usuarioId}`),

  removerValor: (id: string, valor: number, usuarioId: string) =>
    api.post(`/metas/${id}/remover-valor?valor=${valor}&usuarioId=${usuarioId}`),

  getEstatisticas: (usuarioId: string) =>
    api.get(`/metas/estatisticas?usuarioId=${usuarioId}`),

  verificarPrazoProximo: (id: string, usuarioId: string) =>
    api.get(`/metas/${id}/prazo-proximo?usuarioId=${usuarioId}`),

  verificarVencida: (id: string, usuarioId: string) =>
    api.get(`/metas/${id}/vencida?usuarioId=${usuarioId}`),
};

export default api;