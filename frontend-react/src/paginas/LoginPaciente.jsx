import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';

export default function LoginPaciente() {
  const [expediente, setExpediente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!expediente.trim() || !telefono.trim()) {
      setError('Ingresa tu número de expediente y teléfono registrado.');
      return;
    }
    setError('');
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      navigate('/historial/1');
    }, 600);
  }

  return (
    <>
      <NavTemporal />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-badge"></div>
            <h1>Portal de Pacientes</h1>
            <p>Consulta tus recetas e historial médico</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="expediente">Expediente Clínico</label>
              <input
                id="expediente"
                placeholder="ej. EXP-000001"
                value={expediente}
                onChange={e => setExpediente(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono Registrado</label>
              <input
                id="telefono"
                type="tel"
                placeholder="10 dígitos registrados"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={cargando} style={{ marginTop: '0.5rem' }}>
              {cargando ? 'Accediendo...' : 'Consultar Mi Expediente'}
            </button>

            <div className="auth-footer">
              <div>
                ¿Eres médico? <Link to="/login">Acceso médico</Link>
              </div>
              <div>
                <Link to="/paciente/agendar">Agendar una nueva cita</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
