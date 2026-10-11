import { Router } from 'express'; // trae solo Router de adentro de Express
import { crearEquipo, obtenerEquipos, obtenerEquipoPorId, modificarEquipo, eliminarEquipo } from '../controllers/equipoController.js';
import { verificarToken, verificarPropioUsuarioOAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/crear', verificarToken, crearEquipo);

// POST /api/equipos/:id/agregar-jugador -> agregar jugador al equipo
router.post('/:id/agregar-jugador', verificarToken, verificarPropioUsuarioOAdmin, agregarJugadorAlEquipo);

router.get('/', obtenerEquipos);

router.get('/:id', obtenerEquipoPorId);

router.put('/:id', verificarToken, verificarPropioUsuarioOAdmin, modificarEquipo);

// DELETE /api/equipos/:id -> baja lógica (solo admin)
router.delete('/:id', verificarToken, verificarPropioUsuarioOAdmin, eliminarEquipo);

// DELETE /api/equipos/:id -> quitar jugador del equipo
router.delete('/:id/quitar-jugador/:jugadorId', verificarToken, verificarPropioUsuarioOAdmin, eliminarJugadorDelEquipo);

export default router;
