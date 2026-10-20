import mongoose from 'mongoose';
import { Mensajeria } from '../models/mensajeriaModel.js';
import { crearError } from '../utils/crearError.js';
import { TIPOS_MENSAJE } from '../config/constantes.js';

// Obtener mensajes del usuario logueado
// Ordena por fecha de creación de más antiguo al más reciente. El 1 significa ascendente
export const obtenerMisMensajes = async (usuarioId) => {
    return Mensajeria.find({ receptor: usuarioId }).sort({ fecha_creacion: 1 });
};

export const obtenerMensajePorId = async (id, usuarioId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const mensaje = await Mensajeria.findById(id);
    if (!mensaje) throw crearError('Mensaje no encontrado', 404);
    if (mensaje.receptor.toString() !== usuarioId) throw crearError('Acceso denegado', 403);
    return mensaje;
};

export const marcarComoLeido = async (id, usuarioId) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const mensaje = await Mensajeria.findOneAndUpdate(
        { _id: id, receptor: usuarioId },
        { leido: true },
        { returnDocument: 'after' }
    );
    if (!mensaje) throw crearError('Mensaje no encontrado', 404);
    return mensaje;
};

export const eliminarMensaje = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw crearError('ID inválido', 400);
    const mensaje = await Mensajeria.findByIdAndDelete(id);
    if (!mensaje) throw crearError('Mensaje no encontrado', 404);
    return mensaje;
};

// Crear mensaje automático (se llama desde otros services)
export const crearMensajeAutomatico = async ({ tipo, emisor, receptor, id_referencia, id_referencia_tipo, contenido }) => {
    return Mensajeria.create({ tipo, emisor, receptor, id_referencia, id_referencia_tipo, contenido });
};