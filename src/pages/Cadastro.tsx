import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, Bell, CheckCircle, XCircle, CreditCard, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Cadastro
 * Design moderno responsivo com validação em tempo real
 */
const Cadastro: React.FC = () => {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('');
  const [diasNotificacao, setDiasNotificacao] = useState('7');
  const [notificarFixas, setNotificarFixas] = useState(true);
  const [notificarNaoFixas, setNotificarNaoFixas] = useState(true);

  // Estados de UI
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  // Validações em tempo real
  const validarSenha = () => {
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres';
    if (senha !== confirmarSenha) return 'As senhas não coincidem';
    return null;
  };

  const validarEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!nome || !email || !senha || !confirmarSenha) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    const senhaError = validarSenha();
    if (senhaError) {
      setError(senhaError);
      return;
    }

    const emailError = validarEmail();
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setIsLoading(true);
      const dadosCadastro = {
        nome,
        email,
        senha,
        numeroWhatsapp: numeroWhatsapp || null,
        diasNotificacao: parseInt(diasNotificacao) || 7,
        notificarFixas,
        notificarNaoFixas,
      };

      const success = await register(dadosCadastro);

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/'); // Redirecionar para dashboard após cadastro
        }, 2000);
      } else {
        setError('Erro ao criar conta');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="p-4 bg-green-100 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Conta criada com sucesso!</h1>
          <p className="text-gray-600 mb-8">
            Bem-vindo(a) ao PlannerFin! Redirecionando para o dashboard...
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir para o dashboard agora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado esquerdo - Gradiente com informações */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold">PlannerFin</h1>
            </div>
            <p className="text-xl text-white/90 font-light">
              Comece sua jornada financeira com planejamento inteligente
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Dashboard em tempo real</h3>
                <p className="text-white/80">Visualize sua situação financeira com gráficos e métricas atualizadas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Metas financeiras</h3>
                <p className="text-white/80">Defina e acompanhe objetivos como viagens, compras e reservas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Notificações inteligentes</h3>
                <p className="text-white/80">Receba alertas sobre vencimentos, orçamentos e metas.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-white/20 pt-8">
            <p className="text-white/70 text-sm">
              "Com o PlannerFin consegui economizar 40% da minha renda em 6 meses!"
            </p>
            <p className="text-white/90 font-medium mt-2">— João Santos, usuário há 1 ano</p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de cadastro */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12">
        <div className="max-w-lg w-full mx-auto">
          {/* Cabeçalho */}
          <div className="mb-10">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Crie sua conta</h2>
            <p className="text-gray-600">
              Preencha os dados abaixo para começar a usar o PlannerFin
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="p-1 bg-red-100 rounded">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Erro no cadastro</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      email && validarEmail() ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                {email && validarEmail() && (
                  <p className="mt-2 text-sm text-red-600">{validarEmail()}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={numeroWhatsapp}
                    onChange={(e) => setNumeroWhatsapp(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      senha && senha.length < 6 ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {senha && senha.length < 6 && (
                  <p className="mt-2 text-sm text-red-600">A senha deve ter pelo menos 6 caracteres</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      confirmarSenha && validarSenha() ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarConfirmarSenha ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {confirmarSenha && validarSenha() && (
                  <p className="mt-2 text-sm text-red-600">{validarSenha()}</p>
                )}
              </div>
            </div>

            {/* Configurações de Notificação */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configurações de notificação
              </h3>

              <div className="space-y-4">
                {/* Dias de notificação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias de antecedência para notificações
                  </label>
                  <select
                    value={diasNotificacao}
                    onChange={(e) => setDiasNotificacao(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">1 dia</option>
                    <option value="3">3 dias</option>
                    <option value="7">7 dias (recomendado)</option>
                    <option value="15">15 dias</option>
                    <option value="30">30 dias</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Receba notificações antes do vencimento de transações
                  </p>
                </div>

                {/* Checkboxes de notificação */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificarFixas}
                      onChange={(e) => setNotificarFixas(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Notificar transações fixas</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificarNaoFixas}
                      onChange={(e) => setNotificarNaoFixas(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Notificar transações não fixas</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Faça login
              </Link>
            </p>
          </div>

          {/* Termos de uso */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-gray-500 text-xs">
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Termos de Uso</a>{' '}
              e{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700">Política de Privacidade</a>
            </p>
            <p className="text-center text-gray-500 text-xs mt-2">
              © {new Date().getFullYear()} PlannerFin. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;