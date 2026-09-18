import mongoose from 'mongoose';

/* Conexión con MongoDB (Atlas) | La cadena de conexión vive en la variable de entorno MONGO_URI (en .env) */

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGO_URI.');
  }

  mongoose.connection.on('connected', () => { /* listener para cuando se conecte */
    console.log(`[db] Conectado a MongoDB (${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (error) => { /* listener para cuando se crashea */
    console.error('[db] Error de conexión a MongoDB:', error.message);
  });

  mongoose.connection.on('disconnected', () => { /* listener para cuando se desconecta */
    console.warn('[db] Desconectado de MongoDB');
  });

  await mongoose.connect(uri);
}

export default connectDB;
