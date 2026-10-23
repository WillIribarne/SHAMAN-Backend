import jwt from 'jsonwebtoken';
import * as usuarioService from '../services/usuarioService.js';
import { responderError } from '../utils/responderError.js';
import { manejarRuta } from '../utils/globalController.js';

export const registrarUsuario = manejarRuta(
    (req) => usuarioService.registrarUsuario(req.body), 201
);

export const loginUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.loginUsuario(req.body);
    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    res.status(200).json({ token, usuario });
  } catch (error) {
    responderError(res, error);
  }
};

export const obtenerUsuarios = manejarRuta(
    () => usuarioService.obtenerUsuarios()
);

export const obtenerUsuarioPorId = manejarRuta(
    (req) => usuarioService.obtenerUsuarioPorId(req.params.id, req.user)
);

export const modificarUsuario = manejarRuta(
    (req) => usuarioService.modificarUsuario(req.params.id, req.body)
);

export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.eliminarUsuario(req.params.id);
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente', usuario });
  } catch (error) {
    responderError(res, error);
  }
};
