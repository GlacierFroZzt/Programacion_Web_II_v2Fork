import { useNavigate } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';
import HeaderClinico from '../componentes/HeaderClinico';
import '../App.css';

// Citas de ejemplo del día (luego vendrán de MongoDB)
const citasHoy = [
  { id: 1, hora: '09:00', paciente: 'Carlos Gómez Ruiz', expediente: 'EXP-000001', motivo: 'Dolor de cabeza desde hace 3 días' },
  { id: 2, hora: '10:30', paciente: 'María López Pérez', expediente: 'EXP-000002', motivo: 'Control de presión arterial' },
  { id: 3, hora: '12:00', paciente: 'Roberto Fernández Morales', expediente: 'EXP-000003', motivo: 'Revisión de análisis' },
];

// Genera bloques de 30 minutos de 08:00 a 15:00 (turno matutino)
function generarBloques() {
  const bloques = [];
  for (let h = 8; h < 15; h++) {
    for (const m of ['00', '30']) {
      bloques.push(`${String(h).padStart(2, '0')}:${m}`);
    }
  }
  return bloques;
}

export default function Dashboard1() {
  const navigate = useNavigate();
  const bloques = generarBloques();

  const irAConsulta = (cita) => {
    navigate(`/consulta/${cita.id}`, { state: { cita } });
  };

  return (
    <div className="app-container">
      <NavTemporal />
      <HeaderClinico />

      <div className="clinical-container">
        <div className="clinical-card">
          <div className="card-title">
            <span className="icon"></span>
            <span>Agenda de hoy</span>
          </div>

          <p>Selecciona una cita para abrir la consulta.</p>

          <div className="table-wrap">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Paciente</th>
                  <th>Motivo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {bloques.map(hora => {
                  const cita = citasHoy.find(c => c.hora === hora);
                  return (
                    <tr key={hora}>
                      <td><strong>{hora}</strong></td>
                      <td>{cita ? cita.paciente : <span style={{ opacity: 0.5 }}>Disponible</span>}</td>
                      <td>{cita ? cita.motivo : '—'}</td>
                      <td>
                        {cita && (
                          <button type="button" className="btn-primary" onClick={() => irAConsulta(cita)}>
                            Ir a consulta
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
