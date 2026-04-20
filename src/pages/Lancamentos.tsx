import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Tag,
  CreditCard,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown
} from 'lucide-react';
import { transacaoService, categoriaService, contaBancariaService, cartaoCreditoService } from '../services/api';
import type { ApiResponse, Transacao, TransacaoRequest, Categoria, ContaBancaria, CartaoCredito } from '../types';
import { TipoTransacao, formatCurrency, formatDate } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Lançamentos Financeiros
 * Tabela completa de transações com CRUD via modal
 */
const Lancamentos: React.FC = () => {
  // Puxa o usuário logado do contexto de autenticação
  const { usuario } = useAuth(); 
  
  // Usa o ID real. Se por algum motivo não houver usuário, passa vazio para não quebrar a tela
  const USER_ID = usuario?.id || '';

  // Estados principais
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal e formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransacaoRequest>({
    descricao: '',
    dataLancamento: new Date().toISOString().split('T')[0],
    dataVencimento: new Date().toISOString().split('T')[0],
    valor: 0,
    tipo: TipoTransacao.DESPESA,
    statusPaga: false,
    isFixa: false,
    contaId: null,
    cartaoId: null,
    categoriaId: null
  });

  // Estados para filtros e paginação
  const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | 'TODOS'>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PAGO' | 'PENDENTE'>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Buscar todos os dados (transações, contas, categorias)
  const buscarTransacoes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados em paralelo para melhor performance
      const [transacoesRes, contasRes, categoriasRes, cartoesRes] = await Promise.all([
        transacaoService.getAll(USER_ID),
        contaBancariaService.getAll(USER_ID),
        categoriaService.getAll(USER_ID),
        cartaoCreditoService.getAll(USER_ID)
      ]);

      const transacoesApiResponse: ApiResponse<Transacao[]> = transacoesRes.data;
      const contasApiResponse: ApiResponse<ContaBancaria[]> = contasRes.data;
      const categoriasApiResponse: ApiResponse<Categoria[]> = categoriasRes.data;
      const cartoesApiResponse: ApiResponse<CartaoCredito[]> = cartoesRes.data;

      if (transacoesApiResponse.data) {
        setTransacoes(transacoesApiResponse.data);
      } else {
        throw new Error('Nenhuma transação encontrada');
      }

      if (contasApiResponse.data) {
        setContas(contasApiResponse.data);
      }

      if (categoriasApiResponse.data) {
        setCategorias(categoriasApiResponse.data);
      }

      if (cartoesApiResponse.data) {
        setCartoes(cartoesApiResponse.data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar transações:', err);
      setError(err.response?.data?.message || 'Erro ao carregar transações. Verifique a conexão com o servidor.');
      setTransacoes([]); // Importante: Limpa a tabela se houver erro
      setContas([]); // Limpa contas
      setCategorias([]); // Limpa categorias
      setCartoes([]); // Limpa cartões
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarTransacoes();
  }, []);

  // Handler do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'valor') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'tipo') {
      setFormData(prev => ({ ...prev, [name]: value as TipoTransacao }));
    } else if (name === 'contaId') {
      // Se selecionar uma conta, limpa o cartãoId
      setFormData(prev => ({ ...prev, contaId: value || null, cartaoId: null }));
    } else if (name === 'cartaoId') {
      // Se selecionar um cartão, limpa o contaId
      setFormData(prev => ({ ...prev, cartaoId: value || null, contaId: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Abrir modal para criação
  const abrirModalNovo = () => {
    setEditandoId(null);
    setFormData({
      descricao: '',
      dataLancamento: new Date().toISOString().split('T')[0],
      dataVencimento: new Date().toISOString().split('T')[0],
      valor: 0,
      tipo: TipoTransacao.DESPESA,
      statusPaga: false,
      isFixa: false,
      contaId: null,
      cartaoId: null,
      categoriaId: null
    });
    setModalAberto(true);
  };

  // Abrir modal para edição
  const abrirModalEditar = (transacao: Transacao) => {
    setEditandoId(transacao.id);
    setFormData({
      descricao: transacao.descricao,
      dataLancamento: transacao.dataLancamento,
      dataVencimento: transacao.dataVencimento,
      valor: transacao.valor,
      tipo: transacao.tipo,
      statusPaga: transacao.statusPaga,
      isFixa: transacao.isFixa,
      contaId: transacao.contaId,
      cartaoId: transacao.cartaoId,
      categoriaId: transacao.categoriaId
    });
    setModalAberto(true);
  };

  // Enviar formulário (criar ou atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editandoId) {
        await transacaoService.update(editandoId, formData, USER_ID);
      } else {
        await transacaoService.create(formData, USER_ID);
      }

      setModalAberto(false);
      buscarTransacoes(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao salvar transação:', err);
      alert(err.response?.data?.message || 'Erro ao salvar transação');
    }
  };

  // Deletar transação
  const handleDeletar = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await transacaoService.delete(id, USER_ID);
      buscarTransacoes(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao deletar transação:', err);
      alert(err.response?.data?.message || 'Erro ao deletar transação');
    }
  };

  // Aplicar filtros
  const transacoesFiltradas = transacoes.filter(transacao => {
    if (filtroTipo !== 'TODOS' && transacao.tipo !== filtroTipo) return false;
    if (filtroStatus === 'PAGO' && !transacao.statusPaga) return false;
    if (filtroStatus === 'PENDENTE' && transacao.statusPaga) return false;
    if (termoBusca && !transacao.descricao.toLowerCase().includes(termoBusca.toLowerCase())) return false;
    return true;
  });

  // Paginação
  const totalPaginas = Math.ceil(transacoesFiltradas.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const transacoesPagina = transacoesFiltradas.slice(inicio, fim);

  // Cores para tipos de transação
  const getTipoCor = (tipo: TipoTransacao) => {
    switch (tipo) {
      case TipoTransacao.RECEITA: return 'bg-green-100 text-green-800 border-green-200';
      case TipoTransacao.DESPESA: return 'bg-red-100 text-red-800 border-red-200';
      case TipoTransacao.TRANSFERENCIA: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão e filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lançamentos Financeiros</h1>
          <p className="text-gray-600">Gerencie suas receitas, despesas e transferências</p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Lançamento
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Descrição..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoTransacao | 'TODOS')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value={TipoTransacao.RECEITA}>Receitas</option>
              <option value={TipoTransacao.DESPESA}>Despesas</option>
              <option value={TipoTransacao.TRANSFERENCIA}>Transferências</option>
            </select>
          </div>

          {/* Filtro por status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'TODOS' | 'PAGO' | 'PENDENTE')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="TODOS">Todos</option>
              <option value="PAGO">Pagas</option>
              <option value="PENDENTE">Pendentes</option>
            </select>
          </div>

          {/* Botão limpar filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroTipo('TODOS');
                setFiltroStatus('TODOS');
                setTermoBusca('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de transações */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Data
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conta/Cartão
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transacoesPagina.length > 0 ? (
                transacoesPagina.map((transacao) => {
                  const categoria = categorias.find(c => c.id === transacao.categoriaId);
                  const conta = contas.find(c => c.id === transacao.contaId);

                  return (
                    <tr key={transacao.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(transacao.dataLancamento)}</div>
                        <div className="text-xs text-gray-500">Venc: {formatDate(transacao.dataVencimento)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transacao.descricao}</div>
                        {transacao.isFixa && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full mt-1">
                            Fixa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {categoria ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${categoria.cor}`}>
                            <Tag className="w-3 h-3 mr-1" />
                            {categoria.nome}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Sem categoria</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {conta ? (
                            <>
                              <span className="text-lg mr-2">{conta.icone}</span>
                              <span className="text-sm text-gray-900">{conta.nomeBanco}</span>
                            </>
                          ) : transacao.cartaoNome ? (
                            <>
                              <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{transacao.cartaoNome}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTipoCor(transacao.tipo)}`}>
                          {transacao.tipo === TipoTransacao.RECEITA ? 'RECEITA' :
                           transacao.tipo === TipoTransacao.DESPESA ? 'DESPESA' : 'TRANSFERÊNCIA'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {transacao.statusPaga ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                              <span className="text-sm text-green-700 font-medium">Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                              <span className="text-sm text-yellow-700 font-medium">Pendente</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${
                          transacao.tipo === TipoTransacao.RECEITA ? 'text-green-600' :
                          transacao.tipo === TipoTransacao.DESPESA ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formatCurrency(transacao.valor)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => abrirModalEditar(transacao)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletar(transacao.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                      <p className="mt-2">Use os filtros ou crie uma nova transação</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{inicio + 1}</span> a{' '}
              <span className="font-medium">{Math.min(fim, transacoesFiltradas.length)}</span> de{' '}
              <span className="font-medium">{transacoesFiltradas.length}</span> transações
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 text-sm font-medium">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Receitas do Mês</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(
                  transacoes
                    .filter(t => t.tipo === TipoTransacao.RECEITA)
                    .reduce((sum, t) => sum + t.valor, 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(
                  transacoes
                    .filter(t => t.tipo === TipoTransacao.DESPESA)
                    .reduce((sum, t) => sum + t.valor, 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-blue-800">
                {transacoes.filter(t => !t.statusPaga).length}
              </p>
              <p className="text-sm text-blue-700">transações</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal para criar/editar transação */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editandoId ? 'Editar Transação' : 'Nova Transação'}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Linha 1: Tipo e Valor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Transação *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[TipoTransacao.RECEITA, TipoTransacao.DESPESA, TipoTransacao.TRANSFERENCIA].map((tipo) => (
                      <label
                        key={tipo}
                        className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${
                          formData.tipo === tipo
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tipo"
                          value={tipo}
                          checked={formData.tipo === tipo}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                          tipo === TipoTransacao.RECEITA ? 'bg-green-100 text-green-600' :
                          tipo === TipoTransacao.DESPESA ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {tipo === TipoTransacao.RECEITA && <DollarSign className="w-5 h-5" />}
                          {tipo === TipoTransacao.DESPESA && <CreditCard className="w-5 h-5" />}
                          {tipo === TipoTransacao.TRANSFERENCIA && <ArrowUpDown className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-medium">
                          {tipo === TipoTransacao.RECEITA ? 'Receita' :
                           tipo === TipoTransacao.DESPESA ? 'Despesa' : 'Transferência'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      name="valor"
                      step="0.01"
                      min="0"
                      value={formData.valor || ''}
                      onChange={handleInputChange}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-lg font-medium"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Linha 2: Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <input
                  type="text"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Ex: Mercado, Salário, Aluguel..."
                  required
                />
              </div>

              {/* Linha 3: Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Lançamento *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dataLancamento"
                      value={formData.dataLancamento}
                      onChange={handleInputChange}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="dataVencimento"
                      value={formData.dataVencimento}
                      onChange={handleInputChange}
                      className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Linha 4: Categoria e Conta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    name="categoriaId"
                    value={formData.categoriaId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias
                      .filter(cat => cat.tipo === formData.tipo)
                      .map(categoria => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conta Bancária</label>
                  <select
                    name="contaId"
                    value={formData.contaId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">Selecione uma conta</option>
                    {contas.map(conta => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nomeBanco}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Deixe vazio se usar cartão de crédito</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cartão de Crédito</label>
                  <select
                    name="cartaoId"
                    value={formData.cartaoId || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">Selecione um cartão</option>
                    {cartoes.map(cartao => (
                      <option key={cartao.id} value={cartao.id}>
                        {cartao.nome}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Deixe vazio se usar conta bancária</p>
                </div>
              </div>

              {/* Linha 5: Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="statusPaga"
                    checked={formData.statusPaga}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Marcar como paga</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isFixa"
                    checked={formData.isFixa}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Transação fixa (mensal)</span>
                </label>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  {editandoId ? 'Atualizar' : 'Criar'} Transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mensagem de erro geral */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <div>
              <p className="font-medium text-red-800">Erro ao carregar transações</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={buscarTransacoes}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lancamentos;