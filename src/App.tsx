import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

/**
 * Componente principal do PlannerFin
 * Configura o roteamento e estrutura base da aplicação
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
