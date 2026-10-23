require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToMongo } = require('./db');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas principales
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'MediVoz API activa' });
});

// Montar endpoints bajo el prefijo /api
app.use('/api', apiRoutes);

// Iniciar servidor tras conectar a MongoDB
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
    console.log(` Base de datos: medivoz`);
    console.log(`\nEndpoints disponibles:`);
    console.log(`  POST /api/login`);
    console.log(`  POST /api/register`);
    console.log(`  POST /api/paciente/registrar`);
    console.log(`  GET  /api/pacientes`);
    console.log(`  GET  /api/doctores`);
    console.log(`  POST /api/citas`);
    console.log(`  GET  /api/citas`);
    console.log(`  GET  /api/test\n`);
  });
});
