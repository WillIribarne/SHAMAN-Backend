import * as partidoService from '../services/partidoService.js';
import { responderError } from '../utils/responderError.js';
import { manejarRuta } from '../utils/globalController.js';

export const crearPartido = manejarRuta(
    (req) => partidoService.crearPartido(req.body, req.user.id), 201
);

export const obtenerPartidos = manejarRuta(
    () => partidoService.obtenerPartidos()
);

export const obtenerPartidoPorId = manejarRuta(
    (req) => partidoService.obtenerPartidoPorId(req.params.id)
);

export const modificarPartido = manejarRuta(
    (req) => partidoService.modificarPartido(req.params.id, req.body)
);

export const eliminarPartido = async (req, res) => {
    try {
        const partido = await partidoService.eliminarPartido(req.params.id, req.user.id);
        res.status(200).json({ mensaje: 'Partido eliminado', partido });
    } catch (error) {
        responderError(res, error);
    }
};

export const unirseAlPartido = manejarRuta(
    (req) => partidoService.unirseAlPartido(req.params.id, req.user.id, req.body.equipo)
);

export const bajarsedelPartido = manejarRuta(
    (req) => partidoService.bajarsedelPartido(req.params.id, req.user.id)
);

export const aprobarPartido = manejarRuta(
    (req) => partidoService.aprobarPartido(req.params.id, req.user.id)
);

export const rechazarPartido = manejarRuta(
    (req) => partidoService.rechazarPartido(req.params.id)
);