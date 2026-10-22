import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';
import HeaderClinico from '../componentes/HeaderClinico';
import '../App.css';

export default function Receta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recetaData, setRecetaData] = useState(() => {
    const recetasGuardadas = JSON.parse(sessionStorage.getItem('mv_recetas') || '{}');
    if (id && recetasGuardadas[id]) {
      return recetasGuardadas[id];
    }
    // Si no viene con ID o no existe, usamos valores de muestra clínicos
    return {
      id: id || '00001',
      medico: 'Dr. Diego Leal',
      cedula: 'CED-8492018 · Medicina General',
      pacienteTexto: 'Carlos Gómez Ruiz · EXP-000001',
      tipoConsulta: 'Consulta general',
      categoria: 'General',
      severidad: 'Leve',
      fecha: '2026-10-21',
      hora: '10:30',
      presion: '120/80',
      frecuencia: '74',
      temperatura: '36.6',
      peso: '74.2',
      sintomas: 'Dolor de cabeza pulsátil, tensión en cuello y hombros atribuida a fatiga laboral.',
      diagnosticos: ['Cefalea tensional primaria', 'Estrés laboral moderado'],
      medicamentos: [
        { nombre: 'Paracetamol', dosis: '500 mg cada 8 horas por 3 días vía oral' },
        { nombre: 'Complejo B', dosis: '1 tableta al día por las mañanas durante 30 días' }
      ],
      alergias: ['Penicilina'],
      notas: 'Mantener hidratación adecuada (mínimo 2 litros de agua al día). Control de estrés y pausa activa durante la jornada.'
    };
  });

  const [toast, setToast] = useState({ visible: false, mensaje: '' });

  const mostrarToast = (msg) => {
    setToast({ visible: true, mensaje: msg });
    setTimeout(() => setToast({ visible: false, mensaje: '' }), 2400);
  };

  const guardarCambios = () => {
    if (id) {
      const recetasGuardadas = JSON.parse(sessionStorage.getItem('mv_recetas') || '{}');
      recetasGuardadas[id] = recetaData;
      sessionStorage.setItem('mv_recetas', JSON.stringify(recetasGuardadas));
    }
    mostrarToast('Cambios en la receta médica guardados correctamente.');
  };

  const handleTextoChange = (campo, valor) => {
    setRecetaData(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="app-container">
      <NavTemporal />
      <HeaderClinico />

      <div className="clinical-container receta-container">
        {/* Barra superior de acciones */}
        <div className="receta-toolbar no-print">
          <button
            type="button"
            className="btn-primary"
            onClick={guardarCambios}
          >
             Guardar Cambios
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)', borderColor: 'var(--primary)' }}
            onClick={() => window.print()}
          >
             Imprimir / Guardar como PDF
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/consulta/1')}
          >
            ← Volver a Consulta
          </button>
        </div>

        {/* Hoja de Receta Médica Imprimible */}
        <div className="receta-hoja">
          <div className="receta-header">
            <div>
              <div className="receta-doctor-nombre">{recetaData.medico || 'Dr. Diego Leal'}</div>
              <div className="receta-doctor-detalle">{recetaData.cedula || 'Médico Cirujano · Céd. Prof. 8492018'}</div>
            </div>
            <div className="receta-folio">
              <div><strong>Folio:</strong> MV-{String(recetaData.id).padStart(5, '0')}</div>
              <div><strong>Fecha:</strong> {recetaData.fecha} · {recetaData.hora}</div>
            </div>
          </div>

          <hr className="receta-divider" />

          <div className="receta-paciente">
            <div>
              <span className="receta-label">Paciente: </span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextoChange('pacienteTexto', e.target.innerText)}
              >
                {recetaData.pacienteTexto}
              </span>
            </div>
            <div>
              <span className="receta-label">Tipo de consulta: </span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextoChange('tipoConsulta', e.target.innerText)}
              >
                {recetaData.tipoConsulta}
              </span>
            </div>
            <div>
              <span className="receta-label">Categoría: </span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextoChange('categoria', e.target.innerText)}
              >
                {recetaData.categoria}
              </span>
            </div>
            <div>
              <span className="receta-label">Severidad: </span>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => handleTextoChange('severidad', e.target.innerText)}
              >
                {recetaData.severidad}
              </span>
            </div>
          </div>

          <div className="receta-section">
            <div className="receta-section-title">Signos Vitales</div>
            <div className="receta-vitals">
              <div><span className="receta-label">Presión:</span> {recetaData.presion || '120/80'}</div>
              <div><span className="receta-label">Frec. cardíaca:</span> {recetaData.frecuencia || '74'} bpm</div>
              <div><span className="receta-label">Temperatura:</span> {recetaData.temperatura || '36.6'} °C</div>
              <div><span className="receta-label">Peso:</span> {recetaData.peso || '74.2'} kg</div>
            </div>
          </div>

          <div className="receta-section">
            <div className="receta-section-title">Síntomas / Cuadro Clínico</div>
            <div
              className="receta-texto"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleTextoChange('sintomas', e.target.innerText)}
            >
              {recetaData.sintomas || 'Sin síntomas registrados.'}
            </div>
          </div>

          <div className="receta-section">
            <div className="receta-section-title">Diagnóstico Presuntivo / Definitivo</div>
            <div
              className="receta-texto receta-lista-texto"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleTextoChange('diagnosticosTexto', e.target.innerText)}
            >
              {Array.isArray(recetaData.diagnosticos)
                ? recetaData.diagnosticos.join('\n')
                : (recetaData.diagnosticos || 'Sin diagnósticos registrados.')}
            </div>
          </div>

          <div className="receta-section">
            <div className="receta-section-title receta-rx-titulo">℞ Indicaciones Terapéuticas y Tratamiento</div>
            <div
              className="receta-texto receta-lista-texto"
              contentEditable
              suppressContentEditableWarning
              style={{ fontWeight: 500 }}
              onBlur={(e) => handleTextoChange('medicamentosTexto', e.target.innerText)}
            >
              {Array.isArray(recetaData.medicamentos)
                ? recetaData.medicamentos.map(m => `• ${m.nombre} — ${m.dosis || ''}`).join('\n')
                : (recetaData.medicamentos || 'Sin medicamentos indicados.')}
            </div>
          </div>

          <div className="receta-section">
            <div className="receta-section-title">Alergias Documentadas</div>
            <div
              className="receta-texto"
              contentEditable
              suppressContentEditableWarning
              style={{ color: 'var(--error)', fontWeight: 600 }}
            >
              {Array.isArray(recetaData.alergias)
                ? (recetaData.alergias.join(', ') || 'Sin alergias conocidas')
                : recetaData.alergias}
            </div>
          </div>

          <div className="receta-section">
            <div className="receta-section-title">Notas Adicionales y Cuidados</div>
            <div
              className="receta-texto"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleTextoChange('notas', e.target.innerText)}
            >
              {recetaData.notas || 'Sin notas adicionales.'}
            </div>
          </div>

          <div className="receta-firma">
            <div className="receta-firma-linea"></div>
            <div>Firma del Médico Responsable</div>
          </div>

          <div className="receta-aviso no-print">
             <strong>Nota interactiva:</strong> Puedes hacer clic sobre cualquier campo para editar el texto directamente antes de imprimir o descargar en PDF.
          </div>
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
