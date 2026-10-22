require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
// Middleware
app.use(cors());
app.use(express.json());
// Variables para guardar las colecciones
let db;
let usersCollection;
let patientsCollection;
let consultasCollection;
let citasCollection;
// Conectar a MongoDB
const connectToMongo = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(' Conectado a MongoDB Atlas');
    db = client.db('medivoz');
    usersCollection = db.collection('usuarios');
    patientsCollection = db.collection('pacientes');
    consultasCollection = db.collection('consultas');
    citasCollection = db.collection('citas');
    return client;
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
};
// =====================================
// ENDPOINT: POST /api/login
// =====================================
app.post('/api/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;
    // Validar que lleguen los datos
    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos'
      });
    }
    // Buscar el usuario en la base de datos
    const user = await usersCollection.findOne({ usuario: usuario });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    // Verificar contraseña (en producción, deberías usar bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }
    // Login exitoso
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        id: user._id,
        nombre: user.nombre,
        usuario: user.usuario,
        especialidad: user.especialidad,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});
// =====================================
// ENDPOINT: POST /api/register (Registro de Médicos/Doctores)
// =====================================
app.post('/api/register', async (req, res) => {
  try {
    const {
      nombre,
      apellidoP,
      apellidoM,
      especialidad,
      telefono,
      fechaNacimiento,
      correo,
      email,
      cedula,
      usuario,
      password
    } = req.body;
    const emailFinal = (correo || email || '').trim();
    const nombreFinal = (nombre || '').trim();
    const usuarioFinal = (usuario || emailFinal).trim();
    // Validar datos mínimos requeridos
    if (!nombreFinal || !password) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (nombre y contraseña son obligatorios)'
      });
    }
    // Verificar si el usuario o correo ya existe
    if (usuarioFinal) {
      const userExists = await usersCollection.findOne({
        $or: [{ usuario: usuarioFinal }, { email: emailFinal }]
      });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'El usuario o correo electrónico ya se encuentra registrado'
        });
      }
    }
    // Crear nuevo usuario (médico)
    const newUser = {
      nombre: nombreFinal,
      apellidoP: (apellidoP || '').trim(),
      apellidoM: (apellidoM || '').trim(),
      especialidad: (especialidad || '').trim(),
      telefono: (telefono || '').trim(),
      fechaNacimiento: fechaNacimiento || '',
      email: emailFinal,
      correo: emailFinal,
      cedula: cedula || '',
      usuario: usuarioFinal,
      password, // En producción se recomienda bcrypt
      rol: 'medico',
      fechaRegistro: new Date()
    };
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({
      success: true,
      message: 'Doctor registrado exitosamente',
      data: {
        id: result.insertedId,
        usuario: usuarioFinal,
        nombre: `${nombreFinal} ${(apellidoP || '').trim()}`.trim(),
        email: emailFinal,
        especialidad: newUser.especialidad
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});
// =====================================
// ENDPOINT: POST /api/paciente/registrar
// =====================================
app.post('/api/paciente/registrar', async (req, res) => {
  try {
    const {
      nombre,
      apellidoP,
      apellidoM,
      fechaNacimiento,
      sexo,
      telefono,
      correo,
      tipoSangre,
      direccion,
      alergias,
      contactoNombre,
      contactoParentesco,
      contactoTelefono
    } = req.body;
    const nombreLimpio = (nombre || '').trim();
    const apellidoPLimpio = (apellidoP || '').trim();
    const telefonoLimpio = (telefono || '').trim();
    if (!nombreLimpio || !apellidoPLimpio || !fechaNacimiento || !sexo || !telefonoLimpio) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos (nombre, apellidoP, fechaNacimiento, sexo y teléfono son obligatorios)'
      });
    }
    // Validar formato de teléfono mínimo
    const numDigits = telefonoLimpio.replace(/\D/g, '');
    if (numDigits.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'El teléfono debe contener al menos 10 dígitos'
      });
    }
    // Generar número de expediente secuencial asegurando unicidad
    const ultimoPaciente = await patientsCollection.find({}).sort({ _id: -1 }).limit(1).toArray();
    let siguienteNum = 1;
    if (ultimoPaciente.length > 0 && ultimoPaciente[0].expediente) {
      const match = ultimoPaciente[0].expediente.match(/\d+/);
      if (match) {
        siguienteNum = parseInt(match[0], 10) + 1;
      }
    }
    const expediente = 'EXP-' + String(siguienteNum).padStart(6, '0');
    // Procesar alergias (acepta array o string separado por comas)
    let listaAlergias = [];
    if (Array.isArray(alergias)) {
      listaAlergias = alergias;
    } else if (typeof alergias === 'string' && alergias.trim()) {
      listaAlergias = alergias.split(',').map(a => a.trim()).filter(Boolean);
    }
    const newPaciente = {
      expediente,
      nombre: nombreLimpio,
      apellidoP: apellidoPLimpio,
      apellidoM: (apellidoM || '').trim(),
      nombreCompleto: [nombreLimpio, apellidoPLimpio, (apellidoM || '')].filter(Boolean).join(' '),
      fechaNacimiento,
      sexo,
      telefono: telefonoLimpio,
      correo: (correo || '').trim(),
      tipoSangre: (tipoSangre || '').trim(),
      direccion: (direccion || '').trim(),
      alergias: listaAlergias,
      contactoEmergencia: {
        nombre: (contactoNombre || '').trim(),
        parentesco: (contactoParentesco || '').trim(),
        telefono: (contactoTelefono || '').trim()
      },
      estado: 'Activo',
      fechaRegistro: new Date()
    };
    const result = await patientsCollection.insertOne(newPaciente);
    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente en MongoDB',
      data: {
        id: result.insertedId,
        expediente: expediente,
        paciente: newPaciente
      }
    });
  } catch (error) {
    console.error('Error registrando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar paciente'
    });
  }
});
// =====================================
// ENDPOINT: GET /api/pacientes
// =====================================
app.get('/api/doctores', async (req, res) => {
  try {
    const doctores = await usersCollection.find({}).toArray();
    const data = doctores.map(d => {
      const nombreCompleto = [d.nombre, d.apellidoP, d.apellidoM].filter(Boolean).join(' ').trim() || d.nombre || 'Doctor';
      return {
        id: d._id,
        nombre: nombreCompleto,
        especialidad: d.especialidad || 'Medicina General',
        email: d.email || d.correo || '',
        cedula: d.cedula || ''
      };
    });
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error obteniendo doctores:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/api/pacientes', async (req, res) => {
  try {
    const pacientes = await patientsCollection.find({}).toArray();
    res.json({
      success: true,
      data: pacientes
    });
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});
// =====================================
// ENDPOINT: POST /api/consulta/guardar
// =====================================
app.post('/api/consulta/guardar', async (req, res) => {
  try {
    const { pacienteId, medico, tipoConsulta, categoria, severidad, presion, frecuencia, temperatura, peso, sintomas, diagnosticos, medicamentos, alergias, notas } = req.body;
    if (!pacienteId || !medico) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }
    const newConsulta = {
      pacienteId,
      medico,
      tipoConsulta: tipoConsulta || '',
      categoria: categoria || '',
      severidad: severidad || '',
      presion: presion || '',
      frecuencia: frecuencia || '',
      temperatura: temperatura || '',
      peso: peso || '',
      sintomas: sintomas || '',
      diagnosticos: Array.isArray(diagnosticos) ? diagnosticos : [],
      medicamentos: Array.isArray(medicamentos) ? medicamentos : [],
      alergias: Array.isArray(alergias) ? alergias : [],
      notas: notas || '',
      fecha: new Date(),
      estado: 'Completada'
    };
    const result = await consultasCollection.insertOne(newConsulta);
    res.status(201).json({
      success: true,
      message: 'Consulta guardada exitosamente',
      data: {
        id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error guardando consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});
// =====================================
// ENDPOINT: GET /api/consultas/:pacienteId
// =====================================
app.get('/api/consultas/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { ObjectId } = require('mongodb');
    const consultas = await consultasCollection
      .find({ pacienteId: new ObjectId(pacienteId) })
      .sort({ fecha: -1 })
      .toArray();
    res.json({
      success: true,
      data: consultas
    });
  } catch (error) {
    console.error('Error obteniendo consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});
// =====================================
// ENDPOINT: GET /api/test
// (para verificar que el servidor funciona)
// =====================================

// =====================================
// ENDPOINTS: CITAS MÉDICAS
// =====================================

// Helper para convertir hora HH:mm a minutos desde las 00:00
function horaAMinutos(horaStr) {
  if (!horaStr) return 0;
  const match = horaStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let horas = parseInt(match[1], 10);
  const minutos = parseInt(match[2], 10);
  const meridiano = match[3] ? match[3].toUpperCase() : null;
  if (meridiano === 'PM' && horas < 12) horas += 12;
  if (meridiano === 'AM' && horas === 12) horas = 0;
  return horas * 60 + minutos;
}

// GET /api/citas - Listar citas (opcionalmente por paciente o fecha)
app.get('/api/citas', async (req, res) => {
  try {
    const { pacienteExpediente, fecha, doctor } = req.query;
    const filtro = { estado: { $ne: 'Cancelada' } };
    if (pacienteExpediente) filtro.pacienteExpediente = pacienteExpediente;
    if (fecha) filtro.fecha = fecha;
    if (doctor) filtro.doctor = doctor;

    const citas = await citasCollection.find(filtro).sort({ fecha: 1, hora: 1 }).toArray();
    res.json({
      success: true,
      data: citas
    });
  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener citas' });
  }
});

// POST /api/citas - Crear cita verificando traslapes/empalmes
app.post('/api/citas', async (req, res) => {
  try {
    const {
      pacienteExpediente,
      nombre,
      telefono,
      correo,
      especialidad,
      doctor,
      fecha,
      hora,
      motivo,
      duracionMinutos = 30
    } = req.body;

    if (!nombre || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, fecha y hora son obligatorios para agendar la cita'
      });
    }

    const duracion = parseInt(duracionMinutos, 10) || 30;
    const inicioNuevo = horaAMinutos(hora);
    const finNuevo = inicioNuevo + duracion;

    // Buscar citas activas en la misma fecha
    // Las citas no deben empalmarse ni para el mismo doctor ni para el mismo paciente
    const filtroSolapamiento = {
      fecha: fecha,
      estado: { $ne: 'Cancelada' }
    };

    const condiciones = [];
    if (doctor) {
      condiciones.push({ doctor: doctor });
    }
    if (pacienteExpediente) {
      condiciones.push({ pacienteExpediente: pacienteExpediente });
    }
    if (telefono) {
      condiciones.push({ telefono: telefono.trim() });
    }

    if (condiciones.length > 0) {
      filtroSolapamiento.$or = condiciones;
    }

    const citasMismoDia = await citasCollection.find(filtroSolapamiento).toArray();

    // Validar si existe empalme de horarios: [inicioNuevo, finNuevo) solapa con [inicioExistente, finExistente)
    // Formula de traslape: max(inicioNuevo, inicioExistente) < min(finNuevo, finExistente)
    for (const citaExistente of citasMismoDia) {
      const duracionExistente = citaExistente.duracionMinutos || 30;
      const inicioExistente = horaAMinutos(citaExistente.hora);
      const finExistente = inicioExistente + duracionExistente;

      const hayEmpalme = Math.max(inicioNuevo, inicioExistente) < Math.min(finNuevo, finExistente);
      if (hayEmpalme) {
        const conflictoCon = (citaExistente.pacienteExpediente && citaExistente.pacienteExpediente === pacienteExpediente)
          ? 'El paciente ya cuenta con una cita en ese horario (' + citaExistente.hora + ')'
          : 'Horario no disponible: se empalma con otra cita agendada a las ' + citaExistente.hora + ' (' + (citaExistente.especialidad || 'Cita médica') + ')';
        
        return res.status(409).json({
          success: false,
          empalme: true,
          message: conflictoCon,
          citaConflicto: {
            hora: citaExistente.hora,
            duracion: duracionExistente,
            doctor: citaExistente.doctor,
            especialidad: citaExistente.especialidad
          }
        });
      }
    }

    const nuevaCita = {
      pacienteExpediente: pacienteExpediente || '',
      nombre: (nombre || '').trim(),
      telefono: (telefono || '').trim(),
      correo: (correo || '').trim(),
      especialidad: especialidad || 'Medicina General',
      doctor: doctor || 'Dr. Diego Leal',
      fecha,
      hora,
      duracionMinutos: duracion,
      motivo: (motivo || '').trim(),
      estado: 'Confirmada',
      fechaCreacion: new Date()
    };

    const result = await citasCollection.insertOne(nuevaCita);

    res.status(201).json({
      success: true,
      message: 'Cita agendada exitosamente sin empalmes',
      data: {
        id: result.insertedId,
        cita: nuevaCita
      }
    });
  } catch (error) {
    console.error('Error agendando cita:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al agendar cita'
    });
  }
});

// PATCH /api/citas/:id/cancelar
app.patch('/api/citas/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    await citasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: 'Cancelada', fechaCancelacion: new Date() } }
    );
    res.json({ success: true, message: 'Cita cancelada con éxito' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelando cita' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'MediVoz API activa' });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: ' Servidor funcionando correctamente'
  });
});
// Iniciar servidor
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
    console.log(` Base de datos: medivoz`);
    console.log(`\nEndpoints disponibles:`);
    console.log(`  POST /api/login`);
    console.log(`  POST /api/register`);
    console.log(`  GET  /api/test\n`);
  });
});
