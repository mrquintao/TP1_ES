import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

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
            {/* Rotas futuras: */}
            <Route path="/provas" element={<PlaceholderPage titulo="Provas" />} />
            <Route path="/trabalhos" element={<PlaceholderPage titulo="Trabalhos" />} />
            <Route path="/habitos" element={<PlaceholderPage titulo="Hábitos" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Componente temporário para páginas ainda não implementadas
function PlaceholderPage({ titulo }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800">{titulo}</h1>
      <p className="text-gray-500 mt-2">Página em construção... 🚧</p>
    </div>
  );
}
