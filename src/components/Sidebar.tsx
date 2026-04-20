import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  DollarSign,
  CreditCard,
  TrendingUp,
  PieChart,
  Target,
  Calendar,
  Settings,
  Bell,
  User,
  Wallet,
  BarChart3,
  Tag,
  LogOut,
  ChevronDown,
  HelpCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

/**
 * Componente Sidebar para navegação do sistema PlannerFin
 * Design moderno com dropdown de usuário, scrollbar customizada e UX aprimorada
 */
const Sidebar: React.FC = () => {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Iniciais do usuário para o avatar
  const getUserInitials = () => {
    if (!usuario?.nome) return 'U';
    const names = usuario.nome.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Itens de navegação principais
  const mainNavItems: MenuItem[] = [
    { label: 'Dashboard', href: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Lançamentos', href: '/transacoes', icon: <DollarSign className="w-5 h-5" />, badge: 5 },
    { label: 'Contas', href: '/contas', icon: <Wallet className="w-5 h-5" /> },
    { label: 'Cartões', href: '/cartoes', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Categorias', href: '/categorias', icon: <Tag className="w-5 h-5" /> },
    { label: 'Orçamento', href: '/orcamento', icon: <PieChart className="w-5 h-5" /> },
    { label: 'Fluxo de Caixa', href: '/fluxo-caixa', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Metas', href: '/metas', icon: <Target className="w-5 h-5" /> },
    { label: 'Relatórios', href: '/relatorios', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  // Itens secundários (configurações)
  const secondaryNavItems: MenuItem[] = [
    { label: 'Calendário', href: '/calendario', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Notificações', href: '/notificacoes', icon: <Bell className="w-5 h-5" />, badge: 3 },
  ];

  // Opções do menu do usuário (dropdown)
  const userMenuItems = [
    { label: 'Perfil', href: '/perfil', icon: <User className="w-4 h-4" /> },
    { label: 'Configurações', href: '/configuracoes', icon: <Settings className="w-4 h-4" /> },
    { label: 'Ajuda', href: '/ajuda', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Sair', action: logout, icon: <LogOut className="w-4 h-4" /> },
  ];

  // Verificar se rota está ativa (inclui subrotas)
  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo e Branding */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              PlannerFin
            </h1>
            <p className="text-xs text-gray-400">Controle Financeiro Inteligente</p>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro Rápido */}
      <div className="p-4 border-b border-gray-700">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Bem-vindo de volta!</p>
          <p className="text-lg font-bold truncate">
            {usuario?.nome?.split(' ')[0] || 'Usuário'}
          </p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Sistema ativo e sincronizado
          </p>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-4 overflow-y-auto sidebar-scroll">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Navegação
          </h3>
          {mainNavItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive: navActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    navActive
                      ? 'bg-purple-900/30 text-purple-300 border-l-4 border-purple-500 shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <div className={`${isActive ? 'text-purple-300' : 'text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Navegação Secundária */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Ferramentas
          </h3>
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive: navActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      navActive
                        ? 'bg-gray-800 text-white border-l-4 border-gray-500'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Área do Usuário com Dropdown */}
      <div ref={userMenuRef} className="p-4 border-t border-gray-700">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className={`flex items-center justify-between w-full p-2 rounded-lg transition-all duration-200 ${
            isUserMenuOpen ? 'bg-gray-800' : 'hover:bg-gray-800'
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            {/* Avatar com iniciais */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">
                {usuario?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {usuario?.email || 'email@exemplo.com'}
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isUserMenuOpen && (
          <div className="absolute bottom-20 left-4 right-4 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50 animate-in slide-in-from-bottom-5">
            {userMenuItems.map((item, index) => {
              if (item.action) {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      item.action?.();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                  >
                    <div className="text-red-400 mr-3">{item.icon}</div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              }
              return (
                <NavLink
                  key={index}
                  to={item.href!}
                  onClick={() => setIsUserMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  <div className={`${isActiveRoute(item.href!) ? 'text-purple-400' : 'text-gray-400'} mr-3`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS para scrollbar customizada (inline como fallback) */}
      <style>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        .animate-in {
          animation-duration: 200ms;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slide-in-from-bottom-5 {
          animation-name: slideInFromBottom5;
        }
        @keyframes slideInFromBottom5 {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;