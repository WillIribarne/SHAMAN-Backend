import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { TIPOS_USUARIO, ESTADOS_USUARIO, TAMANIOS_EQUIPO } from '../config/constantes.js';

const { Schema, model } = mongoose;

const REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Colección única "usuarios", con 3 tipos (jugador/lugar/admin) implementados como
// discriminators de Mongoose: comparten esta colección física, pero cada uno valida y
// devuelve solo sus propios campos (ver informe/analisis-diseno.md, punto 1).
const opcionesUsuario = {
  discriminatorKey: 'tipo',
  timestamps: true,
  toJSON: {
    // Nunca devolver el hash de la contraseña, aunque alguna query lo haya pedido a propósito.
    transform: (_doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
};

const usuarioSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'El username es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'El username debe tener al menos 3 caracteres'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false, // nunca se devuelve por defecto en una query
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    mail: {
      type: String,
      required: [true, 'El mail es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [REGEX_MAIL, 'El formato del mail no es válido'],
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true,
    },
    estado: {
      type: String,
      enum: Object.values(ESTADOS_USUARIO),
      default: ESTADOS_USUARIO.ACTIVO,
    },
  },
  opcionesUsuario
);
// Hashea la contraseña antes de guardar, solo si fue creada o modificada.
// En Mongoose 9 los hooks async no reciben next(): alcanza con terminar (o lanzar un error).
usuarioSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método de instancia para el login: compara la contraseña en texto plano contra el hash.
// Requiere haber pedido el usuario con .select('+password'), porque el campo tiene select:false.
usuarioSchema.methods.compararPassword = function compararPassword(passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

export const Usuario = model('Usuario', usuarioSchema);

// --- Discriminator: Jugador ---
const jugadorSchema = new Schema({
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
  },
  estadisticas: {
    partidos_jugados: { type: Number, default: 0, min: 0 },
    partidos_ganados: { type: Number, default: 0, min: 0 },
    partidos_empatados: { type: Number, default: 0, min: 0 },
    partidos_perdidos: { type: Number, default: 0, min: 0 },
    cantidad_MVPS: { type: Number, default: 0, min: 0 },
  },
  // Referencias, no documentos embebidos: evita duplicar datos de Partido/Equipo que
  // quedarían desactualizados, y evita filtrar campos sensibles (ver analisis-diseno.md, pto. 3).
  historial: [{ type: Schema.Types.ObjectId, ref: 'Partido' }],
  equipos_conformados: [{ type: Schema.Types.ObjectId, ref: 'Equipo' }],
  // Nota de visibilidad: "historial" es público solo para el dueño del perfil, no para
  // terceros que ven "otros perfiles". Esa proyección se decide en el controller/service
  // según quién hace el pedido -- no se puede resolver acá con select:false (eso lo
  // ocultaría también para el propio dueño).
});

export const Jugador = Usuario.discriminator(TIPOS_USUARIO.JUGADOR, jugadorSchema);

// --- Discriminator: Lugar ---
const lugarSchema = new Schema({
  disponibilidad: [
    {
      _id: false,
      dia: {
        type: String,
        enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'],
        required: true,
      },
      hora: { type: String, required: true }, // formato "HH:mm"
      tipo_cancha: { type: Number, enum: TAMANIOS_EQUIPO, required: true },
    },
  ],
});

export const Lugar = Usuario.discriminator(TIPOS_USUARIO.LUGAR, lugarSchema);

// --- Discriminator: Admin ---
const adminSchema = new Schema({});

export const Admin = Usuario.discriminator(TIPOS_USUARIO.ADMIN, adminSchema);

export default Usuario;
