import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Wallet,
  DollarSign,
  CreditCard,
  PieChart as PieChartIcon,
  AlertCircle,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { dashboardService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ApiResponse, DashboardResponse } from '../types';
import { formatCurrency, formatPercentage } from '../types';

// Função auxiliar para gerar cores aleatórias como fallback
const getRandomColor = (index: number) => {
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#8B5CF6', // violet-500
    '#EF4444', // red-500
    '#F59E0B', // amber-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#6366F1', // indigo-500
    '#F97316', // orange-500
    '#06B6D4', // cyan-500
  ];
  return colors[index % colors.length];
};

/**
 * Página inicial do Dashboard
 * Exibe métricas financeiras principais e resumo rápido
 */
const Home: React.FC = () => {
  const { usuario } = useAuth();

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [usuario?.id]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!usuario?.id) throw new Error('Usuário não autenticado');

      const response = await dashboardService.getDashboard(usuario.id);
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
      change: dashboardData?.variacaoPatrimonio || 0,
      icon: <TrendingUp className="w-6 h-6" />,
      colorClass: 'text-green-600',
      bgColorClass: 'bg-green-50',
      format: 'currency'
    },
    {
      title: 'Saldo das Contas',
      value: dashboardData?.saldoTotalContas || 0,
      change: dashboardData?.variacaoSaldoContas || 0,
      icon: <Wallet className="w-6 h-6" />,
      colorClass: 'text-blue-600',
      bgColorClass: 'bg-blue-50',
      format: 'currency'
    },
    {
      title: 'Receitas do Mês',
      value: dashboardData?.resumoMesAtual?.receitas || 0,
      change: dashboardData?.variacaoReceitas || 0,
      icon: <DollarSign className="w-6 h-6" />,
      colorClass: 'text-green-600',
      bgColorClass: 'bg-green-50',
      format: 'currency'
    },
    {
      title: 'Despesas do Mês',
      value: dashboardData?.resumoMesAtual?.despesas || 0,
      change: dashboardData?.variacaoDespesas || 0,
      icon: <CreditCard className="w-6 h-6" />,
      colorClass: 'text-red-600',
      bgColorClass: 'bg-red-50',
      format: 'currency'
    },
    {
      title: 'Limite Cartão Disponível',
      value: dashboardData?.limiteDisponivelCartoes || 0,
      change: 0, // Não tem variação
      icon: <PieChartIcon className="w-6 h-6" />,
      colorClass: 'text-purple-600',
      bgColorClass: 'bg-purple-50',
      format: 'currency'
    },
    {
      title: 'Saldo Mensal',
      value: dashboardData?.resumoMesAtual?.saldo || 0,
      change: dashboardData?.variacaoSaldoMensal || 0,
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

      {/* Gráficos Visuais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Despesas por Categoria */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex items-center mb-4">
            <PieChartIcon className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Despesas por Categoria</h3>
          </div>

          {dashboardData?.despesasPorCategoria && dashboardData.despesasPorCategoria.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData.despesasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { payload, percent } = props;
                      if (percent === undefined || payload === undefined) return '';
                      return `${payload.categoriaNome}: ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    dataKey="valorTotal"
                  >
                    {dashboardData.despesasPorCategoria.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.cor || getRandomColor(index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                    labelFormatter={(_label, payload) => {
                      if (!payload || payload.length === 0) return '';
                      return payload[0].payload.categoriaNome;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {dashboardData.despesasPorCategoria.map((categoria, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: categoria.cor }}
                      ></div>
                      <span className="text-gray-700">{categoria.categoriaNome}</span>
                    </div>
                    <span className="font-medium text-gray-800">{formatCurrency(categoria.valorTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <PieChartIcon className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center font-medium">Ainda não há dados suficientes para gerar o gráfico</p>
              <p className="text-sm text-center mt-1">Adicione despesas para visualizar a distribuição por categoria</p>
            </div>
          )}
        </div>

        {/* Gráfico de Histórico Mensal */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-800">Histórico Mensal</h3>
          </div>

          {dashboardData?.historicoMensal && dashboardData.historicoMensal.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.historicoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="mesLabel"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                    labelFormatter={(label, items) => {
                      const item = items?.[0]?.payload;
                      return item ? `${label}/${item.ano}` : label;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="receitas"
                    name="Receitas"
                    fill="#10b981"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="despesas"
                    name="Despesas"
                    fill="#ef4444"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {dashboardData.historicoMensal.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800">{item.mesLabel}/{item.ano}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-green-600">Receitas</span>
                        <span className="font-medium">{formatCurrency(item.receitas)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Despesas</span>
                        <span className="font-medium">{formatCurrency(item.despesas)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-700">Saldo</span>
                        <span className={`font-medium ${item.receitas - item.despesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(item.receitas - item.despesas)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <BarChart3 className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center font-medium">Ainda não há dados suficientes para gerar o gráfico</p>
              <p className="text-sm text-center mt-1">Adicione transações para visualizar o histórico mensal</p>
            </div>
          )}
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