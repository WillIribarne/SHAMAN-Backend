/* Boceto para colección EQUIPOS

{
    _id: ObjectId,
    nombre: String,               // required
    jugadores_por_equipo: Number, // uno de TAMANIOS_EQUIPO (5, 7, 9 u 11). Antes se llamaba
                                   // "cant_max_integrantes"; se renombra para usar el mismo nombre
                                   // que en partidoModel.js y poder comparar ambos campos
                                   // directamente al validar que un equipo entre en un partido.
    integrantes: [ObjectId],      // ref Usuario (tipo "jugador"). Longitud <= jugadores_por_equipo,
                                   // validado en el service (mismo motivo que el cupo de Partido).
    capitan: ObjectId,             // ref Usuario. ANTES era String suelto (nombre en texto libre).
                                    // Debe ser uno de los ids presentes en "integrantes"
                                    // (validación de service).
    estado: String,                // enum: ESTADOS_EQUIPO ("activo" | "eliminado")
    createdAt / updatedAt          // timestamps automáticos
}

*/
