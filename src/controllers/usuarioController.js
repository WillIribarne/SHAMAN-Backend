import * as usuarioService from '../services/usuarioService.js';
import jwt from 'jsonwebtoken';
import { responderError } from '../utils/responderError.js';

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
