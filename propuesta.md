SHAMANapp - La magia de la organización.

==============================================================================================
Propuesta:

¿Cansado de no saber cuando es el próximo partido que tenías con tus amigos? ¿Tenes ganas de jugar pero no tenes con quién?

SHAMANapp es una aplicación diseñada para tener toda la información de tus próximos encuentros futbolísticos y estadísticas en un solo lugar.

Características principales de la app:
    - Gestión simple
    - Administración sencilla 
    - Búsqueda rápida

Gestión simple: creá tu usuario, ¡Y ya está! Podes anotarte a partidos, invitar a tus amigos, crear equipos con tus conocidos, y mucho más.

Administración sencilla: para crear un partido, selecciona tu lugar, fecha y hora. Cuando el lugar confirme tu partido, te notificará.

Búsqueda rápida: si querés buscar y unirte a algun partido público, selecciona el partido que te guste y unite. 

SHAMANapp cuenta con un sistema de mensajería para notificarte de tus próximos partidos, cambios de horario, y cualquier situación que ocurra para que no te pierdas nada de lo que ocurra en el momento.

==============================================================================================

Casos uso & Relaciones entre colecciones:

Desc. general: 

El usuario es quién interactúa con las colecciones "Partido" y "Equipo". Hay 3 tipos de usuario: Jugador, Lugar y Admin. 
    - "Jugador" puede realizar Altas y Bajas de Partidos y de Equipos. Puede invitar gente a sus equipos y a partidos a los que ya está inscripto.
    - La decisión final del Alta de un partido está dado por la entidad "Lugar" correspondiente. 
    - Admin puede realizar todas las características de "Jugador", pero *NO ES CONSIDERADO UN JUGADOR PARA PARTIDOS, INVITACIONES, NI EQUIPOS*
Mensajería existe para notificar a los jugadores sobre ciertos eventos, principalmente invitaciones a partidos/equipos. 

1) Usuarios "Jugador"
        a-> Registrarse
        b-> Crear Partido
        c-> Crear Equipo
        d-> Aceptar/rechazar invitaciones
        d.I-> Invitar jugadores a Partido
        e-> Unirse a Partido (solo o como equipo)
        f-> Modificar Partido (si es creador)
        f.I-> Cancelar Partido (si es creador)
        g-> Bajarse de Partido (si es creador, le da permisos a otro)
        h-> Votar post-encuentro (MVP)
        i-> Ver su historial de partidos jugados
        j-> Ver otros perfiles
    "Lugar":
        k-> Aceptar/rechazar solicitudes de creación/modificación Partido
        l-> Cancelar/Modificar Partido (borrar/modificar)
    "Admin":
        m-> Ver todos los partidos pasados
        n-> Todas las caracteristicas y casos de "Jugador" y '1)k.'
        o-> Enviar mensajes personalizados a Usuarios
2) Partido:
    -> Guardarse en historial de jugadores post-partido
3) Equipo:
    -> Usarse para inscripción a partidos
4) Mensajeria:
    -> Enviar mensaje a "Jugador" si recibe invitación (puede aceptar/rechazar)
    -> Enviar mensaje a "Jugador" si un partido al que está inscripto es eliminado/modificado
    -> Enviar mensaje a "Jugador" si recibió un MVP en un partido
    -> Enviar mensaje a "Jugador" para confirmar si el lugar creó el partido
    -> Enviar mensaje a "Lugar" si se crea un Partido

==============================================================================================

Campos/parámetros:

1) Usuarios "Jugador"
        -
        -
        -
        -
        -
        -
        -
        -
        -
        -
        -
    "Lugar":
        -
        -
        -
        -
        -
        -
        -
        -
    "Admin":
        
2) Partido:
    -> Publico/Privado (esto permite que accedan solo con invitación)
3) Equipo:
    ->
4) Mensajeria:
    ->