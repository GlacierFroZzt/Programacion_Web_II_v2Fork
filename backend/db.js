require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

let db;
let collections = {};

const connectToMongo = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(' Conectado a MongoDB Atlas');
    db = client.db('medivoz');

    collections.users = db.collection('usuarios');
    collections.patients = db.collection('pacientes');
    collections.consultas = db.collection('consultas');
    collections.citas = db.collection('citas');

    return client;
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const getCollections = () => collections;

module.exports = {
  connectToMongo,
  getCollections
};
