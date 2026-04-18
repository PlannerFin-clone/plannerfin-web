import React from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout principal do sistema PlannerFin
 * Inclui Sidebar fixa e área de conteúdo principal
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixa */}
      <Sidebar />

      {/* Área de conteúdo principal */}
      <main className="flex-1 ml-64 p-6">
        {/* Cabeçalho com breadcrumb e ações */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Bem-vindo ao seu controle financeiro</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                + Nova Transação
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {children}
        </div>

        {/* Rodapé */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>
            PlannerFin © {new Date().getFullYear()} • Sistema de Gestão Financeira Pessoal
          </p>
          <p className="mt-1">
            Desenvolvido com ❤️ para controle financeiro preditivo
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;