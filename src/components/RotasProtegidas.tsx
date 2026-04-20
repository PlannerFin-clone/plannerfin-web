import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface RotasProtegidasProps {
  children: ReactNode;
}

/**
 * Componente para proteger rotas que requerem autenticação
 * Redireciona usuários não autenticados para a página de login
 * Exibe loading state enquanto verifica autenticação
 */
const RotasProtegidas: React.FC<RotasProtegidasProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando autenticação...</h2>
          <p className="text-gray-600">Por favor, aguarde enquanto validamos sua sessão</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar conteúdo protegido se autenticado
  return <>{children}</>;
};

export default RotasProtegidas;