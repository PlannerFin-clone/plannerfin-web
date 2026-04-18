import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, AlertCircle, X, Calendar, DollarSign } from 'lucide-react';
import { cartaoCreditoService } from '../services/api';
import type { ApiResponse, CartaoCredito, CartaoCreditoRequest } from '../types';

/**
 * Página de Gestão de Cartões de Crédito
 * Exibe cartões em cards estilizados como cartões físicos
 */
const CartoesCredito: React.FC = () => {
  // ID do usuário fixo para testes
  const USER_ID = 'c987f42a-abf7-4412-8b73-18947348ae64';

  // Estados principais
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [cartaoEditando, setCartaoEditando] = useState<CartaoCredito | null>(null);

  // Formulário
  const [formData, setFormData] = useState<CartaoCreditoRequest>({
    nome: '',
    diaFechamento: 10,
    diaVencimento: 15,
    limiteTotal: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Carregar cartões
  const fetchCartoes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await cartaoCreditoService.getAll(USER_ID);
      const apiResponse: ApiResponse<CartaoCredito[]> = response.data;

      if (apiResponse.data) {
        setCartoes(apiResponse.data);
      } else {
        throw new Error('Dados dos cartões não encontrados');
      }
    } catch (err: any) {
      console.error('Erro ao carregar cartões:', err);
      setError(err.response?.data?.message || 'Erro ao carregar cartões. Verifique o console.');
      setCartoes([]); // Limpa os dados em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartoes();
  }, []);

  // Abrir modal para criar novo cartão
  const openCreateModal = () => {
    setModalMode('create');
    setCartaoEditando(null);
    setFormData({
      nome: '',
      diaFechamento: 10,
      diaVencimento: 15,
      limiteTotal: 0,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar cartão
  const openEditModal = (cartao: CartaoCredito) => {
    setModalMode('edit');
    setCartaoEditando(cartao);
    setFormData({
      nome: cartao.nome,
      diaFechamento: cartao.diaFechamento,
      diaVencimento: cartao.diaVencimento,
      limiteTotal: cartao.limiteTotal,
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('limite') ? parseFloat(value) || 0 : parseInt(value) || 0,
    }));
  };

  // Manipular mudança do nome (texto)
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      nome: e.target.value,
    }));
  };

  // Submeter formulário (criar ou editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validações
      if (!formData.nome.trim()) {
        throw new Error('Nome do cartão é obrigatório');
      }
      if (formData.diaFechamento < 1 || formData.diaFechamento > 31) {
        throw new Error('Dia de fechamento deve ser entre 1 e 31');
      }
      if (formData.diaVencimento < 1 || formData.diaVencimento > 31) {
        throw new Error('Dia de vencimento deve ser entre 1 e 31');
      }
      if (formData.limiteTotal <= 0) {
        throw new Error('Limite total deve ser maior que zero');
      }

      if (modalMode === 'create') {
        await cartaoCreditoService.create(formData, USER_ID);
      } else if (modalMode === 'edit' && cartaoEditando) {
        await cartaoCreditoService.update(cartaoEditando.id, formData, USER_ID);
      }

      // Fechar modal e recarregar dados
      closeModal();
      await fetchCartoes();
    } catch (err: any) {
      console.error('Erro ao salvar cartão:', err);
      setSubmitError(err.message || err.response?.data?.message || 'Erro ao salvar cartão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir cartão
  const handleDelete = async (cartaoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await cartaoCreditoService.delete(cartaoId, USER_ID);
      await fetchCartoes();
    } catch (err: any) {
      console.error('Erro ao excluir cartão:', err);
      alert(err.response?.data?.message || 'Erro ao excluir cartão');
    }
  };

  // Função para gerar gradiente baseado no nome do cartão
  const getCardGradient = (nome: string) => {
    const gradients = [
      'bg-gradient-to-br from-purple-600 to-pink-500',
      'bg-gradient-to-br from-blue-600 to-cyan-500',
      'bg-gradient-to-br from-green-600 to-emerald-500',
      'bg-gradient-to-br from-red-600 to-orange-500',
      'bg-gradient-to-br from-indigo-600 to-purple-500',
      'bg-gradient-to-br from-teal-600 to-blue-500',
    ];

    // Hash simples baseado no nome para gerar gradiente consistente
    const hash = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  // Formatar valor monetário
  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  // Calcular limite disponível (se não vier do backend, calcula como igual ao limite total)
  const calcularLimiteDisponivel = (cartao: CartaoCredito) => {
    if (cartao.limiteDisponivel !== undefined) {
      return cartao.limiteDisponivel;
    }
    return cartao.limiteTotal; // Valor padrão se não houver transações
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cartões de Crédito</h1>
            <p className="text-gray-600 mt-2">Gerencie seus cartões de crédito e limites</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Cartão
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Carregando cartões...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar cartões</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCartoes}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && cartoes.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-gray-600 mb-6">Comece adicionando seu primeiro cartão de crédito</p>
          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Adicionar Primeiro Cartão
          </button>
        </div>
      )}

      {/* Cards Grid */}
      {!isLoading && !error && cartoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartoes.map((cartao) => {
            const limiteDisponivel = calcularLimiteDisponivel(cartao);
            const utilizacaoPercentual = ((cartao.limiteTotal - limiteDisponivel) / cartao.limiteTotal) * 100;

            return (
              <div
                key={cartao.id}
                className={`${getCardGradient(cartao.nome)} rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-[1.02]`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{cartao.nome}</h3>
                    <p className="text-white/80 text-sm">Cartão de Crédito</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(cartao)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cartao.id)}
                      className="bg-white/20 hover:bg-red-500/70 p-2 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-white/80 text-sm">Limite Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(cartao.limiteTotal)}</p>
                  </div>

                  <div>
                    <p className="text-white/80 text-sm">Limite Disponível</p>
                    <p className="text-xl font-semibold">{formatCurrency(limiteDisponivel)}</p>
                  </div>

                  {/* Utilization Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilização</span>
                      <span>{utilizacaoPercentual.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${Math.min(utilizacaoPercentual, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Fechamento</span>
                      </div>
                      <p className="font-semibold">{cartao.diaFechamento}º dia</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Vencimento</span>
                      </div>
                      <p className="font-semibold">{cartao.diaVencimento}º dia</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Novo Cartão' : 'Editar Cartão'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {modalMode === 'create' ? 'Adicione um novo cartão de crédito' : 'Atualize as informações do cartão'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 text-sm">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Nome do Cartão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cartão *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleNomeChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Nubank, Inter, Itaú"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Dias de Fechamento e Vencimento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia de Fechamento *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="diaFechamento"
                      value={formData.diaFechamento}
                      onChange={handleInputChange}
                      min="1"
                      max="31"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <span className="absolute right-3 top-3 text-gray-500">º dia</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia de Vencimento *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="diaVencimento"
                      value={formData.diaVencimento}
                      onChange={handleInputChange}
                      min="1"
                      max="31"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                    <span className="absolute right-3 top-3 text-gray-500">º dia</span>
                  </div>
                </div>
              </div>

              {/* Limite Total */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite Total *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="limiteTotal"
                    value={formData.limiteTotal}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0,00"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-1">Valor máximo disponível para gastos no cartão</p>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </span>
                  ) : modalMode === 'create' ? (
                    'Criar Cartão'
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartoesCredito;