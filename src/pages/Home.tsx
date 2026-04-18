import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Wallet,
  DollarSign,
  CreditCard,
  PieChart,
  AlertCircle,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { dashboardService } from '../services/api';
import type { ApiResponse, DashboardResponse } from '../types';
import { formatCurrency, formatPercentage } from '../types';

/**
 * Página inicial do Dashboard
 * Exibe métricas financeiras principais e resumo rápido
 */
const Home: React.FC = () => {
  // ID do usuário fixo para testes (substituir por autenticação real depois)
  const USER_ID = 'c987f42a-abf7-4412-8b73-18947348ae64'; // UUID de exemplo

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dashboardService.getDashboardRapido(USER_ID);
      const apiResponse: ApiResponse<DashboardResponse> = response.data;

      if (apiResponse.data) {
        setDashboardData(apiResponse.data);
      } else {
        throw new Error('Dados do dashboard não encontrados');
      }
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.response?.data?.message || 'Erro de conexão com o banco de dados. Verifique o console.');
      setDashboardData(null); // Garante que a tela limpe os dados se houver erro
    } finally {
      setIsLoading(false);
    }
  };

  // Cards de métricas principais
  const metricCards = [
    {
      title: 'Patrimônio Total',
      value: dashboardData?.patrimonioTotal || 0,
      change: 2.5,
      icon: <TrendingUp className="w-6 h-6" />,
      colorClass: 'text-green-600',
      bgColorClass: 'bg-green-50',
      format: 'currency'
    },
    {
      title: 'Saldo das Contas',
      value: dashboardData?.saldoTotalContas || 0,
      change: 1.8,
      icon: <Wallet className="w-6 h-6" />,
      colorClass: 'text-blue-600',
      bgColorClass: 'bg-blue-50',
      format: 'currency'
    },
    {
      title: 'Receitas do Mês',
      value: dashboardData?.resumoMesAtual?.receitas || 0,
      change: 3.7,
      icon: <DollarSign className="w-6 h-6" />,
      colorClass: 'text-green-600',
      bgColorClass: 'bg-green-50',
      format: 'currency'
    },
    {
      title: 'Despesas do Mês',
      value: dashboardData?.resumoMesAtual?.despesas || 0,
      change: -2.1,
      icon: <CreditCard className="w-6 h-6" />,
      colorClass: 'text-red-600',
      bgColorClass: 'bg-red-50',
      format: 'currency'
    },
    {
      title: 'Limite Cartão Disponível',
      value: dashboardData?.limiteDisponivelCartoes || 0,
      change: 0,
      icon: <PieChart className="w-6 h-6" />,
      colorClass: 'text-purple-600',
      bgColorClass: 'bg-purple-50',
      format: 'currency'
    },
    {
      title: 'Saldo Mensal',
      value: dashboardData?.resumoMesAtual?.saldo || 0,
      change: 60.7,
      icon: <BarChart3 className="w-6 h-6" />,
      colorClass: (dashboardData?.resumoMesAtual?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600',
      bgColorClass: (dashboardData?.resumoMesAtual?.saldo || 0) >= 0 ? 'bg-green-50' : 'bg-red-50',
      format: 'currency'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar dashboard</h3>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards de Métricas */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Visão Geral Financeira</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metricCards.map((card, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${card.bgColorClass}`}>
                  <div className={card.colorClass}>
                    {card.icon}
                  </div>
                </div>
                <span className={`text-sm font-medium ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-800">
                {card.format === 'currency' ? formatCurrency(card.value) : card.value}
              </p>
              <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${card.bgColorClass.replace('50', '500').replace('bg-', 'bg-')}`}
                  style={{ width: `${Math.min(Math.abs(card.change) * 3, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas e Notificações */}
      {dashboardData?.alertas && dashboardData.alertas.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Alertas Financeiros</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.alertas.map((alerta, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    alerta.tipo === 'SALDO_NEGATIVO' ? 'bg-red-500' :
                    alerta.tipo === 'ORCAMENTO_EXCEDIDO' ? 'bg-orange-500' :
                    alerta.tipo === 'CARTAO_LIMITE' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-800">{alerta.mensagem}</p>
                    <p className="text-sm text-gray-600">
                      Valor: {formatCurrency(alerta.valorRelevante)} • Data: {new Date(alerta.dataRelevante).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metas e Dívidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metas em Progresso */}
        {dashboardData?.metasProgresso && dashboardData.metasProgresso.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Metas em Progresso</h3>
            </div>
            <div className="space-y-4">
              {dashboardData.metasProgresso.map((meta, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{meta.nome}</span>
                    <span className="text-sm font-bold text-green-600">{formatPercentage(meta.percentualConcluido)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                      style={{ width: `${meta.percentualConcluido}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(meta.valorGuardado)} / {formatCurrency(meta.valorAlvo)}</span>
                    <span>{meta.mesesRestantes} meses restantes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dívidas Ativas */}
        {dashboardData?.dividasAtivas && dashboardData.dividasAtivas.length > 0 && (
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Dívidas Ativas</h3>
            </div>
            <div className="space-y-4">
              {dashboardData.dividasAtivas.map((divida, index) => (
                <div key={index} className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{divida.descricao}</span>
                    <span className="text-lg font-bold text-red-600">{formatCurrency(divida.saldoDevedor)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Próxima Parcela</p>
                      <p>{formatCurrency(divida.valorParcela)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Vencimento</p>
                      <p>{new Date(divida.proximoVencimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="font-medium">Parcelas Restantes</p>
                      <p>{divida.parcelasRestantes}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p className={`font-medium ${new Date(divida.proximoVencimento) > new Date() ? 'text-green-600' : 'text-red-600'}`}>
                        {new Date(divida.proximoVencimento) > new Date() ? 'Em dia' : 'Vencida'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status do Backend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${dashboardData ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {dashboardData ? 'Conectado ao backend' : 'Erro de conexão'}
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;