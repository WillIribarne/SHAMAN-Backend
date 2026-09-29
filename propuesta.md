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

Casos uso & Relaciones entre colecc
El usuario es quién interactúa con las colecciones "Partido" y "Equipo". Hay 3 tipos de usuario: Jugador, Lugar y Admin, guardados en UNA sola colección "Usuario" (para simplificar el login: todos entran por el mismo endpoint, sin importar el tipo).
    - "Jugador" puede realizar Altas y Bajas de Partidos y de Equipos. Puede invitar gente a sus equipos y a partidos a los que ya está inscripto.
    - La decisión final del Alta de un partido está dado por la entidad "Lugar" correspondiente. 
    - Admin puede realizar todas las características de "Jugador", pero *NO ES CONSIDERADO UN JUGADOR PARA PARTIDOS, INVITACIONES, NI EQUIPOS*
Mensajería existe para notificar a los jugadores sobre ciertos eventos, principalmente invitaciones a partidos/equipos. 

1) Usuarios "Jugador"
        a-> Registrarse
        b-> Crear Partido (queda en estado "pendiente_aprobacion" hasta que el Lugar lo confirme)
        c-> Crear Equipo
        d-> Aceptar/rechazar invitaciones
        d.I-> Invitar jugadores a Partido
        e-> Unirse a Partido (solo o como equipo)
        f-> Modificar Partido (si es creador)
        f.I-> Cancelar Partido (si es creador)
        g-> Bajarse de Partido (si es creador, la titularidad se reasigna a elección entre los jugadores actualmente inscriptos en el partido)
        h-> Votar post-encuentro (MVP)
        i-> Ver su historial de partidos jugados
        j-> Ver otros perfiles
        j.I -> Modificar perfil propio
    "Lugar":
        k-> Aceptar/rechazar solicitudes de creación de Partido (si rechaza, el sistema elimina el partido automáticamente, ver estado del Partido)
        l-> Cancelar/Modificar un Partido ya confirmado
    "Admin":
        m-> Ver todos los partidos pasados
        n-> Todas las caracteristicas y casos de "Jugador" y '1)k.'
        o-> Enviar mensajes personalizados a Usuarios
        p-> Eliminar (baja lógica) Usuarios, Equipos, Partidos o mensajes de Mensajería
2) Partido:
    -> Guardarse en historial de jugadores post-partido (por referencia, no se duplica el partido completo)
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
(nota: todos incluyen ID autoincremental y timestamps automáticos de creación/actualización,
salvo que se indique lo contrario. El detalle campo por campo, con tipos de Mongoose y
validaciones, vive en los archivos de src/models/ y en src/config/constantes.js)

1) Usuario (colección única, con "tipo": jugador | lugar | admin)
    Campos comunes a los 3 tipos:
    - Tipo
    - Usuario (username, único)
    - Contraseña (hasheada, nunca se expone en la API)
    - Nombre
    - Mail (único)
    - Teléfono
    - Estado (activo / eliminado -- baja lógica, solo Admin)

    Exclusivos de "Jugador":
    - Apellido
    - Estadísticas:
        - Partidos Jugados
        - Partidos Ganados
        - Partidos Empatados
        - Partidos Perdidos
        - Cantidad de MVPs
    - Historial[] (referencias a Partido, no partidos embebidos)
    - Equipos Conformados[] (referencias a Equipo, sin límite fijo)
    (visibilidad: todos los campos de un Jugador son públicos excepto Contraseña e Historial[])

    Exclusivos de "Lugar":
    - Disponibilidad[]:
        - Dia 
        - Hora
        - Tipo de Cancha

    Exclusivos de "Admin":
    (sin campos propios por ahora)
        
2) Partido:
    - Fecha & Horario (debe ser una fecha futura al crear el partido)
    - Lugar (referencia a Usuario tipo "lugar")
    - Jugadores por equipo (5, 7, 9 u 11)
    - Estado: pendiente_aprobacion, confirmado, finalizado, cancelado, eliminado (ver transiciones abajo)
    - Jugadores Equipo 1 (referencias a Usuario tipo "jugador")
    - Jugadores Equipo 2 (referencias a Usuario tipo "jugador")
    - Creador (referencia a Usuario tipo "jugador")
    - Publico/Privado (esto permite que accedan solo con invitación)
    - Votos MVP[]: { votante, votado } (referencias a Usuario)

    Transiciones de estado:
        pendiente_aprobacion -> confirmado  (el Lugar aprueba)
        pendiente_aprobacion -> eliminado   (el Lugar rechaza -> lo elimina el sistema, automático)
        confirmado -> finalizado            (se jugó)
        confirmado -> cancelado             (el creador o el Lugar lo cancelan antes de jugarse)
        cualquier estado -> eliminado       (baja lógica manual de un Admin)

3) Equipo:
    - Nombre
    - Jugadores por equipo (5, 7, 9 u 11 -- mismo campo/valores que en Partido, para poder
      validar que un equipo entre en el partido al que se quiere unir)
    - Integrantes (referencias a Usuario tipo "jugador")
    - Capitan (referencia a Usuario, debe ser uno de los Integrantes)
    - Estado: Activo o Eliminado (baja lógica)

4) Mensajeria:
    - Tipo: invitacion_equipo, invitacion_encuentro, confirmacion_encuentro, modificacion_encuentro, cancelacion_encuentro, msj_mvp, aviso_encuentro_proximo
    - Emisor (referencia a Usuario; para mensajes automáticos del sistema todavía falta definir qué cuenta figura como emisor)
    - Receptor (referencia a Usuario)
    - id_referencia: al equipo/partido que refiera
    - id_referencia_tipo: "Partido" o "Equipo" (necesario para poblar id_referencia dinámicamente)
    - contenido: texto del mensaje
    - Estado: pendiente, aceptada, rechazada, eliminado
    - fecha_creación
    - fecha_respuesta: originalmente null
