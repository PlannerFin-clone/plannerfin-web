import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RotasProtegidas from './components/RotasProtegidas';
import Home from './pages/Home';
import Lancamentos from './pages/Lancamentos';
import ContasBancarias from './pages/ContasBancarias';
import Categorias from './pages/Categorias';
import CartoesCredito from './pages/CartoesCredito';
import Orcamentos from './pages/Orcamentos';
import Metas from './pages/Metas';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

/**
 * Configuração de rotas do sistema PlannerFin
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas públicas (acesso livre) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rotas protegidas (requer autenticação) */}
      <Route path="/" element={
        <RotasProtegidas>
          <Layout><Home /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/transacoes" element={
        <RotasProtegidas>
          <Layout><Lancamentos /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/contas" element={
        <RotasProtegidas>
          <Layout><ContasBancarias /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/cartoes" element={
        <RotasProtegidas>
          <Layout><CartoesCredito /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/categorias" element={
        <RotasProtegidas>
          <Layout><Categorias /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/orcamento" element={
        <RotasProtegidas>
          <Layout><Orcamentos /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/fluxo-caixa" element={
        <RotasProtegidas>
          <Layout><div>Fluxo de Caixa (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />
      <Route path="/metas" element={
        <RotasProtegidas>
          <Layout><Metas /></Layout>
        </RotasProtegidas>
      } />
      <Route path="/relatorios" element={
        <RotasProtegidas>
          <Layout><div>Relatórios (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />
      <Route path="/calendario" element={
        <RotasProtegidas>
          <Layout><div>Calendário (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />
      <Route path="/notificacoes" element={
        <RotasProtegidas>
          <Layout><div>Notificações (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />
      <Route path="/perfil" element={
        <RotasProtegidas>
          <Layout><div>Perfil (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />
      <Route path="/configuracoes" element={
        <RotasProtegidas>
          <Layout><div>Configurações (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />
      <Route path="/ajuda" element={
        <RotasProtegidas>
          <Layout><div>Ajuda (em desenvolvimento)</div></Layout>
        </RotasProtegidas>
      } />

      {/* 404 - Redirecionar para login se não autenticado */}
      <Route path="*" element={
        <RotasProtegidas>
          <Layout><div>Página não encontrada</div></Layout>
        </RotasProtegidas>
      } />
    </Routes>
  );
};

export default AppRoutes;