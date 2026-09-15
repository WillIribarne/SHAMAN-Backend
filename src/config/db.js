import mongoose from 'mongoose';

/**
 * Conexión con MongoDB (Atlas en producción/desarrollo).
 * La cadena de conexión vive en la variable de entorno MONGO_URI (ver .env / .env.example).
 * El cluster de Atlas todavía no existe -> hasta que MONGO_URI tenga un valor real,
 * connectDB() va a fallar al conectar. Eso es esperado en este punto del proyecto.
 */
export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'Falta la variable de entorno MONGO_URI. Copiá .env.example a .env y completá la cadena de conexión de MongoDB Atlas.'
    );
  }

  mongoose.connection.on('connected', () => {
    console.log(`[db] Conectado a MongoDB (${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (error) => {
    console.error('[db] Error de conexión a MongoDB:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Desconectado de MongoDB');
  });

  await mongoose.connect(uri);

  return mongoose.connection;
}

export default connectDB;
