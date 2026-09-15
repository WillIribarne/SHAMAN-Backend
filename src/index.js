import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Endpoint mínimo para verificar que el servidor (y, más adelante, la conexión a la DB)
// está levantado. Se puede borrar o mover a routes/ cuando arranquen las rutas reales.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function iniciarServidor() {
  try {
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
