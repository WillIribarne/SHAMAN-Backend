import mongoose from 'mongoose';
import { Partido } from '../models/partidoModel.js';
import { ESTADOS_PARTIDO, TIPOS_MENSAJE } from '../config/constantes.js';
import { crearError } from '../utils/crearError.js';
import { quitarUndefined } from '../utils/quitarUndefined.js';
import { obtenerTodos, obtenerPorId } from '../utils/globalService.js';
import { crearMensajeAutomatico } from './mensajeService.js';

// Los partidos dados de baja lógica no se listan
export const obtenerPartidos = () => obtenerTodos(Partido, { estado: { $ne: ESTADOS_PARTIDO.ELIMINADO } });
export const obtenerPartidoPorId = (id) => obtenerPorId(Partido, id);

// Estados en los que un partido todavía se puede editar
const ESTADOS_EDITABLES = [ESTADOS_PARTIDO.PENDIENTE_APROBACION, ESTADOS_PARTIDO.CONFIRMADO];

// No usa el modificar() genérico (findByIdAndUpdate): ese no corre las validaciones del Schema
// (se podía poner una fecha pasada) y deja cambiar cualquier campo (estado, creador, jugadores).
// Acá solo se permiten los datos "de organización" del partido; el estado cambia por sus propios
// endpoints (aprobar/rechazar/DELETE) y los jugadores con unirse/bajarse.
export const modificarPartido = async (id, datos = {}) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);

    const { fecha_horario, lugar, jugadores_por_equipo, accesibilidad } = datos;

    const partido = await Partido.findById(id);
    if (!partido) throw crearError('Partido no encontrado', 404);
    if (!ESTADOS_EDITABLES.includes(partido.estado)) {
        throw crearError(`No se puede modificar un partido en estado "${partido.estado}"`, 400);
    }

    const cantidadMaxAnotados = Math.max(partido.jugadores_equipo1.length, partido.jugadores_equipo2.length);
    if (jugadores_por_equipo !== undefined && cantidadMaxAnotados > jugadores_por_equipo) {
        throw crearError(`Ya hay ${cantidadMaxAnotados} jugadores anotados en un equipo, no se puede achicar a ${jugadores_por_equipo}`, 400);
    }

    // Solo se cambia lo que vino en el body (los campos que no vinieron quedan como estaban)
    partido.set(quitarUndefined({ fecha_horario, lugar, jugadores_por_equipo, accesibilidad }));
    return partido.save(); // save() corre las validaciones (fecha futura, enums, etc.)
};

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

    // Antes cualquier valor distinto de 1 (incluso "1" como texto, o nada) caía en el equipo 2
    const numero = Number(numeroEquipo);
    if (numero !== 1 && numero !== 2) {
        throw crearError('"equipo" debe ser 1 o 2', 400);
    }
    const equipo = numero === 1 ? 'jugadores_equipo1' : 'jugadores_equipo2';

    // Se revisan los DOS equipos: antes solo se miraba el elegido, y un jugador podía
    // anotarse una vez en cada equipo del mismo partido.
    const yaAnotado = [...partido.jugadores_equipo1, ...partido.jugadores_equipo2]
        .some((j) => j.toString() === jugadorId);
    if (yaAnotado) {
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
        // Según el diseño, un pendiente rechazado por el Lugar pasa a "eliminado". "cancelado" queda
        // reservado para un partido ya confirmado que se da de baja antes de jugarse.
        { estado: ESTADOS_PARTIDO.ELIMINADO },
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