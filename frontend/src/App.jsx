import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Provas from './pages/Provas';
import Trabalhos from './pages/Trabalhos';
import Habitos from './pages/Habitos';
import Calendario from './pages/Calendario';

/**
 * App — Componente raiz do StudySync
 * Define o layout global (Navbar + conteúdo) e as rotas
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Área de conteúdo principal */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/provas" element={<Provas />} />
            <Route path="/trabalhos" element={<Trabalhos />} />
            <Route path="/habitos" element={<Habitos />} />
            <Route path="/calendario" element={<Calendario />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
