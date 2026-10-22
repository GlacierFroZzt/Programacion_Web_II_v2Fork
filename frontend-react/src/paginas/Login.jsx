import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import NavTemporal from '../componentes/NavTemporal';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError('Por favor, completa usuario y contraseña.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const respuesta = await login(usuario.trim(), password.trim());
      if (respuesta.success) {
        iniciarSesion(respuesta.data, 'medico');
        navigate('/dashboard');
      } else {
        setError(respuesta.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <NavTemporal />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-badge"></div>
            <h1>MediVoz</h1>
            <p>Acceso al Portal Médico</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="usuario">Usuario / Correo</label>
              <input
                id="usuario"
                placeholder="ej. dr.garcia@medivoz.com"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={cargando} style={{ marginTop: '0.5rem' }}>
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

            <div className="auth-footer">
              <div>
                ¿No tienes cuenta? <Link to="/registro">Registrarse como médico</Link>
              </div>
              <div>
                <Link to="/login-paciente">Ingresar como Paciente →</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
