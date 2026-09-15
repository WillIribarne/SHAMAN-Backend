import mongoose from 'mongoose';
import { ESTADOS_MENSAJERIA, TIPOS_MENSAJE, REFERENCIAS_MENSAJERIA } from '../config/constantes.js';

const { Schema, model } = mongoose;

const mensajeriaSchema = new Schema({
  tipo: {
    type: String,
    enum: Object.values(TIPOS_MENSAJE),
    required: [true, 'El tipo de mensaje es obligatorio'],
  },
  // Para mensajes automáticos del sistema (p.ej. al eliminar un partido rechazado por el
  // Lugar) todavía falta definir qué cuenta figura como emisor -- pendiente, ver
  // analisis-diseno.md.
  emisor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El emisor es obligatorio'],
  },
  receptor: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El receptor es obligatorio'],
  },
  // Referencia dinámica al Partido o Equipo en cuestión. "id_referencia_tipo" le dice a
  // Mongoose a qué colección apunta "id_referencia" (patrón refPath) para poder popularlo.
  id_referencia_tipo: {
    type: String,
    enum: REFERENCIAS_MENSAJERIA,
    required: [true, 'id_referencia_tipo es obligatorio para poder poblar id_referencia'],
  },
  id_referencia: {
    type: Schema.Types.ObjectId,
    required: [true, 'id_referencia es obligatorio'],
    refPath: 'id_referencia_tipo',
  },
  // Texto ya armado del mensaje, para no reconstruirlo buscando datos del usuario/partido/
  // equipo cada vez que se abre. Si el partido/equipo referenciado cambia después, este
  // texto queda desactualizado -- por eso existe el tipo "modificacion_encuentro": ante un
  // cambio hay que emitir un mensaje nuevo, nunca editar el contenido de uno viejo.
  contenido: {
    type: String,
    required: [true, 'El contenido es obligatorio'],
    trim: true,
  },
  estado: {
    type: String,
    enum: Object.values(ESTADOS_MENSAJERIA),
    default: ESTADOS_MENSAJERIA.PENDIENTE,
  },
  leido: {
    type: Boolean,
    default: false,
  },
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  fecha_respuesta: {
    type: Date,
    default: null, // se completa cuando el estado pasa a "aceptada" o "rechazada"
  },
});

export const Mensajeria = model('Mensajeria', mensajeriaSchema);
export default Mensajeria;
