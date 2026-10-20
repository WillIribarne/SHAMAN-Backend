import { Router } from 'express';
import {
    crearPartido,
    obtenerPartidos,
    obtenerPartidoPorId,
    modificarPartido,
    eliminarPartido,
    unirseAlPartido,
    bajarsedelPartido,
    aprobarPartido,
    rechazarPartido
} from '../controllers/partidoController.js';
import { verificarToken, verificarAdmin, verificarCreadorOAdmin, verificarLugar } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/crear', verificarToken, crearPartido);

router.get('/', obtenerPartidos);

router.get('/:id', obtenerPartidoPorId);

router.put('/:id', verificarToken, verificarCreadorOAdmin, modificarPartido);

router.delete('/:id', verificarToken, verificarCreadorOAdmin, eliminarPartido);

router.post('/:id/unirse', verificarToken, unirseAlPartido);

router.post('/:id/bajarse', verificarToken, bajarsedelPartido);

router.post('/:id/aprobar', verificarToken, verificarLugar, aprobarPartido);

router.post('/:id/rechazar', verificarToken, verificarLugar, rechazarPartido);

export default router;