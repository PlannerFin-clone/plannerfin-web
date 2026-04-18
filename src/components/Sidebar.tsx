import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Shield,
  FileText,
  Tag
} from 'lucide-react';
import type { NavItem } from '../types';

/**
 * Componente Sidebar para navegação do sistema PlannerFin
 * Design inspirado em aplicativos financeiros modernos
 */
const Sidebar: React.FC = () => {
  // Itens de navegação principais
  const mainNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: 'Home', active: true },
    { label: 'Lançamentos', href: '/transacoes', icon: 'DollarSign', badge: 5 },
    { label: 'Contas', href: '/contas', icon: 'Wallet' },
    { label: 'Cartões', href: '/cartoes', icon: 'CreditCard' },
    { label: 'Categorias', href: '/categorias', icon: 'Tag' },
    { label: 'Orçamento', href: '/orcamento', icon: 'PieChart' },
    { label: 'Fluxo de Caixa', href: '/fluxo-caixa', icon: 'TrendingUp' },
    { label: 'Metas', href: '/metas', icon: 'Target' },
    { label: 'Relatórios', href: '/relatorios', icon: 'BarChart3' },
  ];

  // Itens secundários (configurações)
  const secondaryNavItems: NavItem[] = [
    { label: 'Calendário', href: '/calendario', icon: 'Calendar' },
    { label: 'Notificações', href: '/notificacoes', icon: 'Bell', badge: 3 },
    { label: 'Perfil', href: '/perfil', icon: 'User' },
    { label: 'Configurações', href: '/configuracoes', icon: 'Settings' },
    { label: 'Ajuda', href: '/ajuda', icon: 'FileText' },
  ];

  // Mapeamento de ícones por nome
  const iconMap: Record<string, React.ReactNode> = {
    Home: <Home className="w-5 h-5" />,
    DollarSign: <DollarSign className="w-5 h-5" />,
    CreditCard: <CreditCard className="w-5 h-5" />,
    TrendingUp: <TrendingUp className="w-5 h-5" />,
    PieChart: <PieChart className="w-5 h-5" />,
    Target: <Target className="w-5 h-5" />,
    Calendar: <Calendar className="w-5 h-5" />,
    Settings: <Settings className="w-5 h-5" />,
    Bell: <Bell className="w-5 h-5" />,
    User: <User className="w-5 h-5" />,
    Wallet: <Wallet className="w-5 h-5" />,
    BarChart3: <BarChart3 className="w-5 h-5" />,
    Shield: <Shield className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    Tag: <Tag className="w-5 h-5" />,
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo e Branding */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              PlannerFin
            </h1>
            <p className="text-xs text-gray-400">Controle Financeiro</p>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro Rápido */}
      <div className="p-4 border-b border-gray-700">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Saldo Total</p>
          <p className="text-xl font-bold">R$ 12.450,80</p>
          <p className="text-xs text-green-400 mt-1">+2,5% este mês</p>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Navegação
          </h3>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-900/30 text-purple-300 border-l-4 border-purple-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                {iconMap[item.icon]}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Navegação Secundária */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                {iconMap[item.icon]}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Usuário e Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">João Silva</p>
            <p className="text-xs text-gray-400 truncate">joao@email.com</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;