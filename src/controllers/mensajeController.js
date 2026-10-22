import * as mensajeService from '../services/mensajeService.js';
import { responderError } from '../utils/responderError.js';
import { manejarRuta } from '../utils/globalController.js';

export const obtenerMisMensajes = manejarRuta(
    (req) => mensajeService.obtenerMisMensajes(req.user.id)
);

export const obtenerMensajePorId = manejarRuta(
    (req) => mensajeService.obtenerMensajePorId(req.params.id, req.user.id)
);

export const marcarComoLeido = manejarRuta(
    (req) => mensajeService.marcarComoLeido(req.params.id, req.user.id)
);

export const eliminarMensaje = async (req, res) => {
    try {
        const mensaje = await mensajeService.eliminarMensaje(req.params.id);
        res.status(200).json({ mensaje: 'Mensaje eliminado', data: mensaje });
    } catch (error) {
        responderError(res, error);
    }
};