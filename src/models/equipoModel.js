import mongoose from 'mongoose';
import { ESTADOS_EQUIPO, TAMANIOS_EQUIPO } from '../config/constantes.js';

const { Schema, model } = mongoose;

const equipoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del equipo es obligatorio'],
      trim: true,
    },
    // Mismo campo/valores que Partido.jugadores_por_equipo (antes se llamaba
    // "cant_max_integrantes"), para poder comparar directamente que un equipo entra en
    // el partido al que se quiere unir.
    jugadores_por_equipo: {
      type: Number,
      enum: TAMANIOS_EQUIPO,
      required: true,
    },
    // Referencias a Usuario (tipo "jugador"). Longitud <= jugadores_por_equipo, validado
    // en el service.
    integrantes: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
    // Referencia a Usuario. Antes era un String suelto (nombre en texto libre); debe ser
    // uno de los ids presentes en "integrantes" (validación de service).
    capitan: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El capitán es obligatorio'],
    },
    estado: {
      type: String,
      enum: Object.values(ESTADOS_EQUIPO),
      default: ESTADOS_EQUIPO.ACTIVO,
    },
  },
  { timestamps: true }
);

export const Equipo = model('Equipo', equipoSchema);
export default Equipo;
