import mongoose from 'mongoose';
import { ESTADOS_PARTIDO, ACCESIBILIDAD_PARTIDO, TAMANIOS_EQUIPO } from '../config/constantes.js';

const { Schema, model } = mongoose;

// Subdocumento de voto MVP. Las reglas que un schema no puede forzar solo (un voto por
// jugador por partido, nadie se vota a sí mismo, solo se vota si estado === "finalizado")
// se validan en el service.
const votoMvpSchema = new Schema(
  {
    votante: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    votado: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const partidoSchema = new Schema(
  {
    fecha_horario: {
      type: Date,
      required: [true, 'La fecha y horario son obligatorios'],
      validate: {
        validator: (valor) => valor > new Date(),
        message: 'El partido debe programarse para una fecha futura',
      },
    },
    // Referencia a Usuario (tipo "lugar"). Antes era un String suelto: así no se podía saber
    // a qué Lugar avisarle para que apruebe el partido (ver analisis-diseno.md, pto. 2).
    lugar: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El lugar es obligatorio'],
    },
    jugadores_por_equipo: {
      type: Number,
      enum: TAMANIOS_EQUIPO,
      required: true,
    },
    estado: {
      type: String,
      enum: Object.values(ESTADOS_PARTIDO),
      default: ESTADOS_PARTIDO.PENDIENTE_APROBACION,
    },
    // Referencias a Usuario (tipo "jugador"), no objetos embebidos. Al popular para mostrar
    // en pantalla, pedir solo campos públicos (nunca "password", que ya viene excluida por
    // select:false; excluir también "historial" a mano en la query).
    // Cupo (longitud <= jugadores_por_equipo) se valida en el service con una operación
    // atómica, para evitar que dos jugadores ocupen el mismo último lugar en simultáneo.
    jugadores_equipo1: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    jugadores_equipo2: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    // Si el creador se baja del partido, la titularidad se reasigna a elección entre los
    // jugadores actualmente inscriptos (regla de negocio del service, no del modelo).
    creador: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El creador es obligatorio'],
    },
    accesibilidad: {
      type: String,
      enum: Object.values(ACCESIBILIDAD_PARTIDO),
      default: ACCESIBILIDAD_PARTIDO.PUBLICO,
    },
    votos_mvp: [votoMvpSchema],
  },
  { timestamps: true }
);

// Transiciones de estado esperadas (documentado también en analisis-diseno.md):
//   pendiente_aprobacion -> confirmado   (el Lugar aprueba)
//   pendiente_aprobacion -> eliminado    (el Lugar rechaza -> lo elimina el sistema, automático)
//   confirmado -> finalizado             (el partido ya se jugó)
//   confirmado -> cancelado              (el creador o el Lugar lo cancelan antes de jugarse)
//   cualquier estado -> eliminado        (baja lógica manual de un Admin)
//
// Nota: el nombre de la colección queda "partidos" (antes el boceto original la llamaba
// "ENCUENTROS" en un comentario, pero el resto del proyecto -- propuesta.md, casos de uso,
// el propio nombre del archivo -- usa siempre "Partido"; se unifica a ese nombre).
export const Partido = model('Partido', partidoSchema);
export default Partido;
