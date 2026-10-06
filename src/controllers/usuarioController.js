import * as usuarioService from '../services/usuarioService.js';

// Traduce un error (propio o de Mongoose/MongoDB) a status HTTP + mensaje para el cliente.
const responderError = (res, error) => {
  // Errores lanzados a propósito desde el service (crearError), con su status ya definido.
  if (error.status) {
    return res.status(error.status).json({ error: error.message });
  }

  // Validaciones del Schema (campo obligatorio, minlength, formato de mail, etc.).
  if (error.name === 'ValidationError') {
    const detalles = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Datos inválidos', detalles });
  }

  // Índice unique violado (username o mail ya registrados).
  if (error.code === 11000) {
    const campos = Object.keys(error.keyValue ?? {}).join(', ');
    return res.status(409).json({ error: `Ya existe un usuario con ese ${campos}` });
  }

  // Cualquier otra cosa es un error nuestro: se loguea y no se exponen detalles internos.
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

export const registrarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.registrarUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    responderError(res, error);
  }
};

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

export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioService.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
      responderError(res, error);
    }
};

export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerUsuarioPorId(req.params.id);
        res.status(200).json(usuario);
    } catch (error) {
      responderError(res, error);
    }
};

export const modificarUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.modificarUsuario(req.params.id, req.body);
        res.status(200).json(usuario);
    } catch (error) {
      responderError(res, error);
    }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.eliminarUsuario(req.params.id);
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente', usuario });
  } catch (error) {
    responderError(res, error);
  }
};
