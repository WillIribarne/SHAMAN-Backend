import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import usuariosRouter from './routes/usuarioRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // permite que el frontend (otro origen/puerto) consuma la API
app.use(express.json());
app.use('/api/usuarios', usuariosRouter);

// Endpoint mínimo para verificar que el servidor está levantado.
app.get('/toyvivo', (_req, res) => {
  res.json({ status: 'gracias por darme vida' });
});

async function iniciarServidor() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Falta la variable de entorno JWT_SECRET.');
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

iniciarServidor();
