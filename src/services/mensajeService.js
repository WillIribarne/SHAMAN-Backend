import mongoose from 'mongoose';
import { Mensajeria } from '../models/mensajeriaModel.js';
import { crearError } from '../utils/crearError.js';
import { TIPOS_MENSAJE, ESTADOS_MENSAJERIA } from '../config/constantes.js';

// Filtro para ignorar los mensajes dados de baja lógica
const NO_ELIMINADO = { estado: { $ne: ESTADOS_MENSAJERIA.ELIMINADO } };

// Obtener mensajes del usuario logueado
// Ordena por fecha de creación de más antiguo al más reciente. El 1 significa ascendente
export const obtenerMisMensajes = async (usuarioId) => {
    return Mensajeria.find({ receptor: usuarioId, ...NO_ELIMINADO }).sort({ fecha_creacion: 1 });
};

export const obtenerMensajePorId = async (id, usuarioId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const mensaje = await Mensajeria.findOne({ _id: id, ...NO_ELIMINADO });
    if (!mensaje) throw crearError('Mensaje no encontrado', 404);
    if (mensaje.receptor.toString() !== usuarioId) throw crearError('Acceso denegado', 403);
    return mensaje;
};

export const marcarComoLeido = async (id, usuarioId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const mensaje = await Mensajeria.findOneAndUpdate(
        { _id: id, receptor: usuarioId, ...NO_ELIMINADO },
        { leido: true },
        { returnDocument: 'after' }
    );
    if (!mensaje) throw crearError('Mensaje no encontrado', 404);
    return mensaje;
};

export const eliminarMensaje = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    // Baja lógica (no se borra el documento), igual que en el resto de las colecciones
    const mensaje = await Mensajeria.findOneAndUpdate(
        { _id: id, ...NO_ELIMINADO },
        { estado: ESTADOS_MENSAJERIA.ELIMINADO },
        { returnDocument: 'after' }
    );
    if (!mensaje) throw crearError('Mensaje no encontrado o ya eliminado', 404);
    return mensaje;
};

// Crear mensaje automático (se llama desde otros services)
export const crearMensajeAutomatico = async ({ tipo, emisor, receptor, id_referencia, id_referencia_tipo, contenido }) => {
    return Mensajeria.create({ tipo, emisor, receptor, id_referencia, id_referencia_tipo, contenido });
};