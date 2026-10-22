import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';
import HeaderClinico from '../componentes/HeaderClinico';
import '../App.css';

export default function Historial() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState({
    expediente: id ? `EXP-${String(id).padStart(6, '0')}` : 'EXP-000001',
    nombre: 'Carlos Gómez Ruiz',
    rol: 'Paciente',
    estado: 'Activo',
    fechaNacimiento: '14 / 05 / 1988',
    edad: '36 años',
    sexo: 'Masculino',
    telefono: '+52 81 1234 5678',
    correo: 'carlos.gomez@email.com',
    direccion: 'Av. Constitución 405, Monterrey, N.L.',
    tipoSangre: 'O+',
    contactoEmergencia: 'Laura Ruiz (Madre) - +52 81 8765 4321',
  });

  const [toast, setToast] = useState({ visible: false, mensaje: '' });

  const mostrarToast = (msg) => {
    setToast({ visible: true, mensaje: msg });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 2400);
  };

  return (
    <div className="app-container">
      <NavTemporal />
      <HeaderClinico />

      <div className="clinical-container">
        <Link to="/dashboard" className="back-link">
          ← Regresar al Directorio de Pacientes
        </Link>

        <div className="page-layout">
          {/* Sidebar Datos del Paciente */}
          <aside className="sidebar">
            <div className="profile-photo-wrap">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
                alt="Foto del Paciente"
                className="imagen-circular"
              />
            </div>

            <div className="sidebar-name">{paciente.nombre}</div>
            <div className="sidebar-role">Paciente Registrado</div>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span className="status-pill">
                <span className="status-dot"></span>
                {paciente.estado}
              </span>
            </div>

            <hr className="sidebar-divider" />

            <div className="info-row">
              <span className="info-label">Expediente Clínico</span>
              <span className="info-value">{paciente.expediente}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Fecha de nacimiento</span>
              <span className="info-value">{paciente.fechaNacimiento}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Edad / Sexo</span>
              <span className="info-value">{paciente.edad} · {paciente.sexo}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Teléfono de contacto</span>
              <span className="info-value">{paciente.telefono}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Correo electrónico</span>
              <span className="info-value">{paciente.correo}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Dirección</span>
              <span className="info-value">{paciente.direccion}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Tipo de sangre</span>
              <span className="info-value">{paciente.tipoSangre}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Contacto de emergencia</span>
              <span className="info-value">{paciente.contactoEmergencia}</span>
            </div>

            <hr className="sidebar-divider" />

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginBottom: '0.6rem' }}
              onClick={() => navigate('/consulta/1')}
            >
               Iniciar Nueva Consulta
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => mostrarToast('Modo edición en desarrollo')}
            >
               Editar Expediente
            </button>
          </aside>

          {/* Contenido Principal: Historial Clínico */}
          <main className="main-content">
            {/* Signos Vitales Última Consulta */}
            <div className="clinical-card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title">
                <span className="icon"></span>
                <span>Signos Vitales (Última Consulta Registrada)</span>
              </div>

              <div className="vitals-grid">
                <div className="vital-box">
                  <div className="vital-value">120/80</div>
                  <div className="vital-label">Presión arterial</div>
                </div>
                <div className="vital-box">
                  <div className="vital-value">72</div>
                  <div className="vital-label">Frec. cardíaca (bpm)</div>
                </div>
                <div className="vital-box">
                  <div className="vital-value">36.6 °C</div>
                  <div className="vital-label">Temperatura</div>
                </div>
                <div className="vital-box">
                  <div className="vital-value">74.2 kg</div>
                  <div className="vital-label">Peso corporal</div>
                </div>
              </div>
            </div>

            {/* Línea de Tiempo y Diagnósticos */}
            <div className="history-grid">
              {/* Línea de tiempo de consultas */}
              <div className="clinical-card">
                <div className="card-title">
                  <span className="icon"></span>
                  <span>Historial Cronológico de Consultas</span>
                </div>

                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-header">
                      <span className="timeline-date">21 / 10 / 2026 · 10:30 AM</span>
                      <span className="timeline-type">Consulta General</span>
                    </div>
                    <div className="timeline-title">Control de presión y cefalea intermitente</div>
                    <div className="timeline-text">
                      Paciente acude por dolor de cabeza pulsátil de 3 días de evolución, relacionado con estrés laboral. Sin datos de alarma neurológica.
                    </div>
                    <div className="timeline-doctor">Atendido por: Dr. Diego Leal (Medicina General)</div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-header">
                      <span className="timeline-date">15 / 08 / 2026 · 09:15 AM</span>
                      <span className="timeline-type">Seguimiento</span>
                    </div>
                    <div className="timeline-title">Revisión de estudios de laboratorio</div>
                    <div className="timeline-text">
                      Perfil lipídico normal. Se ajusta plan nutricional y actividad física aeróbica moderada.
                    </div>
                    <div className="timeline-doctor">Atendido por: Dr. Diego Leal (Medicina General)</div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-header">
                      <span className="timeline-date">02 / 03 / 2026 · 04:20 PM</span>
                      <span className="timeline-type">Urgencia Menor</span>
                    </div>
                    <div className="timeline-title">Cuadro gastrointestinal agudo</div>
                    <div className="timeline-text">
                      Gastroenteritis bacteriana leve. Tratamiento ambulatorio con hidratación oral y probióticos.
                    </div>
                    <div className="timeline-doctor">Atendido por: Dra. Marcela Santos</div>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Diagnósticos, Medicamentos y Estudios */}
              <div className="stack">
                <div className="clinical-card">
                  <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>
                    <span className="icon"></span>
                    <span>Diagnósticos Activos</span>
                  </div>
                  <div className="tag-list">
                    <span className="tag tag-accent">Hipertensión arterial grado 1</span>
                    <span className="tag tag-accent">Cefalea tensional</span>
                  </div>
                </div>

                <div className="clinical-card">
                  <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>
                    <span className="icon"></span>
                    <span>Medicamentos Vigentes</span>
                  </div>
                  <div className="tag-list">
                    <span className="tag">Losartán 50mg — 1 cada 24h</span>
                    <span className="tag">Paracetamol 500mg — PRN dolor</span>
                  </div>
                </div>

                <div className="clinical-card">
                  <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>
                    <span className="icon"></span>
                    <span>Alergias Documentadas</span>
                  </div>
                  <div className="tag-list">
                    <span className="tag tag-danger">Penicilina</span>
                    <span className="tag tag-danger">Sulfa</span>
                  </div>
                </div>

                <div className="clinical-card">
                  <div className="card-title" style={{ fontSize: '1.05rem', marginBottom: '0.8rem' }}>
                    <span className="icon"></span>
                    <span>Estudios y Archivos</span>
                  </div>

                  <div className="file-item">
                    <div>
                      <div className="file-name">Biometria_Completa_2026.pdf</div>
                      <div className="file-meta">Subido el 15/08/2026</div>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => mostrarToast('Visualizando documento...')}
                    >
                      Ver
                    </button>
                  </div>

                  <div className="file-item">
                    <div>
                      <div className="file-name">Electrocardiograma_Basal.jpg</div>
                      <div className="file-meta">Subido el 02/03/2026</div>
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => mostrarToast('Visualizando documento...')}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {toast.visible && (
        <div className="toast-notification">
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}
