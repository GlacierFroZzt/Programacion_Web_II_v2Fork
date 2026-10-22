import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';

export default function AgendarCita() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    especialidad: 'Medicina General',
    fecha: '',
    hora: '09:00',
    motivo: ''
  });

  const [confirmada, setConfirmada] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.telefono || !form.fecha) {
      alert('Por favor completa tu nombre, teléfono y fecha deseada.');
      return;
    }
    setConfirmada(true);
  };

  return (
    <>
      <NavTemporal />
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '540px' }}>
          <div className="auth-header">
            <div className="auth-logo-badge"></div>
            <h1>Agendar Cita Médica</h1>
            <p>Programa tu atención presencial o remota</p>
          </div>

          {!confirmada ? (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre y apellidos"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input
                  type="tel"
                  placeholder="10 dígitos"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Especialidad / Servicio</label>
                <select
                  value={form.especialidad}
                  onChange={e => setForm({ ...form, especialidad: e.target.value })}
                >
                  <option>Medicina General</option>
                  <option>Cardiología</option>
                  <option>Neurología</option>
                  <option>Pediatría</option>
                  <option>Traumatología</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => setForm({ ...form, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <select
                    value={form.hora}
                    onChange={e => setForm({ ...form, hora: e.target.value })}
                  >
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                    <option>01:00 PM</option>
                    <option>04:00 PM</option>
                    <option>05:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Motivo de la Cita (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Describe brevemente el motivo..."
                  value={form.motivo}
                  onChange={e => setForm({ ...form, motivo: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Confirmar Solicitud de Cita
              </button>

              <div className="auth-footer">
                <Link to="/login-paciente">← Volver al Portal de Pacientes</Link>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}></div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>¡Cita Solicitada con Éxito!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Hemos registrado tu solicitud para el <strong>{form.fecha}</strong> a las <strong>{form.hora}</strong>. Te contactaremos al {form.telefono} para confirmar.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setConfirmada(false)}
              >
                Agendar otra cita
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
