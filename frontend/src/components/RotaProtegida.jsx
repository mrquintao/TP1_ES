import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RotaProtegida — envolve as páginas que exigem login. Sem sessão, manda pro /login.
 * Enquanto a sessão salva ainda está sendo restaurada (carregando), espera —
 * senão mandaria pro /login por um instante mesmo com um token válido salvo.
 */
export default function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
