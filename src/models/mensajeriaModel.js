/* Boceto para colección MENSAJERIA

{
  _id: ObjectId,
  tipo: String,       // "invitacion_equipo" o "invitacion_encuentro" o "aviso de X cosa" ...
  emisor: ObjectId,   // usuario/entidad que manda el invite (podria ser system)
  receptor: ObjectId, // usuario que recibe el mensaje
  id_referencia: ObjectId, // ref dinámica al EQUIPO o ENCUENTRO en cuestión (i.e. cual equipo/encuentro?)
  contenido: String  // lo que contiene el mensaje -> sirve para armar el msj 1 vez y no tener que buscar la info del usuario/encuentro/equipo cada vez que se abra el msj
  estado: String,     // "pendiente" o "aceptada" o "rechazada" o "Eliminado"(p/admin)
  leido: Boolean,
  fecha_creacion: Date,
  fecha_respuesta: Date   // cuando se modificó el estado
}

*/