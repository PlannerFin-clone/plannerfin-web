import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, LogIn, Shield, CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Login
 * Design moderno responsivo com gradiente metade da tela
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !senha) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      const success = await login(email, senha);

      if (success) {
        navigate('/'); // Redirecionar para dashboard
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado esquerdo - Gradiente com informações */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 relative overflow-hidden">
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
              Controle financeiro inteligente para sua vida
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Dashboard em tempo real</h3>
                <p className="text-white/80">Acompanhe suas finanças com gráficos e métricas atualizadas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Segurança total</h3>
                <p className="text-white/80">Seus dados protegidos com criptografia de ponta a ponta.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Planejamento inteligente</h3>
                <p className="text-white/80">Metas, orçamentos e projeções para seu futuro financeiro.</p>
              </div>
            </div>
          </div>

          <div className="mt-16 border-t border-white/20 pt-8">
            <p className="text-white/70 text-sm">
              "O PlannerFin transformou minha relação com o dinheiro. Recomendo para todos!"
            </p>
            <p className="text-white/90 font-medium mt-2">— Maria Silva, usuária há 2 anos</p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12">
        <div className="max-w-md w-full mx-auto">
          {/* Logo mobile */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PlannerFin</h1>
            </div>
            <p className="text-gray-600">
              Controle financeiro inteligente para sua vida
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Bem-vindo de volta</h2>
            <p className="text-gray-600">
              Faça login para acessar seu dashboard financeiro
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="p-1 bg-red-100 rounded">
                <Lock className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Erro de autenticação</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="mt-2 text-right">
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar na conta
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Link para Cadastro */}
          <div className="text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro"
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Crie uma agora
              </Link>
            </p>
          </div>

          {/* Informações de segurança */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Shield className="w-4 h-4" />
              <span>Seus dados estão seguros conosco</span>
            </div>
            <p className="text-center text-gray-500 text-xs mt-2">
              © {new Date().getFullYear()} PlannerFin. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;