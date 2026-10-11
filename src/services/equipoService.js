import mongoose from 'mongoose';
import { Equipo } from '../models/equipoModel.js';
import { ESTADOS_EQUIPO } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { obtenerTodos, obtenerPorId, modificar, eliminar } from '../utils/globalService.js';


export const crearEquipo = async (datos, usuarioId) => {
    const { nombre, jugadores_por_equipo, integrantes, capitan } = datos;

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

export const obtenerEquipos = () => obtenerTodos(Equipo, { estado: 'activo' });

export const obtenerEquipoPorId = (id) => obtenerPorId(Equipo, id);

export const modificarEquipo = (id, datos) => modificar(Equipo, id, datos);

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