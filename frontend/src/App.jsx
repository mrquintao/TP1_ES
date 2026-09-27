import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Provas from './pages/Provas';
import Trabalhos from './pages/Trabalhos';
import Habitos from './pages/Habitos';
import Calendario from './pages/Calendario';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';

/**
 * App — Componente raiz do StudySync
 * AuthProvider por fora de tudo; Layout decide o que mostrar com base na sessão.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Separado do App só pra poder usar useAuth() aqui (precisa estar dentro do AuthProvider)
function Layout() {
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sem sessão, ainda não faz sentido mostrar os links de navegação */}
      {usuario && <Navbar />}

      <main>
        <Routes>
          {/* Públicas — cadastro e login não exigem sessão */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Protegidas — exigem login */}
          <Route path="/" element={<RotaProtegida><Home /></RotaProtegida>} />
          <Route path="/provas" element={<RotaProtegida><Provas /></RotaProtegida>} />
          <Route path="/trabalhos" element={<RotaProtegida><Trabalhos /></RotaProtegida>} />
          <Route path="/habitos" element={<RotaProtegida><Habitos /></RotaProtegida>} />
          <Route path="/calendario" element={<RotaProtegida><Calendario /></RotaProtegida>} />
        </Routes>
      </main>
    </div>
  );
}
