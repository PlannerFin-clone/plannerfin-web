import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag, AlertCircle, X, TrendingUp, TrendingDown } from 'lucide-react';
import { categoriaService } from '../services/api';
import type { ApiResponse, Categoria, CategoriaRequest } from '../types';
import { TipoTransacao, formatDate } from '../types';

/**
 * Página de Gestão de Categorias
 * Exibe categorias em lista com badges por tipo (Receita/Despesa)
 */
const Categorias: React.FC = () => {
  // ID do usuário fixo para testes
  const USER_ID = 'c987f42a-abf7-4412-8b73-18947348ae64';

  // Estados principais
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  // Formulário
  const [formData, setFormData] = useState<CategoriaRequest>({
    nome: '',
    descricao: '',
    tipo: TipoTransacao.DESPESA,
    icone: null,
    cor: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Carregar categorias
  const fetchCategorias = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await categoriaService.getAll(USER_ID);
      const apiResponse: ApiResponse<Categoria[]> = response.data;

      if (apiResponse.data) {
        setCategorias(apiResponse.data);
      } else {
        throw new Error('Dados das categorias não encontrados');
      }
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
      setError(err.response?.data?.message || 'Erro ao carregar categorias. Verifique o console.');
      setCategorias([]); // Limpa os dados em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Abrir modal para criar nova categoria
  const openCreateModal = () => {
    setModalMode('create');
    setCategoriaEditando(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: TipoTransacao.DESPESA,
      icone: null,
      cor: null,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar categoria
  const openEditModal = (categoria: Categoria) => {
    setModalMode('edit');
    setCategoriaEditando(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: '', // Campo descrição não existe na interface Categoria, então deixamos vazio
      tipo: categoria.tipo,
      icone: categoria.icone,
      cor: categoria.cor,
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manipular mudança do tipo (radio buttons)
  const handleTipoChange = (tipo: TipoTransacao) => {
    setFormData(prev => ({
      ...prev,
      tipo,
    }));
  };

  // Submeter formulário (criar ou editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Prepara dados para enviar (remove descrição vazia se não for usada)
      const dadosParaEnviar: CategoriaRequest = {
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        icone: formData.icone || null,
        cor: formData.cor || null,
      };

      // Adiciona descrição apenas se não estiver vazia
      if (formData.descricao && formData.descricao.trim() !== '') {
        dadosParaEnviar.descricao = formData.descricao.trim();
      }

      if (modalMode === 'create') {
        await categoriaService.create(dadosParaEnviar, USER_ID);
      } else if (modalMode === 'edit' && categoriaEditando) {
        await categoriaService.update(categoriaEditando.id, dadosParaEnviar, USER_ID);
      }

      // Fechar modal e recarregar dados
      closeModal();
      await fetchCategorias();
    } catch (err: any) {
      console.error('Erro ao salvar categoria:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao salvar categoria. Verifique o console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir categoria
  const handleDelete = async (categoriaId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await categoriaService.delete(categoriaId, USER_ID);
      await fetchCategorias(); // Recarregar lista
    } catch (err: any) {
      console.error('Erro ao excluir categoria:', err);
      alert(err.response?.data?.message || 'Erro ao excluir categoria. Verifique o console.');
    }
  };

  // Contar categorias por tipo
  const categoriasReceita = categorias.filter(c => c.tipo === TipoTransacao.RECEITA).length;
  const categoriasDespesa = categorias.filter(c => c.tipo === TipoTransacao.DESPESA).length;

  // Estados de loading e error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (error && categorias.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar categorias</h3>
          <p className="mt-2">{error}</p>
          <button
            onClick={fetchCategorias}
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
          <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
          <p className="text-gray-600">Organize suas categorias de receitas e despesas</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Estatísticas */}
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <div>
                <p className="text-sm text-gray-600">Receitas</p>
                <p className="text-lg font-bold text-gray-800">{categoriasReceita}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div>
                <p className="text-sm text-gray-600">Despesas</p>
                <p className="text-lg font-bold text-gray-800">{categoriasDespesa}</p>
              </div>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {categorias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Tag className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma categoria cadastrada</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Crie suas primeiras categorias para organizar suas transações financeiras
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Criar Primeira Categoria
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categorias.map((categoria) => (
              <div
                key={categoria.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Informações da categoria */}
                  <div className="flex items-center gap-4">
                    {/* Ícone/Logo */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                      {categoria.icone ? (
                        <div className="text-xl">{categoria.icone}</div>
                      ) : (
                        <Tag className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* Detalhes */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-800">{categoria.nome}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            categoria.tipo === TipoTransacao.RECEITA
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {categoria.tipo === TipoTransacao.RECEITA ? (
                            <span className="flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Receita
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Despesa
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Criada em {formatDate(categoria.createdAt)}
                        {categoria.updatedAt !== categoria.createdAt && ` • Atualizada em ${formatDate(categoria.updatedAt)}`}
                      </p>
                      {/* Cor personalizada se existir */}
                      {categoria.cor && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs text-gray-500">Cor:</div>
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: categoria.cor }}
                            title={categoria.cor}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(categoria)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ordem (se existir) */}
                {categoria.ordem > 0 && (
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="px-2 py-1 bg-gray-100 rounded">Ordem: {categoria.ordem}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
                </h3>
                <p className="text-sm text-gray-600">
                  {modalMode === 'create' ? 'Preencha os dados da nova categoria' : 'Atualize os dados da categoria'}
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

              <div className="space-y-6">
                {/* Nome da Categoria */}
                <div className="space-y-2">
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Ex: Alimentação, Transporte, Salário"
                  />
                </div>

                {/* Descrição (opcional) */}
                <div className="space-y-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                    Descrição (opcional)
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Descreva brevemente esta categoria..."
                  />
                </div>

                {/* Tipo de Categoria (Radio buttons) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Categoria *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Receita */}
                    <label
                      className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.tipo === TipoTransacao.RECEITA
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 border-2 rounded-full mr-3 ${
                          formData.tipo === TipoTransacao.RECEITA
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-400'
                        }`}></div>
                        <div>
                          <span className="font-medium text-gray-800">Receita</span>
                          <p className="text-sm text-gray-600">Entrada de dinheiro</p>
                        </div>
                      </div>
                      <TrendingUp className={`w-5 h-5 ${
                        formData.tipo === TipoTransacao.RECEITA ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <input
                        type="radio"
                        name="tipo"
                        value={TipoTransacao.RECEITA}
                        checked={formData.tipo === TipoTransacao.RECEITA}
                        onChange={() => handleTipoChange(TipoTransacao.RECEITA)}
                        className="sr-only"
                      />
                    </label>

                    {/* Despesa */}
                    <label
                      className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.tipo === TipoTransacao.DESPESA
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 border-2 rounded-full mr-3 ${
                          formData.tipo === TipoTransacao.DESPESA
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-400'
                        }`}></div>
                        <div>
                          <span className="font-medium text-gray-800">Despesa</span>
                          <p className="text-sm text-gray-600">Saída de dinheiro</p>
                        </div>
                      </div>
                      <TrendingDown className={`w-5 h-5 ${
                        formData.tipo === TipoTransacao.DESPESA ? 'text-red-600' : 'text-gray-400'
                      }`} />
                      <input
                        type="radio"
                        name="tipo"
                        value={TipoTransacao.DESPESA}
                        checked={formData.tipo === TipoTransacao.DESPESA}
                        onChange={() => handleTipoChange(TipoTransacao.DESPESA)}
                        className="sr-only"
                      />
                    </label>
                  </div>
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
                      {modalMode === 'create' ? 'Criar Categoria' : 'Salvar Alterações'}
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
            <div className={`w-3 h-3 rounded-full mr-2 ${categorias.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {categorias.length > 0
                ? `Conectado ao backend - ${categorias.length} categoria(s) carregada(s)`
                : 'Erro de conexão ou nenhuma categoria encontrada'}
            </span>
          </div>
          <button
            onClick={fetchCategorias}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categorias;