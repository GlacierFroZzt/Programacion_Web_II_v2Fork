import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavTemporal from '../componentes/NavTemporal';
import { obtenerPacientes } from '../api/api';
import HeaderClinico from '../componentes/HeaderClinico';
import doctorAvatar from '../assets/doctor-avatar.jpg';
import '../App.css';

const MESES_ES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
};

function hoyISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function normalizarTexto(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatearDictado(texto) {
  return texto
    .trim()
    .replace(/\bpunto\b/gi, '.')
    .replace(/\bcoma\b/gi, ',')
    .replace(/\bnueva l[ií]nea\b/gi, '\n')
    .replace(/\bsigno de interrogaci[oó]n\b/gi, '?');
}

export default function Consulta() {
  const navigate = useNavigate();

  // Estados del formulario y listas
  const [pacientes, setPacientes] = useState(() => {
    return JSON.parse(sessionStorage.getItem('mv_pacientes') || '[]');
  });

  // Cargar lista fresca y única de pacientes desde la BD
  useEffect(() => {
    let activo = true;
    obtenerPacientes()
      .then(res => {
        if (activo && res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const map = new Map();
          res.data.forEach(p => {
            if (p.expediente && !map.has(p.expediente)) {
              map.set(p.expediente, {
                expediente: p.expediente,
                nombre: p.nombre,
                apellidoP: p.apellidoP || '',
                apellidoM: p.apellidoM || '',
                estado: p.estado || 'Activo'
              });
            }
          });
          const lista = Array.from(map.values());
          setPacientes(lista);
          sessionStorage.setItem('mv_pacientes', JSON.stringify(lista));
        }
      })
      .catch(err => console.error('Error cargando pacientes:', err));
    return () => { activo = false; };
  }, []);

  const [registros, setRegistros] = useState(() => {
    return JSON.parse(sessionStorage.getItem('mv_registros') || '[]');
  });

  const [form, setForm] = useState({
    paciente: '',
    medico: 'Dr. Diego Leal',
    fecha: hoyISO(),
    hora: '10:00',
    tipoConsulta: 'Consulta general',
    sintomas: '',
    notas: '',
    categoria: 'General',
    severidad: 'Leve',
    presion: '',
    frecuencia: '',
    temperatura: '',
    peso: '',
  });

  const [diagnosticos, setDiagnosticos] = useState(['Cefalea tensional']);
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState('');

  const [medicamentos, setMedicamentos] = useState([{ nombre: 'Paracetamol', dosis: '500mg cada 8 horas por 3 días' }]);
  const [medNombre, setMedNombre] = useState('');
  const [medDosis, setMedDosis] = useState('');

  const [alergias, setAlergias] = useState([]);
  const [nuevaAlergia, setNuevaAlergia] = useState('');
  const [sinAlergias, setSinAlergias] = useState(false);

  const [archivos, setArchivos] = useState([{ nombre: 'Biometria_Hematica.pdf', estado: 'Pendiente de subir' }]);

  // Dictado por voz
  const [campoActivo, setCampoActivo] = useState('paciente');
  const [escuchando, setEscuchando] = useState(false);
  const [liveText, setLiveText] = useState('');
  const recognitionRef = useRef(null);

  // Notificaciones y validaciones
  const [toast, setToast] = useState({ mensaje: '', tipo: '', visible: false });
  const [campoInvalido, setCampoInvalido] = useState('');

  useEffect(() => {
    sessionStorage.setItem('mv_pacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  useEffect(() => {
    sessionStorage.setItem('mv_registros', JSON.stringify(registros));
  }, [registros]);

  const mostrarToast = (mensaje, tipo = '') => {
    setToast({ mensaje, tipo, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2600);
  };

  const marcarInvalido = (campo) => {
    setCampoInvalido(campo);
    setTimeout(() => setCampoInvalido(''), 1600);
  };

  // Manejo de cambio en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'paciente' && value === '__nuevo__') {
      navigate('/paciente/nuevo');
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Diagnósticos
  const agregarDiagnostico = () => {
    if (!nuevoDiagnostico.trim()) return;
    setDiagnosticos(prev => [...prev, nuevoDiagnostico.trim()]);
    setNuevoDiagnostico('');
  };

  const quitarDiagnostico = (idx) => {
    setDiagnosticos(prev => prev.filter((_, i) => i !== idx));
  };

  // Medicamentos
  const agregarMedicamento = () => {
    if (!medNombre.trim()) {
      mostrarToast('Escribe el nombre del medicamento.', 'error');
      marcarInvalido('medNombre');
      return;
    }
    setMedicamentos(prev => [...prev, { nombre: medNombre.trim(), dosis: medDosis.trim() }]);
    setMedNombre('');
    setMedDosis('');
  };

  const quitarMedicamento = (idx) => {
    setMedicamentos(prev => prev.filter((_, i) => i !== idx));
  };

  // Alergias
  const agregarAlergia = () => {
    if (sinAlergias || !nuevaAlergia.trim()) return;
    setAlergias(prev => [...prev, nuevaAlergia.trim()]);
    setNuevaAlergia('');
  };

  const quitarAlergia = (idx) => {
    setAlergias(prev => prev.filter((_, i) => i !== idx));
  };

  // Archivos
  const adjuntarArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivos(prev => [...prev, { nombre: file.name, estado: 'Pendiente de subir' }]);
      e.target.value = '';
    }
  };

  // Control de voz
  const [micError, setMicError] = useState('');


  const detenerMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {
        // Ignorar si ya estaba detenido
      }
      recognitionRef.current = null;
    }
    setEscuchando(false);
  };

  const toggleMic = async () => {
    setMicError('');
    if (escuchando) {
      detenerMic();
      mostrarToast('Micrófono detenido.');
      return;
    }

    // Comprobar soporte de Web Speech API
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      const msg = 'Tu navegador no soporta SpeechRecognition nativo. Usa Google Chrome o Microsoft Edge.';
      setMicError(msg);
      mostrarToast(msg, 'error');
      return;
    }

    // Solicitar permiso de microfono
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Liberar el stream inmediatamente (solo queríamos asegurar el permiso del hardware)
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (permErr) {
      console.warn('Permiso de micrófono denegado:', permErr);
      const msg = 'Permiso de micrófono denegado o bloqueado en el navegador. Por favor habilítalo en la barra de direcciones.';
      setMicError(msg);
      mostrarToast(msg, 'error');
      return;
    }

    try {
      const rec = new SpeechRecognitionAPI();
      rec.lang = 'es-MX';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setEscuchando(true);
        setMicError('');
        mostrarToast('🎤 Micrófono activo. Comienza a dictar...');
      };

      rec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += formatearDictado(item[0].transcript) + ' ';
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const textoCompleto = (finalTranscript || interimTranscript).trim();
        setLiveText(textoCompleto);

        if (finalTranscript.trim()) {
          const texto = finalTranscript.trim();
          setForm(prev => {
            if (campoActivo === 'sintomas') {
              return { ...prev, sintomas: prev.sintomas ? (prev.sintomas + ' ' + texto) : texto };
            }
            if (campoActivo === 'notas') {
              return { ...prev, notas: prev.notas ? (prev.notas + ' ' + texto) : texto };
            }
            if (['presion', 'frecuencia', 'temperatura', 'peso', 'fecha', 'hora', 'tipoConsulta', 'categoria', 'severidad'].includes(campoActivo)) {
              return { ...prev, [campoActivo]: texto };
            }
            return prev;
          });

          if (campoActivo === 'diagnostico') setNuevoDiagnostico(prev => prev ? (prev + ' ' + texto) : texto);
          if (campoActivo === 'medicamento') setMedNombre(texto);
          if (campoActivo === 'dosis') setMedDosis(texto);
          if (campoActivo === 'alergia') setNuevaAlergia(texto);
        }
      };

      rec.onerror = (err) => {
        console.warn('Speech recognition error event:', err.error, err);
        setEscuchando(false);

        if (err.error === 'network') {
          const errorMsg = 'Error de red en el reconocimiento de voz. Verifica tu conexión a internet o intenta en Google Chrome.';
          setMicError(errorMsg);
          mostrarToast('Error de red en el dictado por voz.', 'error');
        } else if (err.error === 'not-allowed') {
          const errorMsg = 'Permiso para usar el micrófono bloqueado en este sitio. Revisa la configuración del navegador.';
          setMicError(errorMsg);
          mostrarToast('Acceso al micrófono denegado.', 'error');
        } else if (err.error === 'no-speech') {
          // No detectó voz en un periodo
        } else {
          setMicError('Error de reconocimiento de voz: ' + err.error);
        }
      };

      rec.onend = () => {
        setEscuchando(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Error al iniciar SpeechRecognition:', err);
      setEscuchando(false);
      setMicError('No se pudo inicializar el micrófono: ' + (err.message || 'Error desconocido'));
    }
  };

  // Guardar consulta
  const guardarRegistro = () => {
    if (!form.paciente) {
      mostrarToast('Selecciona un paciente antes de guardar.', 'error');
      marcarInvalido('paciente');
      return;
    }

    const pacienteObj = pacientes.find(p => p.expediente === form.paciente);
    const pacienteTexto = pacienteObj ? `${pacienteObj.expediente} · ${pacienteObj.nombre} ${pacienteObj.apellidoP}` : form.paciente;

    const nuevoId = registros.length ? Math.max(...registros.map(r => r.id)) + 1 : 1;

    const registroData = {
      id: nuevoId,
      ...form,
      pacienteTexto,
      diagnosticos: [...diagnosticos],
      medicamentos: [...medicamentos],
      alergias: sinAlergias ? ['Sin alergias conocidas'] : [...alergias],
      archivos: archivos.map(a => a.nombre),
      generadoEl: new Date().toISOString()
    };

    const nuevosRegistros = [registroData, ...registros];
    setRegistros(nuevosRegistros);

    // Guardar también en recetas para la visualización
    const recetasObj = JSON.parse(sessionStorage.getItem('mv_recetas') || '{}');
    recetasObj[nuevoId] = registroData;
    sessionStorage.setItem('mv_recetas', JSON.stringify(recetasObj));

    mostrarToast('Registro guardado con éxito.');
  };

  const verReceta = (id) => {
    navigate(`/receta/${id}`);
  };

  const camposSelector = [
    { id: 'paciente', label: 'Paciente' },
    { id: 'fecha', label: 'Fecha' },
    { id: 'hora', label: 'Hora' },
    { id: 'tipoConsulta', label: 'Tipo consulta' },
    { id: 'sintomas', label: 'Síntomas' },
    { id: 'notas', label: 'Notas' },
    { id: 'categoria', label: 'Categoría' },
    { id: 'severidad', label: 'Severidad' },
    { id: 'presion', label: 'Presión' },
    { id: 'frecuencia', label: 'Frec. cardiaca' },
    { id: 'temperatura', label: 'Temperatura' },
    { id: 'peso', label: 'Peso' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'medicamento', label: 'Medicamento' },
    { id: 'dosis', label: 'Dosis' },
    { id: 'alergia', label: 'Alergia' }
  ];

  return (
    <div className="app-container">
      <NavTemporal />
      <HeaderClinico />

      <div className="clinical-container">
        <div className="page-layout">
          {/* Main Area */}
          <main className="main-content">
            <div className="grid">
              {/* Tarjeta 1: Formulario clínico */}
              <div className="clinical-card">
                <div className="card-title">
                  <span className="icon"></span>
                  <span>Nuevo Registro de Consulta</span>
                </div>

                <div className="form-subtitle">Identificación de la consulta</div>

                <label htmlFor="paciente">Paciente</label>
                <select
                  id="paciente"
                  name="paciente"
                  value={form.paciente}
                  onChange={handleInputChange}
                  className={campoInvalido === 'paciente' ? 'campo-invalido' : ''}
                >
                  <option value="">Selecciona un paciente...</option>
                  {pacientes.map((p, idx) => (
                    <option key={`${p.expediente}-${idx}`} value={p.expediente}>
                      {p.expediente} · {p.nombre} {p.apellidoP}
                    </option>
                  ))}
                  <option value="__nuevo__">+ Registrar nuevo paciente...</option>
                </select>

                <label htmlFor="medico">Médico responsable</label>
                <input
                  type="text"
                  id="medico"
                  name="medico"
                  className="readonly-field"
                  value={form.medico}
                  readOnly
                />

                <div className="vitals-form-grid">
                  <div>
                    <label htmlFor="fecha">Fecha</label>
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="hora">Hora</label>
                    <input
                      type="time"
                      id="hora"
                      name="hora"
                      value={form.hora}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <label htmlFor="tipoConsulta">Tipo de consulta</label>
                <select
                  id="tipoConsulta"
                  name="tipoConsulta"
                  value={form.tipoConsulta}
                  onChange={handleInputChange}
                >
                  <option>Consulta general</option>
                  <option>Seguimiento</option>
                  <option>Urgencia</option>
                  <option>Control</option>
                </select>

                <div className="form-subtitle">Motivo de la consulta</div>

                <label htmlFor="sintomas">Síntomas (dictado o escritura)</label>
                <textarea
                  id="sintomas"
                  name="sintomas"
                  placeholder="Describe los síntomas referidos por el paciente..."
                  value={form.sintomas}
                  onChange={handleInputChange}
                  rows={3}
                />

                <label htmlFor="notas">Notas adicionales</label>
                <textarea
                  id="notas"
                  name="notas"
                  placeholder="Observaciones, antecedentes o indicaciones..."
                  value={form.notas}
                  onChange={handleInputChange}
                  rows={2}
                />

                <div className="vitals-form-grid">
                  <div>
                    <label htmlFor="categoria">Categoría</label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={form.categoria}
                      onChange={handleInputChange}
                    >
                      <option>General</option>
                      <option>Cardiología</option>
                      <option>Neurología</option>
                      <option>Pediatría</option>
                      <option>Urgencias</option>
                      <option>Traumatología</option>
                      <option>Medicina Interna</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="severidad">Severidad</label>
                    <select
                      id="severidad"
                      name="severidad"
                      value={form.severidad}
                      onChange={handleInputChange}
                    >
                      <option>Leve</option>
                      <option>Moderado</option>
                      <option>Grave</option>
                      <option>Crítico</option>
                    </select>
                  </div>
                </div>

                <div className="form-subtitle">Signos vitales</div>

                <div className="vitals-form-grid">
                  <div>
                    <label htmlFor="presion">Presión arterial</label>
                    <input
                      type="text"
                      id="presion"
                      name="presion"
                      placeholder="Ej. 120/80"
                      value={form.presion}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="frecuencia">Frecuencia cardíaca (bpm)</label>
                    <input
                      type="text"
                      id="frecuencia"
                      name="frecuencia"
                      placeholder="Ej. 78"
                      value={form.frecuencia}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="temperatura">Temperatura (°C)</label>
                    <input
                      type="text"
                      id="temperatura"
                      name="temperatura"
                      placeholder="Ej. 36.5"
                      value={form.temperatura}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="peso">Peso (kg)</label>
                    <input
                      type="text"
                      id="peso"
                      name="peso"
                      placeholder="Ej. 68.5"
                      value={form.peso}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-subtitle">Diagnóstico</div>

                <div className="tag-input-row">
                  <input
                    type="text"
                    placeholder="Escribe un diagnóstico y presiona +"
                    value={nuevoDiagnostico}
                    onChange={(e) => setNuevoDiagnostico(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarDiagnostico(); } }}
                  />
                  <button className="btn-add-tag" type="button" onClick={agregarDiagnostico}>+</button>
                </div>

                <div className="tag-list tag-preview-list">
                  {diagnosticos.map((d, i) => (
                    <span key={i} className="tag tag-accent">
                      {d}
                      <span className="tag-remove" onClick={() => quitarDiagnostico(i)}></span>
                    </span>
                  ))}
                  {!diagnosticos.length && (
                    <span className="tag" style={{ opacity: 0.6 }}>Sin diagnósticos agregados</span>
                  )}
                </div>

                <div className="form-subtitle">Tratamiento / medicamentos</div>

                <label>Medicamento</label>
                <input
                  type="text"
                  placeholder="Ej. Paracetamol"
                  value={medNombre}
                  onChange={(e) => setMedNombre(e.target.value)}
                  className={campoInvalido === 'medNombre' ? 'campo-invalido' : ''}
                />

                <label>Dosis e indicaciones</label>
                <input
                  type="text"
                  placeholder="Ej. 500mg cada 8 horas por 5 días"
                  value={medDosis}
                  onChange={(e) => setMedDosis(e.target.value)}
                />

                <div className="tag-input-row" style={{ marginTop: '0.5rem' }}>
                  <button
                    className="btn-add-tag"
                    type="button"
                    style={{ width: '100%' }}
                    onClick={agregarMedicamento}
                  >
                    + Agregar medicamento
                  </button>
                </div>

                <div className="tag-list tag-preview-list">
                  {medicamentos.map((m, i) => (
                    <span key={i} className="tag">
                      {m.nombre} {m.dosis ? `· ${m.dosis}` : ''}
                      <span className="tag-remove" onClick={() => quitarMedicamento(i)}></span>
                    </span>
                  ))}
                  {!medicamentos.length && (
                    <span className="tag" style={{ opacity: 0.6 }}>Sin medicamentos agregados</span>
                  )}
                </div>

                <div className="form-subtitle">Alergias</div>

                <div className="tag-input-row">
                  <input
                    type="text"
                    placeholder="Nueva alergia detectada..."
                    disabled={sinAlergias}
                    value={nuevaAlergia}
                    onChange={(e) => setNuevaAlergia(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarAlergia(); } }}
                  />
                  <button className="btn-add-tag" type="button" disabled={sinAlergias} onClick={agregarAlergia}>+</button>
                </div>

                <div className="tag-list tag-preview-list">
                  {sinAlergias ? (
                    <span className="tag tag-danger">Sin alergias conocidas</span>
                  ) : (
                    alergias.map((a, i) => (
                      <span key={i} className="tag tag-danger">
                        {a}
                        <span className="tag-remove" onClick={() => quitarAlergia(i)}></span>
                      </span>
                    ))
                  )}
                  {!sinAlergias && !alergias.length && (
                    <span className="tag" style={{ opacity: 0.6 }}>Sin alergias agregadas</span>
                  )}
                </div>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="sinAlergias"
                    checked={sinAlergias}
                    onChange={(e) => setSinAlergias(e.target.checked)}
                  />
                  <label htmlFor="sinAlergias">Sin alergias conocidas</label>
                </div>

                <div className="form-subtitle">Estudios y archivos</div>

                <div className="file-input-row">
                  <input type="file" id="archivoInput" onChange={adjuntarArchivo} />
                  <label htmlFor="archivoInput" className="btn-attach" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                    Adjuntar
                  </label>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  {archivos.map((f, i) => (
                    <div key={i} className="file-item">
                      <div>
                        <div className="file-name">{f.nombre}</div>
                        <div className="file-meta">{f.estado}</div>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => setArchivos(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.9rem' }}
                  onClick={guardarRegistro}
                >
                   Guardar Registro de Consulta
                </button>
              </div>

              {/* Tarjeta 2: Asistente de Voz / Dictado */}
              <div className="clinical-card">
                <div className="card-title">
                  <span className="icon"></span>
                  <span>Control de Dictado Clínico</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  Selecciona el campo de destino, presiona el micrófono y comienza a dictar. El audio se transcribirá en tiempo real.
                </p>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Campo Destino
                </div>

                <div className="field-selector">
                  {camposSelector.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`field-btn ${campoActivo === c.id ? 'active' : ''}`}
                      onClick={() => setCampoActivo(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="mic-zone">
                  {micError && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #f87171',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      color: '#991b1b',
                      fontSize: '0.82rem',
                      lineHeight: 1.4,
                      marginBottom: '1rem',
                      textAlign: 'left'
                    }}>
                      <strong>⚠️ Aviso del micrófono:</strong> {micError}
                    </div>
                  )}

                                    <button
                    type="button"
                    className={`mic-btn ${escuchando ? 'mic-active' : ''}`}
                    onClick={toggleMic}
                    title={escuchando ? 'Detener dictado' : 'Iniciar dictado por voz'}
                  >
                    {escuchando ? '⏹️' : '🎤'}
                  </button>
                  <div className="mic-status">
                    {escuchando ? 'Escuchando activamente...' : 'Listo para dictar'}
                  </div>
                  <div className="campo-target">
                    Campo seleccionado: <span>{camposSelector.find(c => c.id === campoActivo)?.label}</span>
                  </div>
                </div>

                <div className="live-transcript-box">
                  <div className="label">Transcripción en vivo</div>
                  <div className="live-transcript-text">
                    {liveText || <span style={{ color: 'var(--text-light)' }}>Aquí aparecerá lo que dictes en tiempo real...</span>}
                  </div>
                </div>

                <div className="dictation-tips">
                  <div className="dictation-tips-title"> Consejos para dictar</div>
                  <ul>
                    <li>Habla claro y a velocidad constante.</li>
                    <li>Di "punto" para signos de puntuación o "nueva línea" para saltar reglón.</li>
                    <li>Para fecha menciona "hoy" o fechas completas.</li>
                    <li>Compatible con Google Chrome y Microsoft Edge.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Tabla de Registros Guardados */}
            <div className="clinical-card records-section">
              <div className="records-header">
                <div className="card-title" style={{ margin: 0 }}>
                  <span className="icon"></span>
                  <span>Registros Clínicos Guardados</span>
                </div>
                <div className="table-badge">{registros.length}</div>
              </div>

              <div className="table-wrap">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Paciente</th>
                      <th>Tipo</th>
                      <th>Diagnóstico</th>
                      <th>Categoría</th>
                      <th>Severidad</th>
                      <th>Fecha</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map(r => (
                      <tr key={r.id}>
                        <td><strong>#{r.id}</strong></td>
                        <td>{r.pacienteTexto}</td>
                        <td>{r.tipoConsulta}</td>
                        <td>{(r.diagnosticos || []).join(', ') || '—'}</td>
                        <td>{r.categoria}</td>
                        <td>
                          <span className={`tag ${r.severidad === 'Grave' || r.severidad === 'Crítico' ? 'tag-danger' : 'tag-accent'}`}>
                            {r.severidad}
                          </span>
                        </td>
                        <td>{r.fecha || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-ver-receta"
                            onClick={() => verReceta(r.id)}
                          >
                            Ver receta
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!registros.length && (
                      <tr>
                        <td colSpan={8} className="empty-state">
                          Aún no hay registros de consulta guardados en esta sesión.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {/* Barra Lateral Profesional */}
          <aside className="sidebar">
            <div className="profile-photo-wrap">
              <img
                src={doctorAvatar}
                alt="Foto del Doctor"
                className="imagen-circular"
              />
            </div>

            <div className="sidebar-name">Dr. Diego Leal</div>
            <div className="sidebar-role">Medicina General</div>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span className="status-pill">
                <span className="status-dot"></span>
                Consultorio Activo
              </span>
            </div>

            <hr className="sidebar-divider" />

            <div className="info-row">
              <span className="info-label">Pacientes activos</span>
              <span className="info-value">{pacientes.length}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Cédula profesional</span>
              <span className="info-value">CED-8492018</span>
            </div>

            <div className="info-row">
              <span className="info-label">Turno actual</span>
              <span className="info-value">Matutino (08:00 - 15:00)</span>
            </div>

            <hr className="sidebar-divider" />

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginBottom: '0.6rem' }}
              onClick={() => navigate('/dashboard')}
            >
               Mi Perfil y Búsqueda
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
               Cerrar Sesión
            </button>
          </aside>
        </div>
      </div>

      {toast.visible && (
        <div className={`toast-notification ${toast.tipo === 'error' ? 'toast-error' : ''}`}>
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}
