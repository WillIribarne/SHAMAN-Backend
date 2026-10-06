import { Router } from 'express'; // trae solo Router de adentro de Express
import { registrarUsuario, loginUsuario, obtenerUsuarios, obtenerUsuarioPorId, modificarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';

const router = Router();

// POST /api/usuarios/registro -> crear usuario (solo jugador o lugar; un admin no se autoregistra)
router.post('/registro', registrarUsuario);

// POST /api/usuarios/login -> iniciar sesión
router.post('/login', loginUsuario);

// GET /api/usuarios -> ver todos (solo admin)
router.get('/', obtenerUsuarios);

// GET /api/usuarios/:id -> ver perfil de uno
router.get('/:id', obtenerUsuarioPorId);

// PUT /api/usuarios/:id -> modificar perfil propio
router.put('/:id', modificarUsuario);

// DELETE /api/usuarios/:id -> baja lógica (solo admin)
// PENDIENTE: cuando exista el login, protegerla con verificarToken + chequeo de rol admin.
// Por ahora queda abierta para poder probarla en Postman.
router.delete('/:id', eliminarUsuario);

export default router;
