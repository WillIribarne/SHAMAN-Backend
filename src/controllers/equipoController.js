import * as equipoService from '../services/equipoService.js';
import { manejarRuta } from '../utils/globalController.js';

export const crearEquipo = manejarRuta(
    (req) => equipoService.crearEquipo(req.body, req.user.id), 201
);

export const obtenerEquipos = manejarRuta(
    () => equipoService.obtenerEquipos()
);

export const obtenerEquipoPorId = manejarRuta(
    (req) => equipoService.obtenerEquipoPorId(req.params.id)
);

export const modificarEquipo = manejarRuta(
    (req) => equipoService.modificarEquipo(req.params.id, req.body)
);

export const eliminarEquipo = manejarRuta(
    (req) => equipoService.eliminarEquipo(req.params.id)
);

export const agregarJugadorAlEquipo = manejarRuta(
    (req) => equipoService.agregarJugadorAlEquipo(req.params.id, req.body.jugadorId), 201
);

export const eliminarJugadorDelEquipo = manejarRuta(
    (req) => equipoService.eliminarJugadorDelEquipo(req.params.id, req.params.jugadorId)
);