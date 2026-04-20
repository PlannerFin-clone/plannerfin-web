import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Target, AlertCircle, X, TrendingUp, PiggyBank, Trophy, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { metaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ApiResponse, Meta, MetaRequest, MetaStats } from '../types';
import { formatCurrency, formatPercentage, formatDate } from '../types';

/**
 * Página de Gestão de Metas Financeiras
 * Exibe metas em cards motivacionais com barras de progresso e ações rápidas
 */
const Metas: React.FC = () => {
  const { usuario } = useAuth();

  // Estados principais
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal principal (criar/editar meta)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [metaEditando, setMetaEditando] = useState<Meta | null>(null);

  // Estados do modal rápido (adicionar saldo)
  const [isModalRapidoOpen, setIsModalRapidoOpen] = useState(false);
  const [metaAdicionandoSaldo, setMetaAdicionandoSaldo] = useState<Meta | null>(null);
  const [valorRapido, setValorRapido] = useState<number>(0);

  // Estatísticas
  const [estatisticas, setEstatisticas] = useState<MetaStats | null>(null);

  // Formulário
  const [formData, setFormData] = useState<MetaRequest>({
    nome: '',
    valorAlvo: 0,
    valorAtual: 0,
    dataPrazo: null,
    imagemUrl: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Carregar metas e estatísticas
  const fetchData = async () => {
    try {
      if (!usuario?.id) throw new Error('Usuário não autenticado');

      setIsLoading(true);
      setError(null);

      // Carregar todas as metas
      const responseMetas = await metaService.getAll(usuario.id);
      const apiResponseMetas: ApiResponse<Meta[]> = responseMetas.data;

      if (apiResponseMetas.data) {
        setMetas(apiResponseMetas.data);
      } else {
        setMetas([]);
      }

      // Carregar estatísticas
      const responseStats = await metaService.getEstatisticas(usuario.id);
      const apiResponseStats: ApiResponse<MetaStats> = responseStats.data;
      setEstatisticas(apiResponseStats.data);

    } catch (err: any) {
      console.error('Erro ao carregar metas:', err);
      setError(err.message || err.response?.data?.message || 'Erro ao carregar metas.');
      setMetas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (usuario?.id) {
      fetchData();
    }
  }, [usuario?.id]);

  // Modal handlers - Principal
  const openCreateModal = () => {
    setModalMode('create');
    setMetaEditando(null);
    setFormData({
      nome: '',
      valorAlvo: 0,
      valorAtual: 0,
      dataPrazo: null,
      imagemUrl: null,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (meta: Meta) => {
    setModalMode('edit');
    setMetaEditando(meta);
    setFormData({
      nome: meta.nome,
      valorAlvo: meta.valorAlvo,
      valorAtual: meta.valorAtual,
      dataPrazo: meta.dataPrazo,
      imagemUrl: meta.imagemUrl,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMetaEditando(null);
    setFormData({
      nome: '',
      valorAlvo: 0,
      valorAtual: 0,
      dataPrazo: null,
      imagemUrl: null,
    });
    setSubmitError(null);
  };

  // Modal handlers - Rápido (Adicionar Saldo)
  const openModalRapido = (meta: Meta) => {
    setMetaAdicionandoSaldo(meta);
    setValorRapido(0);
    setIsModalRapidoOpen(true);
  };

  const closeModalRapido = () => {
    setIsModalRapidoOpen(false);
    setMetaAdicionandoSaldo(null);
    setValorRapido(0);
  };

  // Manipular mudança dos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('valor') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      dataPrazo: e.target.value || null,
    }));
  };

  // Submeter formulário principal (criar ou editar meta)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validações
      if (!formData.nome.trim()) {
        throw new Error('Nome da meta é obrigatório');
      }
      if (formData.valorAlvo <= 0) {
        throw new Error('Valor alvo deve ser maior que zero');
      }
      if ((formData.valorAtual ?? 0) < 0) {
        throw new Error('Valor atual não pode ser negativo');
      }
      if ((formData.valorAtual ?? 0) > formData.valorAlvo) {
        throw new Error('Valor atual não pode ser maior que o valor alvo');
      }

      if (!usuario?.id) throw new Error('Usuário não autenticado');

      if (modalMode === 'create') {
        await metaService.create(formData, usuario.id);
      } else if (modalMode === 'edit' && metaEditando) {
        await metaService.update(metaEditando.id, formData, usuario.id);
      }

      // Fechar modal e recarregar dados
      closeModal();
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao salvar meta:', err);
      setSubmitError(err.message || err.response?.data?.message || 'Erro ao salvar meta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adicionar saldo (modal rápido)
  const handleAdicionarSaldo = async () => {
    if (!metaAdicionandoSaldo || valorRapido <= 0) return;

    try {
      setIsSubmitting(true);

      const novoValorAtual = metaAdicionandoSaldo.valorAtual + valorRapido;

      // Verificar se não ultrapassa o valor alvo
      if (novoValorAtual > metaAdicionandoSaldo.valorAlvo) {
        throw new Error('Valor ultrapassa o valor alvo da meta');
      }

      await metaService.adicionarValor(metaAdicionandoSaldo.id, valorRapido, usuario!.id);

      // Fechar modal e recarregar dados
      closeModalRapido();
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao adicionar saldo:', err);
      alert(err.message || err.response?.data?.message || 'Erro ao adicionar saldo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir meta
  const handleDelete = async (metaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await metaService.delete(metaId, usuario!.id);
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao excluir meta:', err);
      alert(err.response?.data?.message || 'Erro ao excluir meta');
    }
  };

  // Obter cor do card baseado no status da meta
  const getCardColorClass = (meta: Meta) => {
    if (meta.alcancada) return 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50';

    if (meta.dataPrazo) {
      const prazo = new Date(meta.dataPrazo);
      const hoje = new Date();
      const diffDias = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

      if (diffDias <= 0) return 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50';
      if (diffDias <= 7) return 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50';
    }

    return 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50';
  };

  // Obter ícone baseado no status da meta
  const getMetaIcon = (meta: Meta) => {
    if (meta.alcancada) return <Trophy className="w-6 h-6 text-green-600" />;

    if (meta.dataPrazo) {
      const prazo = new Date(meta.dataPrazo);
      const hoje = new Date();
      const diffDias = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

      if (diffDias <= 0) return <AlertCircle className="w-6 h-6 text-red-600" />;
      if (diffDias <= 7) return <Clock className="w-6 h-6 text-orange-600" />;
    }

    return <Target className="w-6 h-6 text-blue-600" />;
  };

  // Obter texto de status
  const getStatusText = (meta: Meta) => {
    if (meta.alcancada) return { text: 'Meta alcançada!', color: 'text-green-600' };

    if (meta.dataPrazo) {
      const prazo = new Date(meta.dataPrazo);
      const hoje = new Date();
      const diffDias = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));

      if (diffDias <= 0) return { text: 'Prazo expirado', color: 'text-red-600' };
      if (diffDias <= 7) return { text: `Prazo próximo (${diffDias} dias)`, color: 'text-orange-600' };
      return { text: `Prazo: ${formatDate(meta.dataPrazo)}`, color: 'text-gray-600' };
    }

    return { text: 'Sem prazo definido', color: 'text-gray-600' };
  };

  // Separar metas por status
  const metasAlcancadas = metas.filter(meta => meta.alcancada);
  const metasAtivas = metas.filter(meta => !meta.alcancada);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-8 h-8 text-purple-600" />
              Metas Financeiras
            </h1>
            <p className="text-gray-600 mt-1">
              Defina objetivos financeiros e acompanhe seu progresso com cards motivacionais
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Erro ao carregar metas</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Carregando metas...</p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Alvo</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(estatisticas?.valorAlvoTotal || 0)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {metas.length} metas {metasAlcancadas.length > 0 ? `· ${metasAlcancadas.length} alcançadas` : ''}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Guardado</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(estatisticas?.valorGuardadoTotal || 0)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPercentage(estatisticas?.progressoTotal || 0)} do total
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <PiggyBank className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Progresso Médio</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {metas.length > 0 ? formatPercentage(metas.reduce((sum, meta) => sum + meta.percentualConcluido, 0) / metas.length) : '0%'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {metasAtivas.length} metas ativas
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Metas Ativas */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Metas em Andamento
              </h2>

              {metasAtivas.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma meta em andamento</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Você não tem metas ativas no momento. Crie sua primeira meta para começar a economizar.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Primeira Meta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {metasAtivas.map(meta => {
                    const status = getStatusText(meta);
                    return (
                      <div key={meta.id} className={`rounded-xl shadow-sm hover:shadow-md transition-shadow border ${getCardColorClass(meta)}`}>
                        {/* Header */}
                        <div className="p-5 border-b border-gray-200 border-opacity-50 flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white shadow-sm">
                              {getMetaIcon(meta)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{meta.nome}</h3>
                              <p className={`text-sm font-medium mt-1 ${status.color}`}>
                                {status.text}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openModalRapido(meta)}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 font-medium"
                              title="Adicionar saldo"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Adicionar
                            </button>
                            <button
                              onClick={() => openEditModal(meta)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar meta"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(meta.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir meta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-5">
                          {/* Valores */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-500 text-sm">Valor Alvo</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(meta.valorAlvo)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm">Valor Atual</p>
                              <p className={`text-lg font-semibold ${meta.alcancada ? 'text-green-600' : 'text-gray-900'}`}>
                                {formatCurrency(meta.valorAtual)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm">Faltam</p>
                              <p className="text-lg font-semibold text-orange-600">
                                {formatCurrency(meta.valorRestante)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-sm">Conclusão</p>
                              <p className="text-lg font-semibold text-purple-600">
                                {formatPercentage(meta.percentualConcluido)}
                              </p>
                            </div>
                          </div>

                          {/* Barra de Progresso */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progresso</span>
                              <span className="font-medium">
                                {formatPercentage(meta.percentualConcluido)}
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                style={{ width: `${Math.min(meta.percentualConcluido, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 border-opacity-50">
                            <div className="text-sm text-gray-500">
                              Criada em {formatDate(meta.createdAt)}
                            </div>
                            <div className="flex items-center gap-2">
                              {meta.imagemUrl && (
                                <img
                                  src={meta.imagemUrl}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metas Alcançadas */}
            {metasAlcancadas.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                  Metas Concluídas
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {metasAlcancadas.map(meta => (
                    <div key={meta.id} className="rounded-xl shadow-sm border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                      {/* Header */}
                      <div className="p-5 border-b border-green-200 border-opacity-50 flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white shadow-sm">
                            <Trophy className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{meta.nome}</h3>
                            <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Meta alcançada!
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(meta)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar meta"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(meta.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir meta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <p className="text-gray-500 text-sm">Valor Alvo</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(meta.valorAlvo)}
                            </p>
                          </div>
                          <div className="text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-gray-500 text-sm">Valor Guardado</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(meta.valorAtual)}
                            </p>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-gray-600 text-sm">
                            Concluída em {formatDate(meta.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Principal - Criar/Editar Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Nova Meta Financeira' : 'Editar Meta'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {modalMode === 'create'
                    ? 'Defina um objetivo financeiro e acompanhe seu progresso'
                    : 'Atualize os dados da sua meta'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Erro no formulário</p>
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Nome da Meta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome da Meta *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Viagem para Europa, Reserva de Emergência"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1.5">
                    Dê um nome inspirador para sua meta financeira
                  </p>
                </div>

                {/* Valor Alvo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Valor Alvo (R$) *
                  </label>
                  <input
                    type="number"
                    name="valorAlvo"
                    value={formData.valorAlvo || ''}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 10000.00"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1.5">
                    Valor total que você deseja alcançar
                  </p>
                </div>

                {/* Valor Atual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Valor Atual (R$)
                  </label>
                  <input
                    type="number"
                    name="valorAtual"
                    value={formData.valorAtual || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: 2000.00"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">
                    Quanto você já guardou para esta meta (opcional)
                  </p>
                </div>

                {/* Data Prazo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prazo Final
                  </label>
                  <input
                    type="date"
                    name="dataPrazo"
                    value={formData.dataPrazo || ''}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">
                    Data limite para alcançar a meta (opcional)
                  </p>
                </div>

                {/* URL da Imagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    name="imagemUrl"
                    value={formData.imagemUrl || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-gray-500 text-xs mt-1.5">
                    Link para uma imagem representativa da meta (opcional)
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : modalMode === 'create' ? (
                    'Criar Meta'
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido - Adicionar Saldo */}
      {isModalRapidoOpen && metaAdicionandoSaldo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Adicionar Saldo
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {metaAdicionandoSaldo.nome}
                </p>
              </div>
              <button
                onClick={closeModalRapido}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Valor Atual</span>
                  <span className="font-medium">{formatCurrency(metaAdicionandoSaldo.valorAtual)}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(metaAdicionandoSaldo.percentualConcluido, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Meta</span>
                  <span className="font-medium">{formatCurrency(metaAdicionandoSaldo.valorAlvo)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor a Adicionar (R$)
                </label>
                <input
                  type="number"
                  value={valorRapido || ''}
                  onChange={(e) => setValorRapido(parseFloat(e.target.value) || 0)}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg font-medium"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              {valorRapido > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Novo valor:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(metaAdicionandoSaldo.valorAtual + valorRapido)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700 font-medium">Novo progresso:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPercentage(((metaAdicionandoSaldo.valorAtual + valorRapido) / metaAdicionandoSaldo.valorAlvo) * 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModalRapido}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarSaldo}
                disabled={isSubmitting || valorRapido <= 0}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Metas;