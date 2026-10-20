import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/api';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError('Completa usuario y contraseña.');
      return;
    }
    const respuesta = await login(usuario.trim(), password.trim());
    if (respuesta.success) {
      iniciarSesion(respuesta.data, 'medico');
      navigate('/dashboard');
    } else {
      setError(respuesta.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Iniciar sesión (médico)</h1>
      <input placeholder="Usuario" value={usuario} onChange={e => setUsuario(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button type="submit">Iniciar sesión</button>
      <p>o <Link to="/registro">registrarse</Link></p>
      <p><Link to="/login-paciente">Soy paciente</Link></p>
    </form>
  );
}