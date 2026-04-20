import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import type { AuthContextType, Usuario, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

// Chaves para localStorage
const TOKEN_KEY = 'plannerfin_token';
const USER_KEY = 'plannerfin_user';

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personalizado para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticação
 * Gerencia estado global de autenticação e persistência no localStorage
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser));
          // Configurar token no axios
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Erro ao carregar autenticação do localStorage:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  /**
   * Função de login
   */
  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const request: LoginRequest = { email, senha };
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', request);

      if (response.data?.data) {
        const { token, usuario } = response.data.data;

        // Salvar no estado
        setToken(token);
        setUsuario(usuario);

        // Salvar no localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));

        // Configurar token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de registro
   */
  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

      if (response.data?.data) {
        const { token, usuario } = response.data.data;

        // Salvar no estado
        setToken(token);
        setUsuario(usuario);

        // Salvar no localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));

        // Configurar token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função de logout
   */
  const logout = () => {
    // Limpar estado
    setUsuario(null);
    setToken(null);

    // Limpar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Remover token do axios
    delete api.defaults.headers.common['Authorization'];
  };

  /**
   * Verificar se usuário está autenticado
   */
  const isAuthenticated = !!token && !!usuario;

  // Valor do contexto
  const contextValue: AuthContextType = {
    usuario,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}