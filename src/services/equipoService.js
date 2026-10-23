import mongoose from 'mongoose';
import { Equipo } from '../models/equipoModel.js';
import { ESTADOS_EQUIPO } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { quitarUndefined } from '../utils/quitarUndefined.js';
import { obtenerTodos, obtenerPorId, eliminar } from '../utils/globalService.js';


export const crearEquipo = async (datos = {}, usuarioId) => {
    const { nombre, jugadores_por_equipo, integrantes, capitan } = datos;

    // Sin esta validación, si no mandan "integrantes" (o no es un array), el .includes()
    // de abajo rompe con un TypeError y la API responde 500 en vez de 400.
    if (!Array.isArray(integrantes) || integrantes.length === 0) {
        throw crearError('"integrantes" debe ser una lista con al menos un jugador', 400);
    }

    // el capitán tiene que ser uno de los integrantes
    if (!integrantes.includes(capitan)) {
        throw crearError('El capitán debe ser uno de los integrantes', 400);
    }

    // no puede haber más integrantes que el máximo
    if (integrantes.length > jugadores_por_equipo) {
        throw crearError(`El equipo no puede tener más de ${jugadores_por_equipo} integrantes`, 400);
    }

    return Equipo.create({ nombre, jugadores_por_equipo, integrantes, capitan });
};

export const agregarJugadorAlEquipo = async (equipoId, jugadorId) => {
    if (!mongoose.isValidObjectId(equipoId) || !mongoose.isValidObjectId(jugadorId)) {
        throw crearError('ID inválido', 400);
    }

    const equipo = await Equipo.findById(equipoId);
    if (!equipo) throw crearError('Equipo no encontrado', 404);

    if (equipo.integrantes.includes(jugadorId)) {
        throw crearError('El jugador ya está en el equipo', 400);
    }

    if (equipo.integrantes.length >= equipo.jugadores_por_equipo) {
        throw crearError('El equipo está completo', 400);
    }

    equipo.integrantes.push(jugadorId);
    return equipo.save();
};

export const obtenerEquipos = () => obtenerTodos(Equipo, { estado: ESTADOS_EQUIPO.ACTIVO });

export const obtenerEquipoPorId = (id) => obtenerPorId(Equipo, id);

// No usa el modificar() genérico (findByIdAndUpdate): ese no corre las validaciones del Schema
// y deja cambiar cualquier campo. Acá solo se permite nombre y tamaño; los integrantes y el
// capitán se manejan con sus propios endpoints, y el estado con DELETE.
export const modificarEquipo = async (id, datos = {}) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);

    const { nombre, jugadores_por_equipo } = datos;

    const equipo = await Equipo.findOne({ _id: id, estado: ESTADOS_EQUIPO.ACTIVO });
    if (!equipo) throw crearError('Equipo no encontrado', 404);

    if (jugadores_por_equipo !== undefined && equipo.integrantes.length > jugadores_por_equipo) {
        throw crearError(`El equipo ya tiene ${equipo.integrantes.length} integrantes, no se puede achicar a ${jugadores_por_equipo}`, 400);
    }

    // Solo se cambia lo que vino en el body (los campos que no vinieron quedan como estaban)
    equipo.set(quitarUndefined({ nombre, jugadores_por_equipo }));
    return equipo.save(); // save() corre las validaciones del Schema (enum de tamaños, etc.)
};

export const eliminarEquipo = (id) => eliminar(Equipo, id, ESTADOS_EQUIPO.ACTIVO, ESTADOS_EQUIPO.ELIMINADO);

export const quitarJugador = async (equipoId, jugadorId) => {
    if (!mongoose.isValidObjectId(equipoId) || !mongoose.isValidObjectId(jugadorId)) {
        throw crearError('ID inválido', 400);
    }

    const equipo = await Equipo.findById(equipoId);
    if (!equipo) throw crearError('Equipo no encontrado', 404);

    if (!equipo.integrantes.includes(jugadorId)) {
        throw crearError('El jugador no está en el equipo', 400);
    }

    if (jugadorId === equipo.capitan.toString()) {
        throw crearError('No se puede quitar al capitán del equipo', 400);
    }

    equipo.integrantes = equipo.integrantes.filter(i => i.toString() !== jugadorId);
    return equipo.save();
};