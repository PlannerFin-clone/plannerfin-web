import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Target, AlertCircle, X, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { orcamentoService, categoriaService } from '../services/api';
import type { ApiResponse, Orcamento, OrcamentoRequest, Categoria } from '../types';
import { formatCurrency, formatPercentage, formatDate } from '../types';

/**
 * Página de Gestão de Orçamentos Mensais
 * Exibe orçamentos com barras de progresso calculadas a partir das transações reais
 */
const Orcamentos: React.FC = () => {
  // ID do usuário fixo para testes
  const USER_ID = 'c987f42a-abf7-4412-8b73-18947348ae64';

  // Estados principais
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de data (mês/ano atual por padrão)
  const currentDate = new Date();
  const [mesFiltro, setMesFiltro] = useState<number>(currentDate.getMonth() + 1); // Janeiro = 1
  const [anoFiltro, setAnoFiltro] = useState<number>(currentDate.getFullYear());

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [orcamentoEditando, setOrcamentoEditando] = useState<Orcamento | null>(null);

  // Formulário
  const [formData, setFormData] = useState<OrcamentoRequest>({
    categoriaId: '',
    valorLimite: 0,
    mes: mesFiltro,
    ano: anoFiltro,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Carregar orçamentos e categorias
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar orçamentos filtrados por mês/ano
      const responseOrcamentos = await orcamentoService.getByMesAno(USER_ID, mesFiltro, anoFiltro);
      const apiResponseOrcamentos: ApiResponse<Orcamento[]> = responseOrcamentos.data;

      if (apiResponseOrcamentos.data) {
        setOrcamentos(apiResponseOrcamentos.data);
      } else {
        setOrcamentos([]);
      }

      // Carregar categorias (apenas DESPESA)
      const responseCategorias = await categoriaService.getAll(USER_ID);
      const apiResponseCategorias: ApiResponse<Categoria[]> = responseCategorias.data;

      if (apiResponseCategorias.data) {
        // Filtrar apenas categorias do tipo DESPESA (orçamento só funciona para despesas)
        const categoriasDespesa = apiResponseCategorias.data.filter(
          cat => cat.tipo === 'DESPESA'
        );
        setCategorias(categoriasDespesa);
      }

    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || err.response?.data?.message || 'Erro ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mesFiltro, anoFiltro]);

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setOrcamentoEditando(null);
    setFormData({
      categoriaId: '',
      valorLimite: 0,
      mes: mesFiltro,
      ano: anoFiltro,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (orcamento: Orcamento) => {
    setModalMode('edit');
    setOrcamentoEditando(orcamento);
    setFormData({
      categoriaId: orcamento.categoriaId,
      valorLimite: orcamento.valorLimite,
      mes: orcamento.mes,
      ano: orcamento.ano,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOrcamentoEditando(null);
    setFormData({
      categoriaId: '',
      valorLimite: 0,
      mes: mesFiltro,
      ano: anoFiltro,
    });
    setSubmitError(null);
  };

  // Manipular mudança dos campos numéricos
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('valorLimite') ? parseFloat(value) || 0 : parseInt(value) || 0,
    }));
  };

  // Manipular mudança da categoria (select)
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      categoriaId: e.target.value,
    }));
  };

  // Manipular mudança do mês/ano (para filtro)
  const handleMesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMes = parseInt(e.target.value);
    setMesFiltro(newMes);
    if (modalMode === 'create') {
      setFormData(prev => ({ ...prev, mes: newMes }));
    }
  };

  const handleAnoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAno = parseInt(e.target.value);
    setAnoFiltro(newAno);
    if (modalMode === 'create') {
      setFormData(prev => ({ ...prev, ano: newAno }));
    }
  };

  // Submeter formulário (criar ou editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validações
      if (!formData.categoriaId) {
        throw new Error('Selecione uma categoria');
      }
      if (formData.valorLimite <= 0) {
        throw new Error('Valor limite deve ser maior que zero');
      }
      if (formData.mes < 1 || formData.mes > 12) {
        throw new Error('Mês deve ser entre 1 e 12');
      }
      if (formData.ano < 2000 || formData.ano > 2100) {
        throw new Error('Ano deve estar entre 2000 e 2100');
      }

      if (modalMode === 'create') {
        await orcamentoService.create(formData, USER_ID);
      } else if (modalMode === 'edit' && orcamentoEditando) {
        await orcamentoService.update(orcamentoEditando.id, formData, USER_ID);
      }

      // Fechar modal e recarregar dados
      closeModal();
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao salvar orçamento:', err);
      setSubmitError(err.message || err.response?.data?.message || 'Erro ao salvar orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir orçamento
  const handleDelete = async (orcamentoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await orcamentoService.delete(orcamentoId, USER_ID);
      await fetchData();
    } catch (err: any) {
      console.error('Erro ao excluir orçamento:', err);
      alert(err.response?.data?.message || 'Erro ao excluir orçamento');
    }
  };

  // Obter cor da categoria (fallback para cor padrão)
  const getCategoriaCor = (orcamento: Orcamento) => {
    if (orcamento.categoriaCor) return orcamento.categoriaCor;

    // Fallback baseado no ID da categoria
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];
    const hash = orcamento.categoriaId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Obter cor da barra de progresso baseada no percentual de uso
  const getProgressBarColor = (percentual: number, estourado: boolean) => {
    if (estourado) return 'bg-red-600';
    if (percentual >= 90) return 'bg-yellow-500';
    if (percentual >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  // Gerar lista de meses
  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' },
  ];

  // Gerar lista de anos (últimos 5 anos + próximos 5)
  const anos = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-8 h-8 text-blue-600" />
              Orçamentos Mensais
            </h1>
            <p className="text-gray-600 mt-1">
              Defina limites de gastos por categoria e acompanhe seu progresso automaticamente
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
            {/* Filtros de Mês/Ano */}
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm p-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={mesFiltro}
                onChange={handleMesChange}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {meses.map(mes => (
                  <option key={mes.valor} value={mes.valor}>{mes.nome}</option>
                ))}
              </select>
              <select
                value={anoFiltro}
                onChange={handleAnoChange}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Novo Orçamento
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Erro ao carregar orçamentos</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando orçamentos...</p>
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Orçado</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(orcamentos.reduce((sum, o) => sum + o.valorLimite, 0))}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Realizado</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(orcamentos.reduce((sum, o) => sum + o.valorRealizado, 0))}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Orçamentos Estourados</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {orcamentos.filter(o => o.estourado).length} de {orcamentos.length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orçamentos Grid */}
            {orcamentos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum orçamento encontrado</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Você ainda não definiu orçamentos para {meses.find(m => m.valor === mesFiltro)?.nome} de {anoFiltro}.
                  Clique em "Novo Orçamento" para começar a planejar seus gastos.
                </p>
                <button
                  onClick={openCreateModal}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Orçamento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orcamentos.map(orcamento => (
                  <div key={orcamento.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: orcamento.categoriaCor || '#3b82f6' }}
                        >
                          <span className="font-bold">{orcamento.categoriaNome.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{orcamento.categoriaNome}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              {meses.find(m => m.valor === orcamento.mes)?.nome} {orcamento.ano}
                            </span>
                            {orcamento.estourado && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                Estourado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(orcamento)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar orçamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(orcamento.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir orçamento"
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
                          <p className="text-gray-500 text-sm">Limite Definido</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(orcamento.valorLimite)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Gasto Real</p>
                          <p className={`text-lg font-semibold ${orcamento.estourado ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatCurrency(orcamento.valorRealizado)}
                          </p>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso</span>
                          <span className="font-medium">
                            {formatPercentage(orcamento.percentualAtingimento)}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressBarColor(orcamento.percentualAtingimento, orcamento.estourado)}`}
                            style={{ width: `${Math.min(orcamento.percentualAtingimento, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600">Dentro do limite</span>
                          </div>
                          {orcamento.estourado && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-600"></div>
                              <span className="text-sm text-gray-600">Estourado</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Atualizado em {formatDate(orcamento.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Criar/Editar Orçamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Novo Orçamento' : 'Editar Orçamento'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {modalMode === 'create'
                    ? 'Defina um limite de gastos para uma categoria específica'
                    : 'Atualize os dados do seu orçamento'}
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
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Categoria *
                  </label>
                  <select
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleCategoriaChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome} {cat.descricao ? `(${cat.descricao})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-xs mt-1.5">
                    Somente categorias do tipo DESPESA podem receber orçamentos
                  </p>
                </div>

                {/* Valor Limite */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Valor Limite (R$) *
                  </label>
                  <input
                    type="number"
                    name="valorLimite"
                    value={formData.valorLimite || ''}
                    onChange={handleNumericChange}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 800.00"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1.5">
                    Valor máximo que você deseja gastar nesta categoria no mês selecionado
                  </p>
                </div>

                {/* Mês e Ano */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mês *
                    </label>
                    <select
                      name="mes"
                      value={formData.mes}
                      onChange={handleNumericChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {meses.map(mes => (
                        <option key={mes.valor} value={mes.valor}>{mes.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ano *
                    </label>
                    <select
                      name="ano"
                      value={formData.ano}
                      onChange={handleNumericChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {anos.map(ano => (
                        <option key={ano} value={ano}>{ano}</option>
                      ))}
                    </select>
                  </div>
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
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : modalMode === 'create' ? (
                    'Criar Orçamento'
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

export default Orcamentos;