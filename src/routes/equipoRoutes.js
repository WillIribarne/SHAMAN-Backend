import { Router } from 'express'; // trae solo Router de adentro de Express
import { crearEquipo, obtenerEquipos, obtenerEquipoPorId, modificarEquipo, eliminarEquipo, agregarJugadorAlEquipo, eliminarJugadorDelEquipo } from '../controllers/equipoController.js';
import { verificarToken, verificarPropioUsuarioOAdmin, verificarCapitanOAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/crear', verificarToken, crearEquipo);

router.post('/:id/agregar-jugador', verificarToken, verificarCapitanOAdmin, agregarJugadorAlEquipo);

router.get('/', obtenerEquipos);

router.get('/:id', obtenerEquipoPorId);

router.put('/:id', verificarToken, verificarCapitanOAdmin, modificarEquipo);

router.delete('/:id', verificarToken, verificarCapitanOAdmin, eliminarEquipo);

router.delete('/:id/quitar-jugador/:jugadorId', verificarToken, verificarCapitanOAdmin, eliminarJugadorDelEquipo);

export default router;
