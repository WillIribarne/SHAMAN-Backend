import * as mensajeService from '../services/mensajeService.js';
import { responderError } from '../utils/responderError.js';

export const obtenerMisMensajes = async (req, res) => {
    try {
        const mensajes = await mensajeService.obtenerMisMensajes(req.user.id);
        res.status(200).json(mensajes);
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerMensajePorId = async (req, res) => {
    try {
        const mensaje = await mensajeService.obtenerMensajePorId(req.params.id, req.user.id);
        res.status(200).json(mensaje);
    } catch (error) {
        responderError(res, error);
    }
};

export const marcarComoLeido = async (req, res) => {
    try {
        const mensaje = await mensajeService.marcarComoLeido(req.params.id, req.user.id);
        res.status(200).json(mensaje);
    } catch (error) {
        responderError(res, error);
    }
};

export const eliminarMensaje = async (req, res) => {
    try {
        const mensaje = await mensajeService.eliminarMensaje(req.params.id);
        res.status(200).json({ mensaje: 'Mensaje eliminado', data: mensaje });
    } catch (error) {
        responderError(res, error);
    }
};