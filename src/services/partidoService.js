import mongoose from 'mongoose';
import { Partido } from '../models/partidoModel.js';
import { ESTADOS_PARTIDO } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { obtenerTodos, obtenerPorId, modificar } from '../utils/globalService.js';

export const obtenerPartidos = () => obtenerTodos(Partido);
export const obtenerPartidoPorId = (id) => obtenerPorId(Partido, id);
export const modificarPartido = (id, datos) => modificar(Partido, id, datos);

export const crearPartido = async (datos, creadorId) => {
    return Partido.create({ ...datos, creador: creadorId });
};

export const eliminarPartido = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const partido = await Partido.findByIdAndUpdate(
        id,
        { estado: ESTADOS_PARTIDO.ELIMINADO },
        { returnDocument: 'after' }
    );
    if (!partido) throw crearError('Partido no encontrado', 404);
    return partido;
};

export const unirseAlPartido = async (partidoId, jugadorId, numeroEquipo) => {
    if (!mongoose.isValidObjectId(partidoId)) throw crearError('ID inválido', 400);

    const partido = await Partido.findById(partidoId);
    if (!partido) throw crearError('Partido no encontrado', 404);

    if (partido.estado !== ESTADOS_PARTIDO.CONFIRMADO) {
        throw crearError('El partido no está confirmado', 400);
    }

    const equipo = numeroEquipo === 1 ? 'jugadores_equipo1' : 'jugadores_equipo2';

    if (partido[equipo].includes(jugadorId)) {
        throw crearError('Ya estás anotado en este partido', 400);
    }

    if (partido[equipo].length >= partido.jugadores_por_equipo) {
        throw crearError('El equipo está completo', 400);
    }

    partido[equipo].push(jugadorId);
    return partido.save();
};

export const bajarsedelPartido = async (partidoId, jugadorId) => {
    if (!mongoose.isValidObjectId(partidoId)) throw crearError('ID inválido', 400);

    const partido = await Partido.findById(partidoId);
    if (!partido) throw crearError('Partido no encontrado', 404);

    const enEquipo1 = partido.jugadores_equipo1.some(j => j.toString() === jugadorId);
    const enEquipo2 = partido.jugadores_equipo2.some(j => j.toString() === jugadorId);

    if (!enEquipo1 && !enEquipo2) throw crearError('No estás anotado en este partido', 400);

    if (enEquipo1) {
        partido.jugadores_equipo1 = partido.jugadores_equipo1.filter(j => j.toString() !== jugadorId);
    } else {
        partido.jugadores_equipo2 = partido.jugadores_equipo2.filter(j => j.toString() !== jugadorId);
    }

    return partido.save();
};

export const aprobarPartido = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const partido = await Partido.findOneAndUpdate(
        { _id: id, estado: ESTADOS_PARTIDO.PENDIENTE_APROBACION },
        { estado: ESTADOS_PARTIDO.CONFIRMADO },
        { returnDocument: 'after' }
    );
    if (!partido) throw crearError('Partido no encontrado o no está pendiente', 404);
    return partido;
};

export const rechazarPartido = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const partido = await Partido.findOneAndUpdate(
        { _id: id, estado: ESTADOS_PARTIDO.PENDIENTE_APROBACION },
        { estado: ESTADOS_PARTIDO.CANCELADO },
        { returnDocument: 'after' }
    );
    if (!partido) throw crearError('Partido no encontrado o no está pendiente', 404);
    return partido;
};