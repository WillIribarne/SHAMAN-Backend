import * as partidoService from '../services/partidoService.js';
import { responderError } from '../utils/responderError.js';

export const crearPartido = async (req, res) => {
    try {
        const partido = await partidoService.crearPartido(req.body, req.user.id);
        res.status(201).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerPartidos = async (req, res) => {
    try {
        const partidos = await partidoService.obtenerPartidos();
        res.status(200).json(partidos);
    } catch (error) {
        responderError(res, error);
    }
};

export const obtenerPartidoPorId = async (req, res) => {
    try {
        const partido = await partidoService.obtenerPartidoPorId(req.params.id);
        res.status(200).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};

export const modificarPartido = async (req, res) => {
    try {
        const partido = await partidoService.modificarPartido(req.params.id, req.body);
        res.status(200).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};

export const eliminarPartido = async (req, res) => {
    try {
        const partido = await partidoService.eliminarPartido(req.params.id);
        res.status(200).json({ mensaje: 'Partido eliminado', partido });
    } catch (error) {
        responderError(res, error);
    }
};

export const unirseAlPartido = async (req, res) => {
    try {
        const partido = await partidoService.unirseAlPartido(req.params.id, req.user.id, req.body.equipo);
        res.status(200).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};

export const bajarsedelPartido = async (req, res) => {
    try {
        const partido = await partidoService.bajarsedelPartido(req.params.id, req.user.id);
        res.status(200).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};

export const aprobarPartido = async (req, res) => {
    try {
        const partido = await partidoService.aprobarPartido(req.params.id, req.user.id);
        res.status(200).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};

export const rechazarPartido = async (req, res) => {
    try {
        const partido = await partidoService.rechazarPartido(req.params.id);
        res.status(200).json(partido);
    } catch (error) {
        responderError(res, error);
    }
};