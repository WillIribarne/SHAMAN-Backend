import { Router } from 'express'; // trae solo Router de adentro de Express
import { registrarUsuario, loginUsuario, obtenerUsuarios, obtenerUsuarioPorId, modificarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';
import { verificarToken, verificarAdmin, verificarPropioUsuarioOAdmin } from '../middlewares/authMiddleware.js';
//import { Admin } from '../models/usuarioModel.js';

const router = Router();

// POST /api/usuarios/registro -> crear usuario (solo jugador o lugar; un admin no se autoregistra)
router.post('/registro', registrarUsuario);

// POST /api/usuarios/login -> iniciar sesión
router.post('/login', loginUsuario);

// GET /api/usuarios -> ver todos (solo admin)
router.get('/', verificarToken, verificarAdmin, obtenerUsuarios);

// GET /api/usuarios/:id -> ver perfil de uno
router.get('/:id', verificarToken, obtenerUsuarioPorId);

// PUT /api/usuarios/:id -> modificar perfil propio
router.put('/:id', verificarToken, verificarPropioUsuarioOAdmin, modificarUsuario);

// DELETE /api/usuarios/:id -> baja lógica (solo admin)
// PENDIENTE: cuando exista el login, protegerla con verificarToken + chequeo de rol admin.
// Por ahora queda abierta para poder probarla en Postman.
router.delete('/:id', verificarToken, verificarAdmin, eliminarUsuario);

// SOLO PARA DESARROLLO, SACAR ANTES DE PRODUCCIÓN
/*router.post('/crear-admin', async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json(admin);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});*/

export default router;
