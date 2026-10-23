import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import usuariosRouter from './routes/usuarioRoutes.js';
import equiposRouter from './routes/equipoRoutes.js';
import partidosRouter from './routes/partidoRoutes.js';
import mensajesRouter from './routes/mensajeRoutes.js';
import { responderError } from './utils/responderError.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // permite que el frontend (otro origen/puerto) consuma la API
app.use(express.json());
app.use('/api/usuarios', usuariosRouter);
app.use('/api/equipos', equiposRouter);
app.use('/api/partidos', partidosRouter);
app.use('/api/mensajes', mensajesRouter);

// Endpoint mínimo para verificar que el servidor está levantado.
app.get('/toyvivo', (_req, res) => {
  res.json({ status: 'gracias por darme vida' });
});

// Cualquier ruta que no matcheó con ninguna de las anteriores -> 404 en JSON
// (sin esto, Express responde una página HTML "Cannot GET ...").
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador global de errores (Express lo reconoce por tener 4 parámetros). Atrapa lo que
// no atrapó ningún controller: errores de los middlewares async, JSON mal formado en el
// body, etc. Así la API siempre responde JSON con el mismo formato.
app.use((err, _req, res, _next) => {
  responderError(res, err);
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
