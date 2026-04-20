import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Landmark, TrendingUp, AlertCircle, RefreshCw, X } from 'lucide-react';
import { contaBancariaService } from '../services/api';
import type { ApiResponse, ContaBancaria, ContaBancariaRequest } from '../types';
import { formatCurrency, formatDate } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Gestão de Contas Bancárias
 * Exibe contas em cards com CRUD completo
 */
const ContasBancarias: React.FC = () => {
  // Puxa o usuário logado do contexto de autenticação
  const { usuario } = useAuth(); 
  
  // Usa o ID real. Se por algum motivo não houver usuário, passa vazio para não quebrar a tela
  const USER_ID = usuario?.id || '';

  // Estados principais
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [contaEditando, setContaEditando] = useState<ContaBancaria | null>(null);

  // Formulário
  const [formData, setFormData] = useState<ContaBancariaRequest>({
    nomeBanco: '',
    icone: '🏦',
    saldoInicial: 0,
    dataSaldoInicial: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Opções de ícones para o select
  const iconesOpcoes = [
    { valor: '🏦', label: '🏦 Banco' },
    { valor: '💰', label: '💰 Cofrinho' },
    { valor: '💳', label: '💳 Cartão' },
    { valor: '🏧', label: '🏧 ATM' },
    { valor: '💵', label: '💵 Dinheiro' },
    { valor: '💎', label: '💎 Diamante' },
  ];

  // Carregar contas bancárias
  const fetchContas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await contaBancariaService.getAll(USER_ID);
      const apiResponse: ApiResponse<ContaBancaria[]> = response.data;

      if (apiResponse.data) {
        setContas(apiResponse.data);
      } else {
        throw new Error('Dados das contas bancárias não encontrados');
      }
    } catch (err: any) {
      console.error('Erro ao carregar contas bancárias:', err);
      setError(err.response?.data?.message || 'Erro ao carregar contas bancárias. Verifique o console.');
      setContas([]); // Limpa os dados em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContas();
  }, []);

  // Abrir modal para criar nova conta
  const openCreateModal = () => {
    setModalMode('create');
    setContaEditando(null);
    setFormData({
      nomeBanco: '',
      icone: '🏦',
      saldoInicial: 0,
      dataSaldoInicial: new Date().toISOString().split('T')[0],
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar conta
  const openEditModal = (conta: ContaBancaria) => {
    setModalMode('edit');
    setContaEditando(conta);
    setFormData({
      nomeBanco: conta.nomeBanco,
      icone: conta.icone || '🏦',
      saldoInicial: conta.saldoInicial,
      dataSaldoInicial: conta.dataSaldoInicial.split('T')[0],
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  // Fechar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
    setIsSubmitting(false);
  };

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submeter formulário (criar ou editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (modalMode === 'create') {
        await contaBancariaService.create(formData, USER_ID);
      } else if (modalMode === 'edit' && contaEditando) {
        await contaBancariaService.update(contaEditando.id, formData, USER_ID);
      }

      // Fechar modal e recarregar dados
      closeModal();
      await fetchContas();
    } catch (err: any) {
      console.error('Erro ao salvar conta:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao salvar conta. Verifique o console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir conta
  const handleDelete = async (contaId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await contaBancariaService.delete(contaId, USER_ID);
      await fetchContas(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      alert(err.response?.data?.message || 'Erro ao excluir conta. Verifique o console.');
    }
  };

  // Atualizar saldo manualmente
  const handleAtualizarSaldo = async (contaId: string) => {
    try {
      await contaBancariaService.atualizarSaldo(contaId, USER_ID);
      await fetchContas(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao atualizar saldo:', err);
      alert(err.response?.data?.message || 'Erro ao atualizar saldo. Verifique o console.');
    }
  };

  // Calcular saldo total
  const saldoTotal = contas.reduce((total, conta) => total + conta.saldoAtual, 0);

  // Estados de loading e error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Carregando contas bancárias...</p>
        </div>
      </div>
    );
  }

  if (error && contas.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar contas bancárias</h3>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchContas}
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
      {/* Cabeçalho com título e ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contas Bancárias</h2>
          <p className="text-gray-600">Gerencie suas contas bancárias e acompanhe os saldos</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <Landmark className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Saldo Total</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(saldoTotal)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Conta
          </button>
        </div>
      </div>

      {/* Grid de Contas Bancárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contas.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
            <Landmark className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma conta bancária cadastrada</h3>
            <p className="text-gray-500 mb-6">Adicione sua primeira conta bancária para começar</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Adicionar Conta
            </button>
          </div>
        ) : (
          contas.map((conta) => (
            <div
              key={conta.id}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Cabeçalho do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{conta.icone || '🏦'}</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{conta.nomeBanco}</h3>
                    <p className="text-sm text-gray-600">Conta Bancária</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(conta)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(conta.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informações Financeiras */}
              <div className="space-y-4">
                {/* Saldo Atual */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                      <p className={`text-2xl font-bold ${conta.saldoAtual >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrency(conta.saldoAtual)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAtualizarSaldo(conta.id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Atualizar Saldo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Saldo Inicial:</span>
                    <span className="font-medium text-gray-800">{formatCurrency(conta.saldoInicial)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Data Saldo Inicial:</span>
                    <span className="font-medium text-gray-800">{formatDate(conta.dataSaldoInicial)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Atualizado em:</span>
                    <span className="font-medium text-gray-800">{formatDate(conta.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Badge de Status */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${conta.saldoAtual >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-medium ${conta.saldoAtual >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {conta.saldoAtual >= 0 ? 'Saldo Positivo' : 'Saldo Negativo'}
                  </span>
                  <div className="ml-auto">
                    <TrendingUp className={`w-4 h-4 ${conta.saldoAtual >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Adicionar Nova Conta' : 'Editar Conta Bancária'}
                </h3>
                <p className="text-sm text-gray-600">
                  {modalMode === 'create' ? 'Preencha os dados da nova conta bancária' : 'Atualize os dados da conta bancária'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal (Formulário) */}
            <form onSubmit={handleSubmit} className="p-6">
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-700">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Banco */}
                <div className="space-y-2">
                  <label htmlFor="nomeBanco" className="block text-sm font-medium text-gray-700">
                    Nome do Banco *
                  </label>
                  <input
                    type="text"
                    id="nomeBanco"
                    name="nomeBanco"
                    value={formData.nomeBanco}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Ex: Nubank, Itaú, Caixa"
                  />
                </div>

                {/* Ícone */}
                <div className="space-y-2">
                  <label htmlFor="icone" className="block text-sm font-medium text-gray-700">
                    Ícone
                  </label>
                  <select
                    id="icone"
                    name="icone"
                    value={formData.icone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  >
                    {iconesOpcoes.map((opcao) => (
                      <option key={opcao.valor} value={opcao.valor}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Saldo Inicial */}
                <div className="space-y-2">
                  <label htmlFor="saldoInicial" className="block text-sm font-medium text-gray-700">
                    Saldo Inicial *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</div>
                    <input
                      type="number"
                      id="saldoInicial"
                      name="saldoInicial"
                      value={formData.saldoInicial}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Data do Saldo Inicial */}
                <div className="space-y-2">
                  <label htmlFor="dataSaldoInicial" className="block text-sm font-medium text-gray-700">
                    Data do Saldo Inicial *
                  </label>
                  <input
                    type="date"
                    id="dataSaldoInicial"
                    name="dataSaldoInicial"
                    value={formData.dataSaldoInicial}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {modalMode === 'create' ? 'Adicionar Conta' : 'Salvar Alterações'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status do Backend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${contas.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {contas.length > 0
                ? `Conectado ao backend - ${contas.length} conta(s) carregada(s)`
                : 'Erro de conexão ou nenhuma conta encontrada'}
            </span>
          </div>
          <button
            onClick={fetchContas}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContasBancarias;