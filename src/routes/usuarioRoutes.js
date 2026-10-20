import { Router } from 'express'; // trae solo Router de adentro de Express
import { registrarUsuario, loginUsuario, obtenerUsuarios, obtenerUsuarioPorId, modificarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';
import { verificarToken, verificarAdmin, verificarPropioUsuarioOAdmin } from '../middlewares/authMiddleware.js';
//import { Admin } from '../models/usuarioModel.js';

const router = Router();

router.post('/registro', registrarUsuario);

router.post('/login', loginUsuario);

router.get('/', verificarToken, verificarAdmin, obtenerUsuarios);

router.get('/:id', verificarToken, obtenerUsuarioPorId);

router.put('/:id', verificarToken, verificarPropioUsuarioOAdmin, modificarUsuario);

router.delete('/:id', verificarToken, verificarAdmin, eliminarUsuario);

// ESTO LO PUSE PARA CREAR UN ADMIN, DESP LO SACO
/*router.post('/crear-admin', async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json(admin);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});*/

export default router;
