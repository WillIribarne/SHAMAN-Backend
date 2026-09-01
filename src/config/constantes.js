/**
 * Constantes compartidas por todos los modelos.
 *
 * Por qué existe este archivo: en el boceto original cada colección escribía sus propios
 * estados como texto libre ("Eliminado" en una, "eliminado" en otra), lo que tarde o
 * temprano genera bugs de comparación de strings. Centralizarlos acá los deja en un solo
 * lugar, todos en minúsculas, y sirve como fuente única para los `enum` de Mongoose.
 */

// Tipo de usuario (discriminador de la colección "usuarios")
export const TIPOS_USUARIO = Object.freeze({
  JUGADOR: 'jugador',
  LUGAR: 'lugar',
  ADMIN: 'admin',
});

// Estado de una cuenta de Usuario (baja lógica)
export const ESTADOS_USUARIO = Object.freeze({
  ACTIVO: 'activo',
  ELIMINADO: 'eliminado', // baja lógica, solo Admin
});

// Estado de un Partido
export const ESTADOS_PARTIDO = Object.freeze({
  PENDIENTE_APROBACION: 'pendiente_aprobacion', // creado por un Jugador, esperando que el Lugar lo confirme
  CONFIRMADO: 'confirmado', // aprobado por el Lugar, todavía no se jugó
  FINALIZADO: 'finalizado', // ya se jugó
  CANCELADO: 'cancelado', // dado de baja (por el creador o el Lugar) antes de jugarse
  ELIMINADO: 'eliminado', // baja lógica: por Admin, o automática cuando el Lugar rechaza un pendiente_aprobacion
});

// Estado de un Equipo
export const ESTADOS_EQUIPO = Object.freeze({
  ACTIVO: 'activo',
  ELIMINADO: 'eliminado', // baja lógica, por Admin o por el capitán
});

// Estado de una invitación/mensaje de Mensajería
export const ESTADOS_MENSAJERIA = Object.freeze({
  PENDIENTE: 'pendiente',
  ACEPTADA: 'aceptada',
  RECHAZADA: 'rechazada',
  ELIMINADO: 'eliminado', // baja lógica, por Admin
});

// Accesibilidad de un Partido
export const ACCESIBILIDAD_PARTIDO = Object.freeze({
  PUBLICO: 'publico',
  PRIVADO: 'privado',
});

// Tamaños de cancha / cantidad de jugadores por equipo permitidos.
// Se usa tanto en Equipo.jugadores_por_equipo como en Partido.jugadores_por_equipo
// y en Usuario(lugar).disponibilidad[].tipo_cancha, para que los tres queden
// comparables entre sí sin listas de valores repetidas y potencialmente distintas.
export const TAMANIOS_EQUIPO = Object.freeze([5, 7, 9, 11]);
