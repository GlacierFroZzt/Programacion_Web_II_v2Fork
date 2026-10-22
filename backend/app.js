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

// Conectar a MongoDB
const connectToMongo = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');
    
    db = client.db('medivoz');
    usersCollection = db.collection('usuarios');
    patientsCollection = db.collection('pacientes');
    consultasCollection = db.collection('consultas');
    
    return client;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
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
    const { nombre, apellidoP, apellidoM, fechaNacimiento, sexo, telefono, correo, tipoSangre, direccion, alergias } = req.body;

    if (!nombre || !apellidoP || !fechaNacimiento || !sexo || !telefono) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    // Generar número de expediente
    const pacienteCount = await patientsCollection.countDocuments();
    const expediente = 'EXP-' + String(pacienteCount + 1).padStart(6, '0');

    const newPaciente = {
      expediente,
      nombre,
      apellidoP,
      apellidoM,
      fechaNacimiento,
      sexo,
      telefono,
      correo: correo || '',
      tipoSangre: tipoSangre || '',
      direccion: direccion || '',
      alergias: alergias ? alergias.split(',').map(a => a.trim()) : [],
      estado: 'Activo',
      fechaRegistro: new Date()
    };

    const result = await patientsCollection.insertOne(newPaciente);

    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      data: {
        id: result.insertedId,
        expediente: expediente
      }
    });

  } catch (error) {
    console.error('Error registrando paciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// =====================================
// ENDPOINT: GET /api/pacientes
// =====================================
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
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ Servidor funcionando correctamente'
  });
});

// Iniciar servidor
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Base de datos: medivoz`);
    console.log(`\nEndpoints disponibles:`);
    console.log(`  POST /api/login`);
    console.log(`  POST /api/register`);
    console.log(`  GET  /api/test\n`);
  });
});
