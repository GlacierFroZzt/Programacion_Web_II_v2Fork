import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RutaProtegida({ children, rolPermitido }) {
  const { usuario } = useAuth();

  if (!usuario) return <Navigate to="/login" replace />;
  if (rolPermitido && usuario.rol !== rolPermitido) return <Navigate to="/login" replace />;

  return children;
}