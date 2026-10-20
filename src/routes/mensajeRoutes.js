import { Router } from 'express';
import {
    obtenerMisMensajes,
    obtenerMensajePorId,
    marcarComoLeido,
    eliminarMensaje
} from '../controllers/mensajeController.js';
import { verificarToken, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verificarToken, obtenerMisMensajes);

router.get('/:id', verificarToken, obtenerMensajePorId);

router.patch('/:id/leer', verificarToken, marcarComoLeido);

router.delete('/:id', verificarToken, verificarAdmin, eliminarMensaje);

export default router;