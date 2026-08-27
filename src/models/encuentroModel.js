/* Boceto para colección ENCUENTROS

{
    _id: ObjectId,
    fecha_horario: Date, //esto dice fecha y horario. Va todo junto, pero el front lo puede separar
    lugar: String,
    jugadores_por_equipo: Number,
    estado: String,  // "pendiente" o "Finalizado" o "Cancelado" o "Eliminado" (Este ultimo p/Admin)
    jugadores_equipo1[jugadores_por_equipo]: Usuarios,
    jugadores_equipo2[jugadores_por_equipo]: Usuarios,
    creador: Usuario
}

*/