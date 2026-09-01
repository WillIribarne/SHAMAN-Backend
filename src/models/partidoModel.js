/* Boceto para colección ENCUENTROS (Partido)

{
    _id: ObjectId,
    fecha_horario: Date,   // required. Debe ser una fecha futura al momento de crear el partido
                            // (validación de servicio: no se puede crear un partido "para ayer")
    lugar: ObjectId,        // ref Usuario (tipo "lugar"). ANTES era String suelto: así no se puede
                             // saber a qué Lugar hay que avisarle para que apruebe el partido, ni
                             // consultar "todos los partidos pendientes de este Lugar".
    jugadores_por_equipo: Number, // uno de TAMANIOS_EQUIPO (5, 7, 9 u 11)
    estado: String,          // enum: ESTADOS_PARTIDO -> ver transiciones más abajo
    jugadores_equipo1: [ObjectId], // ref Usuario (tipo "jugador"). Solo la referencia: al popular
    jugadores_equipo2: [ObjectId], // se puede pedir que traiga nombre/apellido, pero NUNCA password
                                    // (ya viene excluida por select:false) ni historial (se excluye
                                    // a mano en la query, ver usuarioModel.js).
                                    // Longitud de cada array <= jugadores_por_equipo: esto es cupo,
                                    // se valida en el service con una operación atómica para evitar
                                    // que dos jugadores ocupen el mismo último lugar en simultáneo
                                    // (race condition si se hace "leer longitud, después hacer push").
    creador: ObjectId,       // ref Usuario (tipo "jugador"). Si el creador se baja del partido, la
                              // titularidad se reasigna a otro jugador de jugadores_equipo1/2, a
                              // elección entre los que están actualmente inscriptos (regla de
                              // negocio a implementar en el service, no es un campo del modelo).
    accesibilidad: String,   // enum: ACCESIBILIDAD_PARTIDO ("publico" | "privado")
    votos_mvp: [{
      votante: ObjectId,     // ref Usuario
      votado: ObjectId,      // ref Usuario
    }],
    // Reglas de negocio para votos_mvp (a validar en el service, un array no puede forzarlas solo):
    //   - un jugador solo puede votar una vez por partido
    //   - nadie puede votarse a sí mismo
    //   - solo se puede votar cuando estado === "finalizado"
    createdAt / updatedAt    // timestamps automáticos
}

--- Transiciones de estado (ESTADOS_PARTIDO) ---
  pendiente_aprobacion -> confirmado   : el Lugar aprueba la solicitud
  pendiente_aprobacion -> eliminado    : el Lugar RECHAZA la solicitud -> lo elimina el sistema
                                          automáticamente (no es una acción manual de Admin)
  confirmado -> finalizado             : el partido ya se jugó
  confirmado -> cancelado              : el creador o el Lugar lo cancelan antes de jugarse
  cualquier estado -> eliminado        : baja lógica manual hecha por un Admin (moderación)

Nota: validar que el tamaño del Equipo que se une (Equipo.jugadores_por_equipo) coincida con
el jugadores_por_equipo de este Partido es lógica de servicio, no queda modelada acá.

*/
