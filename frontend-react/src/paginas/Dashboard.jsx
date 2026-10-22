import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';
import HeaderClinico from '../componentes/HeaderClinico';
import doctorAvatar from '../assets/doctor-avatar.jpg';
import '../App.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState(() => {
    return JSON.parse(sessionStorage.getItem('mv_pacientes') || 'null') || [
      {
        expediente: 'EXP-000001',
        nombre: 'Carlos Gómez Ruiz',
        edad: '36',
        telefono: '+52 81 1234 5678',
        estado: 'Activo',
        ultimaVisita: '2026-10-21',
        sexo: 'Masculino'
      },
      {
        expediente: 'EXP-000002',
        nombre: 'María López Pérez',
        edad: '29',
        telefono: '+52 81 8765 4321',
        estado: 'En tratamiento',
        ultimaVisita: '2026-10-18',
        sexo: 'Femenino'
      },
      {
        expediente: 'EXP-000003',
        nombre: 'Roberto Fernández Morales',
        edad: '52',
        telefono: '+52 81 4567 8901',
        estado: 'Activo',
        ultimaVisita: '2026-10-15',
        sexo: 'Masculino'
      },
      {
        expediente: 'EXP-000004',
        nombre: 'Lucía Méndez Castro',
        edad: '14',
        telefono: '+52 81 9876 5432',
        estado: 'Inactivo',
        ultimaVisita: '2026-08-10',
        sexo: 'Femenino'
      }
    ];
  });

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroSexo, setFiltroSexo] = useState('Todos');
  const [filtroEdad, setFiltroEdad] = useState('Todos');
  const [orden, setOrden] = useState('reciente');

  // Filtrado reactivo de pacientes
  const pacientesFiltrados = pacientes.filter(p => {
    const matchTexto =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.expediente.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.telefono.includes(busqueda);

    const matchEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    const matchSexo = filtroSexo === 'Todos' || p.sexo === filtroSexo;

    let matchEdad = true;
    const edadNum = parseInt(p.edad, 10);
    if (filtroEdad === '0-12') matchEdad = edadNum <= 12;
    else if (filtroEdad === '13-17') matchEdad = edadNum >= 13 && edadNum <= 17;
    else if (filtroEdad === '18-40') matchEdad = edadNum >= 18 && edadNum <= 40;
    else if (filtroEdad === '41-65') matchEdad = edadNum >= 41 && edadNum <= 65;
    else if (filtroEdad === '65+') matchEdad = edadNum > 65;

    return matchTexto && matchEstado && matchSexo && matchEdad;
  }).sort((a, b) => {
    if (orden === 'az') return a.nombre.localeCompare(b.nombre);
    if (orden === 'za') return b.nombre.localeCompare(a.nombre);
    if (orden === 'antiguo') return (a.ultimaVisita || '').localeCompare(b.ultimaVisita || '');
    return (b.ultimaVisita || '').localeCompare(a.ultimaVisita || '');
  });

  return (
    <div className="app-container">
      <NavTemporal />
      <HeaderClinico />

      <div className="clinical-container">
        <Link to="/consulta/1" className="back-link">
          ← Ir a la Consola de Dictado y Registro de Consulta
        </Link>

        <div className="page-layout">
          {/* Sidebar: Perfil del Doctor */}
          <aside className="sidebar">
            <div className="profile-photo-wrap">
              <img
                src={doctorAvatar}
                alt="Foto del Doctor"
                className="imagen-circular"
              />
            </div>

            <div className="sidebar-name">Dr. Diego Leal</div>
            <div className="sidebar-role">Medicina General · Hospital San Lucas</div>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span className="status-pill">
                <span className="status-dot"></span>
                Médico Activo
              </span>
            </div>

            <hr className="sidebar-divider" />

            <div className="info-row">
              <span className="info-label">Cédula Profesional</span>
              <span className="info-value">CED-8492018</span>
            </div>

            <div className="info-row">
              <span className="info-label">Correo Institucional</span>
              <span className="info-value">diego.leal@medivoz.com</span>
            </div>

            <div className="info-row">
              <span className="info-label">Teléfono de consultorio</span>
              <span className="info-value">+52 (81) 8345-6789</span>
            </div>

            <div className="info-row">
              <span className="info-label">Consultorio / Turno</span>
              <span className="info-value">Cons. 402B · Matutino</span>
            </div>

            <hr className="sidebar-divider" />

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginBottom: '0.6rem' }}
              onClick={() => navigate('/consulta/1')}
            >
              🩺 Abrir Consulta con Voz
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => navigate('/paciente/nuevo')}
            >
              ➕ Registrar Nuevo Paciente
            </button>
          </aside>

          {/* Main: Búsqueda y Expedientes */}
          <main className="main-content">
            {/* Buscador y Filtros */}
            <div className="clinical-card search-card">
              <div className="card-title">
                <span className="icon">🔍</span>
                <span>Directorio y Búsqueda de Pacientes</span>
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Buscar paciente por nombre, número de expediente o teléfono..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="filters-row">
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="Todos">Filtrar por estado (Todos)</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="En tratamiento">En tratamiento</option>
                </select>

                <select value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value)}>
                  <option value="Todos">Filtrar por sexo (Todos)</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>

                <select value={filtroEdad} onChange={(e) => setFiltroEdad(e.target.value)}>
                  <option value="Todos">Filtrar por edad (Todos)</option>
                  <option value="0-12">0 - 12 años</option>
                  <option value="13-17">13 - 17 años</option>
                  <option value="18-40">18 - 40 años</option>
                  <option value="41-65">41 - 65 años</option>
                  <option value="65+">65+ años</option>
                </select>

                <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                  <option value="reciente">Más reciente</option>
                  <option value="antiguo">Más antiguo</option>
                  <option value="az">Nombre A-Z</option>
                  <option value="za">Nombre Z-A</option>
                </select>
              </div>
            </div>

            {/* Resultados */}
            <div className="clinical-card records-section" style={{ marginTop: 0 }}>
              <div className="records-header">
                <div className="card-title" style={{ margin: 0 }}>
                  <span className="icon">👥</span>
                  <span>Pacientes Encontrados</span>
                </div>
                <div className="table-badge">{pacientesFiltrados.length}</div>
              </div>

              <div className="table-wrap">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Expediente</th>
                      <th>Nombre completo</th>
                      <th>Edad</th>
                      <th>Teléfono</th>
                      <th>Estado</th>
                      <th>Última visita</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientesFiltrados.map((p, idx) => (
                      <tr key={p.expediente || idx}>
                        <td><strong>{p.expediente}</strong></td>
                        <td>{p.nombre}</td>
                        <td>{p.edad} años</td>
                        <td>{p.telefono}</td>
                        <td>
                          <span className={`tag ${p.estado === 'Activo' ? 'tag-accent' : p.estado === 'En tratamiento' ? '' : 'tag-danger'}`}>
                            {p.estado}
                          </span>
                        </td>
                        <td>{p.ultimaVisita || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-ver-receta"
                            onClick={() => navigate(`/historial/${idx + 1}`)}
                          >
                            Ver Historial
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!pacientesFiltrados.length && (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          No se encontraron pacientes que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
