import mongoose from 'mongoose';
import { Partido } from '../models/partidoModel.js';
import { ESTADOS_PARTIDO, TIPOS_MENSAJE } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { obtenerTodos, obtenerPorId, modificar } from '../utils/globalService.js';
import { crearMensajeAutomatico } from './mensajeService.js';

export const obtenerPartidos = () => obtenerTodos(Partido);
export const obtenerPartidoPorId = (id) => obtenerPorId(Partido, id);
export const modificarPartido = (id, datos) => modificar(Partido, id, datos);

export const crearPartido = async (datos, creadorId) => {
    const partido = await Partido.create({ ...datos, creador: creadorId });

    await crearMensajeAutomatico({
        tipo: TIPOS_MENSAJE.INVITACION_ENCUENTRO,
        emisor: creadorId,
        receptor: partido.lugar,
        id_referencia: partido._id,
        id_referencia_tipo: 'Partido',
        contenido: `Tenés una nueva solicitud de partido para el ${partido.fecha_horario.toLocaleDateString()}.`
    });

    return partido;
};

export const eliminarPartido = async (id, usuarioId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const partido = await Partido.findByIdAndUpdate(
        id,
        { estado: ESTADOS_PARTIDO.ELIMINADO },
        { returnDocument: 'after' }
    );
    if (!partido) throw crearError('Partido no encontrado', 404);

    // avisamos a todos los jugadores de ambos equipos
    const todosLosJugadores = [...partido.jugadores_equipo1, ...partido.jugadores_equipo2];
    
    await Promise.all(todosLosJugadores.map(jugadorId =>
        crearMensajeAutomatico({
            tipo: TIPOS_MENSAJE.CANCELACION_ENCUENTRO,
            emisor: usuarioId,
            receptor: jugadorId,
            id_referencia: partido._id,
            id_referencia_tipo: 'Partido',
            contenido: `El partido del ${partido.fecha_horario.toLocaleDateString()} fue cancelado.`
        })
    ));

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
    await partido.save();

    await crearMensajeAutomatico({
        tipo: TIPOS_MENSAJE.MODIFICACION_ENCUENTRO,
        emisor: jugadorId,
        receptor: partido.creador,
        id_referencia: partido._id,
        id_referencia_tipo: 'Partido',
        contenido: `Un jugador se unió a tu partido del ${partido.fecha_horario.toLocaleDateString()}.`
    });

    return partido;
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

export const aprobarPartido = async (id, lugarId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const partido = await Partido.findOneAndUpdate(
        { _id: id, estado: ESTADOS_PARTIDO.PENDIENTE_APROBACION },
        { estado: ESTADOS_PARTIDO.CONFIRMADO },
        { returnDocument: 'after' }
    );
    if (!partido) throw crearError('Partido no encontrado o no está pendiente', 404);

    // mensaje automático al creador
    await crearMensajeAutomatico({
        tipo: TIPOS_MENSAJE.CONFIRMACION_ENCUENTRO,
        emisor: lugarId,
        receptor: partido.creador,
        id_referencia: partido._id,
        id_referencia_tipo: 'Partido',
        contenido: `Tu partido del ${partido.fecha_horario.toLocaleDateString()} fue confirmado por el lugar.`
    });
    return partido;
};

export const rechazarPartido = async (id, lugarId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const partido = await Partido.findOneAndUpdate(
        { _id: id, estado: ESTADOS_PARTIDO.PENDIENTE_APROBACION },
        { estado: ESTADOS_PARTIDO.CANCELADO },
        { returnDocument: 'after' }
    );
    if (!partido) throw crearError('Partido no encontrado o no está pendiente', 404);

    await crearMensajeAutomatico({
        tipo: TIPOS_MENSAJE.CANCELACION_ENCUENTRO,
        emisor: lugarId,
        receptor: partido.creador,
        id_referencia: partido._id,
        id_referencia_tipo: 'Partido',
        contenido: `Tu partido del ${partido.fecha_horario.toLocaleDateString()} fue rechazado por el lugar.`
    });

    return partido;
};