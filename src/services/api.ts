import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Configuração da instância Axios para o backend Spring Boot
 */
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor para logging de requisições em desenvolvimento
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || {});
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
          console.error('Não autorizado - faça login novamente');
          // TODO: Redirecionar para login quando implementarmos autenticação
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

export default api;