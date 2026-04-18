import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lancamentos from './pages/Lancamentos';
import ContasBancarias from './pages/ContasBancarias';
import Categorias from './pages/Categorias';
import CartoesCredito from './pages/CartoesCredito';
import Orcamentos from './pages/Orcamentos';

/**
 * Configuração de rotas do sistema PlannerFin
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      {/* Páginas futuras */}
      <Route path="/transacoes" element={<Layout><Lancamentos /></Layout>} />
      <Route path="/contas" element={<Layout><ContasBancarias /></Layout>} />
      <Route path="/cartoes" element={<Layout><CartoesCredito /></Layout>} />
      <Route path="/categorias" element={<Layout><Categorias /></Layout>} />
      <Route path="/orcamento" element={<Layout><Orcamentos /></Layout>} />
      <Route path="/fluxo-caixa" element={<Layout><div>Fluxo de Caixa (em desenvolvimento)</div></Layout>} />
      <Route path="/metas" element={<Layout><div>Metas (em desenvolvimento)</div></Layout>} />
      <Route path="/relatorios" element={<Layout><div>Relatórios (em desenvolvimento)</div></Layout>} />
      <Route path="/calendario" element={<Layout><div>Calendário (em desenvolvimento)</div></Layout>} />
      <Route path="/notificacoes" element={<Layout><div>Notificações (em desenvolvimento)</div></Layout>} />
      <Route path="/perfil" element={<Layout><div>Perfil (em desenvolvimento)</div></Layout>} />
      <Route path="/configuracoes" element={<Layout><div>Configurações (em development)</div></Layout>} />
      <Route path="/ajuda" element={<Layout><div>Ajuda (em desenvolvimento)</div></Layout>} />
      {/* 404 */}
      <Route path="*" element={<Layout><div>Página não encontrada</div></Layout>} />
    </Routes>
  );
};

export default AppRoutes;