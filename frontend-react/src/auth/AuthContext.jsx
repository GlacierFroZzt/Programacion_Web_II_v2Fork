import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuarioActual') || 'null')
  );

  function iniciarSesion(datos, rol) {
    const sesion = { ...datos, rol };
    localStorage.setItem('usuarioActual', JSON.stringify(sesion));
    setUsuario(sesion);
  }

  function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);