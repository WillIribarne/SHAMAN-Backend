import { Router } from 'express'; // trae solo Router de adentro de Express
import { registrarUsuario, loginUsuario, obtenerUsuarios, obtenerUsuarioPorId, modificarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';
import { verificarToken, verificarAdmin, verificarPropioUsuarioOAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/registro', registrarUsuario);

router.post('/login', loginUsuario);

router.get('/', verificarToken, verificarAdmin, obtenerUsuarios);

router.get('/:id', verificarToken, obtenerUsuarioPorId);

router.put('/:id', verificarToken, verificarPropioUsuarioOAdmin, modificarUsuario);

router.delete('/:id', verificarToken, verificarAdmin, eliminarUsuario);

export default router;
