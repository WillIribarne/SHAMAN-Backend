/*
Boceto para la colección USUARIOS
Última revisión: se unificó en una sola colección con 3 "tipos" (jugador, lugar, admin),
por decisión explícita del equipo (simplificar el login: todos entran por el mismo endpoint).

=== Cómo evitar documentos con campos null/undefined según el tipo ===
Si guardamos jugador/lugar/admin en la misma colección con un único schema plano, cada
documento va a tener campos que no le corresponden (un "admin" con "estadisticas: null",
etc.). La forma prolija de resolver esto en Mongoose son los "discriminators": se define
un schema BASE con los campos comunes a los 3 tipos, y un schema HIJO por cada tipo que
agrega SOLO sus campos propios. Mongoose sigue guardando todo en la misma colección física
("usuarios"), pero valida y devuelve cada documento con la forma que le corresponde según
el campo "tipo". Esto es exactamente lo que se pidió: una sola colección + normalización
prolija por tipo.

--- Campos comunes a los 3 tipos (schema base) ---
{
  _id: ObjectId,
  tipo: String,        // enum: TIPOS_USUARIO ("jugador" | "lugar" | "admin") -> src/config/constantes.js
  username: String,    // required, unique, se guarda en minúsculas
  password: String,    // required. Se guarda hasheada (bcrypt). NUNCA se devuelve en la API (select:false)
  nombre: String,      // required. Para "lugar" es el nombre del predio/negocio
  mail: String,        // required, unique, se guarda en minúsculas, formato validado
  telefono: String,    // required (antes era Number: se pierden ceros a la izquierda y no se puede
                        // validar formato con regex, por eso pasa a String)
  estado: String,       // enum: ESTADOS_USUARIO ("activo" | "eliminado") -> baja lógica, solo Admin
  createdAt / updatedAt // timestamps automáticos
}

--- Campos exclusivos de "jugador" ---
{
  apellido: String,      // required
  estadisticas: {
    partidos_jugados: Number,   // default 0
    partidos_ganados: Number,   // default 0
    partidos_empatados: Number, // default 0
    partidos_perdidos: Number,  // default 0
    cantidad_MVPS: Number       // default 0. Se incrementa cuando este jugador gana la
                                 // votación de MVP de un partido (ver partidoModel.js -> votos_mvp)
    // (se sacó "calificacion": no había ningún caso de uso que definiera quién la carga
    // ni cuándo se actualiza, así que se elimina hasta que se defina ese mecanismo)
  },
  historial: [ObjectId],          // ref a Partido. Se guarda solo la referencia (no el partido
                                   // completo embebido) para no duplicar datos que ya viven en la
                                   // colección Partido y quedan desactualizados si el partido cambia.
  equipos_conformados: [ObjectId] // ref a Equipo. Sin límite fijo (antes tenía un tope de 5 sin
                                   // justificación en los casos de uso).
}

--- Visibilidad de un perfil "jugador" ---
Regla acordada: TODOS los campos de un Jugador son públicos, excepto "password" e "historial".
"password" se puede proteger a nivel de schema (select:false), pero "historial" NO: es visible
para el dueño del perfil pero no para terceros que solo están mirando el perfil de otro
jugador. Esa distinción depende de QUIÉN pide los datos, así que se resuelve en el
controller/service (eligiendo qué proyectar según el usuario autenticado), no en el modelo.

--- Campos exclusivos de "lugar" ---
{
  disponibilidad: [{
    dia: String,         // p.ej. "lunes"
    hora: String,         // p.ej. "20:00"
    tipo_cancha: Number    // uno de TAMANIOS_EQUIPO (5, 7, 9 u 11)
  }]
}

--- Campos exclusivos de "admin" ---
(sin campos propios además de los comunes, por ahora)


--- Ejemplo ilustrativo de cómo se vería en código con discriminators de Mongoose ---
(esto es solo para entender el mecanismo -- todavía no es el modelo final, falta instalar
mongoose y definir el resto de la app)

  import mongoose from 'mongoose';
  import { TIPOS_USUARIO, ESTADOS_USUARIO, TAMANIOS_EQUIPO } from '../config/constantes.js';
  const { Schema, model } = mongoose;

  const opciones = { discriminatorKey: 'tipo', timestamps: true };

  const usuarioSchema = new Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    nombre:   { type: String, required: true, trim: true },
    mail:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    telefono: { type: String, required: true },
    estado:   { type: String, enum: Object.values(ESTADOS_USUARIO), default: ESTADOS_USUARIO.ACTIVO },
  }, opciones);

  const Usuario = model('Usuario', usuarioSchema);

  const Jugador = Usuario.discriminator(TIPOS_USUARIO.JUGADOR, new Schema({
    apellido: { type: String, required: true, trim: true },
    estadisticas: {
      partidos_jugados:   { type: Number, default: 0 },
      partidos_ganados:   { type: Number, default: 0 },
      partidos_empatados: { type: Number, default: 0 },
      partidos_perdidos:  { type: Number, default: 0 },
      cantidad_MVPS:      { type: Number, default: 0 },
    },
    historial: [{ type: Schema.Types.ObjectId, ref: 'Partido' }],
    equipos_conformados: [{ type: Schema.Types.ObjectId, ref: 'Equipo' }],
  }));

  const Lugar = Usuario.discriminator(TIPOS_USUARIO.LUGAR, new Schema({
    disponibilidad: [{
      dia: String,
      hora: String,
      tipo_cancha: { type: Number, enum: TAMANIOS_EQUIPO },
    }],
  }));

  const Admin = Usuario.discriminator(TIPOS_USUARIO.ADMIN, new Schema({}));

  export { Usuario, Jugador, Lugar, Admin };

*/
