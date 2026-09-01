/* Boceto para colección MENSAJERIA

{
  _id: ObjectId,
  tipo: String,       // enum: "invitacion_equipo" | "invitacion_encuentro" | "confirmacion_encuentro"
                       // | "modificacion_encuentro" | "cancelacion_encuentro" | "msj_mvp"
                       // | "aviso_encuentro_proximo"
  emisor: ObjectId,    // ref Usuario. Para mensajes automáticos del sistema (p.ej. cuando se
                        // elimina un partido rechazado por el Lugar) todavía hay que definir
                        // quién figura como emisor: una cuenta "sistema" dedicada, o el propio
                        // Lugar/Admin que disparó la acción. Queda pendiente de decidir.
  receptor: ObjectId,  // ref Usuario que recibe el mensaje
  id_referencia: ObjectId,      // referencia dinámica al Partido o Equipo en cuestión
  id_referencia_tipo: String,   // "Partido" | "Equipo" -- se agrega este campo porque Mongoose
                                 // necesita saber a qué colección apunta id_referencia para poder
                                 // popularlo dinámicamente (patrón "refPath"); sin este campo
                                 // hermano, una referencia dinámica no se puede resolver sola.
  contenido: String,   // texto ya armado del mensaje -> evita tener que reconstruirlo buscando
                        // datos del usuario/partido/equipo cada vez que se abre el mensaje.
                        // Ojo: si el partido/equipo referenciado cambia después (fecha, hora),
                        // este texto queda desactualizado -> por eso existe el tipo
                        // "modificacion_encuentro": ante un cambio hay que emitir un mensaje
                        // nuevo, nunca editar el contenido de uno viejo.
  estado: String,      // enum: ESTADOS_MENSAJERIA ("pendiente" | "aceptada" | "rechazada" | "eliminado")
                        // (antes mezclaba mayúsculas y minúsculas entre valores)
  leido: Boolean,       // default false
  fecha_creacion: Date,  // default Date.now
  fecha_respuesta: Date  // null hasta que cambia el estado (aceptada/rechazada)
}

*/
