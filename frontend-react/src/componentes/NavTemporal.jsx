import { Link } from 'react-router-dom';

const rutas = [
  { to: '/login', texto: 'Login médico' },
  { to: '/login-paciente', texto: 'Login paciente' },
  { to: '/registro', texto: 'Registro médico' },
  { to: '/registro-paciente', texto: 'Registro paciente' },
  { to: '/dashboard', texto: 'Dashboard' },
  { to: '/paciente/nuevo', texto: 'Registrar paciente' },
  { to: '/paciente/agendar', texto: 'Agendar cita' },
  { to: '/consulta/1', texto: 'Página Consulta' },
  { to: '/historial/1', texto: 'Historial Clínico' },
  { to: '/receta/1', texto: 'Receta Médica' },
];

export default function NavTemporal() {
  return (
    <nav className="temp-nav no-print">
      <strong>⚡ Atajos:</strong>
      {rutas.map(r => (
        <span key={r.to}>
          <Link to={r.to}>{r.texto}</Link>
        </span>
      ))}
    </nav>
  );
}
