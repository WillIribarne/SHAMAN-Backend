import * as equipoService from '../services/equipoService.js';
import { responderError } from '../utils/responderError.js';

export const crearEquipo = async (req, res) => {
  try {
    const equipo = await equipoService.crearEquipo(req.body, req.user.id);
    res.status(201).json(equipo);
  } catch (error) {
    responderError(res, error);
  }
};

export const agregarJugadorAlEquipo = async (req, res) => {
  try {
    const equipo = await equipoService.agregarJugadorAlEquipo(req.params.id, req.body.id);
    res.status(201).json(equipo);
  } catch (error) {
    responderError(res, error);
  }
};

export const obtenerEquipos = async (req, res) => {
    try {
        const equipos = await equipoService.obtenerEquipos();
        res.status(200).json(equipos);
    } catch (error) {
      responderError(res, error);
    }
};

export const obtenerEquipoPorId = async (req, res) => {
    try {
        const equipo = await equipoService.obtenerEquipoPorId(req.params.id);
        res.status(200).json(equipo);
    } catch (error) {
      responderError(res, error);
    }
};

export const modificarEquipo = async (req, res) => {
    try {
        const equipo = await equipoService.modificarEquipo(req.params.id, req.body);
        res.status(200).json(equipo);
    } catch (error) {
      responderError(res, error);
    }
};

export const eliminarEquipo = async (req, res) => {
  try {
    const equipo = await equipoService.eliminarEquipo(req.params.id);
    res.status(200).json({ mensaje: 'Equipo eliminado correctamente', equipo });
  } catch (error) {
    responderError(res, error);
  }
};

export const eliminarJugadorDelEquipo = async (req, res) => {
    try {
        const equipo = await equipoService.quitarJugador(req.params.id, req.params.jugadorId);
        res.status(200).json(equipo);
    } catch (error) {
        responderError(res, error);
    }
};