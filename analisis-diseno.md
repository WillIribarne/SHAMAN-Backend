# Análisis de diseño — SHAMANapp (Backend)

Este análisis compara `propuesta.md`, los bocetos ya presentes en `src/models/` (usuarioModel.js, partidoModel.js, equipoModel.js, mensajeriaModel.js) y los requisitos del parcial (`INSPT-ProgIII-parcial2.pdf`). El objetivo es señalar decisiones que conviene cerrar **antes** de escribir código, porque una vez que haya endpoints y datos reales, corregirlas implica migraciones y romper el frontend.

## 1. El modelo de "Usuario" con tres roles muy distintos es el punto más urgente

`propuesta.md` define tres tipos de usuario (Jugador, Lugar, Admin) con un campo `Tipo`, pero el boceto `usuarioModel.js` no incluye ese campo ni ningún mecanismo para diferenciarlos: solo tiene los campos de un Jugador (username, password, estadísticas, equipos_conformados). Faltan por completo los campos de "Lugar" (disponibilidad, tipo de cancha).

El problema de fondo no es solo que falte el campo, sino que "Lugar" y "Jugador" son entidades con casi nada en común: uno juega partidos, vota MVP y forma equipos; el otro administra disponibilidad de canchas y aprueba/rechaza partidos. Meter ambos en una sola colección "Usuario" (sin usar discriminators de Mongoose) va a generar documentos con muchos campos `null`/`undefined` según el tipo — el típico anti-patrón de "colección fourre-tout" en bases documentales.

Antes de programar conviene decidir explícitamente una de estas dos rutas:
- Una sola colección `Usuario` con **discriminators de Mongoose** (`Jugador`, `Lugar`, `Admin` heredando de un esquema base con username/password/mail), que además simplifica el login único.
- Colecciones separadas (`Usuario` para Jugador/Admin, y `Lugar` como entidad aparte), si se concluye que "Lugar" en realidad no es un "usuario" sino una entidad administrada (una cancha/predio), y que quien opera esa cuenta es, en rigor, otro tipo de usuario administrador del predio.

Esta decisión afecta directamente el middleware de autorización, el payload del JWT y cómo se validan permisos en cada endpoint, así que es la primera piedra a resolver.

**> Resuelto (ver `usuarioModel.js`).** Se mantiene una sola colección `Usuario`, implementada con discriminators de Mongoose: un schema base con los campos comunes (tipo, username, password, nombre, mail, telefono, estado) y un schema hijo por tipo que agrega solo sus campos propios (Jugador: apellido, estadísticas, historial, equipos_conformados; Lugar: disponibilidad; Admin: sin campos propios). El archivo incluye una explicación de qué es un discriminator y un ejemplo de código ilustrativo.

## 2. Relaciones modeladas como texto libre en vez de referencias

En `partidoModel.js`, `lugar` está tipado como `String` en lugar de una referencia (`ObjectId`) al documento de Lugar. Esto rompe la relación que el propio caso de uso necesita: "la decisión final del alta de un partido está dada por la entidad Lugar correspondiente" requiere poder identificar *cuál* Lugar debe aprobar ese partido, y con un string libre no hay forma confiable de vincular ambos documentos (ni de consultar "todos los partidos pendientes de este Lugar").

Lo mismo pasa con `capitan: String` en `equipoModel.js`: debería ser un `ObjectId` referenciando al Usuario, no un nombre en texto (¿qué pasa si dos jugadores se llaman igual? ¿cómo se valida que el capitán exista o pertenezca al equipo?).

**> Resuelto.** `lugar` en Partido y `capitan` en Equipo ahora son `ObjectId` con `ref: 'Usuario'`.

## 3. Duplicación de datos entre colecciones (riesgo de inconsistencia)

Varios campos guardan lo que parecen ser copias embebidas de otras colecciones en lugar de referencias:

- `equipos_conformados[5]: Equipo` en Usuario — si esto embebe el documento completo del equipo (roster, capitán, etc.), cualquier cambio en el equipo (nuevo integrante, cambio de capitán) obliga a actualizar la copia en cada jugador, con riesgo real de quedar desincronizado. Además, el límite fijo de 5 equipos no tiene justificación en los casos de uso — conviene que sea un array de referencias sin tope arbitrario, o justificar el límite explícitamente.
- `jugadores_equipo1[...]: Usuarios` / `jugadores_equipo2[...]: Usuarios` en Partido — si son objetos Usuario completos embebidos (el comentario del boceto es ambiguo), esto es un problema serio de seguridad además de normalización: significaría guardar el hash de la contraseña de cada jugador dentro de cada partido en el que participó. Estos campos deben ser arrays de `ObjectId` con `populate` en la consulta, nunca documentos completos.
- `Historial[]` en Jugador (mencionado en `propuesta.md`, ausente en el boceto actual) — guardar el historial completo de partidos embebido en el usuario es un array sin cota de crecimiento. Lo habitual en un modelo documental es que el "historial" sea una *consulta* a la colección Partido filtrando por jugador, no una copia duplicada. Si se necesita por performance, debería ser explícitamente un caché derivado, no la fuente de verdad.

**> Resuelto.** `equipos_conformados` ya no tiene tope y es array de `ObjectId` (ref Equipo). `jugadores_equipo1/2` son arrays de `ObjectId` (ref Usuario) — al popularlos, la query debe pedir explícitamente los campos públicos y excluir `historial` (ver punto 7; `password` ya queda afuera por `select:false`). Se agregó `historial: [ObjectId]` (ref Partido) a `usuarioModel.js`.

## 4. Estados (estado/status) inconsistentes y con reglas contradictorias

Hay tres colecciones con campos de estado en texto libre, y la nomenclatura no es consistente entre ellas: `partidoModel.js` usa `"pendiente"`, `"Finalizado"`, `"Cancelado"`, `"Eliminado"` (mezcla minúscula/mayúscula inicial); `equipoModel.js` usa `"Activo"`/`"Eliminado"`; `mensajeriaModel.js` usa `"pendiente"`, `"aceptada"`, `"rechazada"`, `"Eliminado"`. Sin una lista de constantes centralizada, esto va a producir bugs de comparación de strings (`"Cancelado" !== "cancelado"`) tanto en el backend como al mapear estados en el frontend. Conviene definir un enum único por colección (y usarlo con `enum` en el schema de Mongoose) antes de escribir el primer controller.

Más allá de la forma, hay una contradicción de fondo entre el texto de casos de uso y el de campos: en "casos de uso" se dice que **Lugar** puede "Cancelar/Modificar Partido (**borrar**/modificar)", pero en "campos" el estado `"Eliminado"` está reservado explícitamente para Admin ("cancelado (o eliminado p/admin)"). Hay que decidir una política única: ¿existe borrado físico en algún caso, o todo es soft-delete vía estado? Esto es relevante porque el parcial pide CRUD completo con validaciones para al menos una entidad, y el "Delete" de esa entidad tiene que tener una semántica clara y consistente.

Tampoco está modelado el estado intermedio de "partido creado pero pendiente de aprobación del Lugar" vs "partido confirmado, pendiente de jugarse" — ambos hoy caerían en `"pendiente"`, pero son situaciones distintas para el usuario (y para qué notificación de Mensajería corresponde disparar).

**> Resuelto.** Se creó `src/config/constantes.js` con todos los enums en minúsculas (`ESTADOS_USUARIO`, `ESTADOS_PARTIDO`, `ESTADOS_EQUIPO`, `ESTADOS_MENSAJERIA`, `TIPOS_USUARIO`, `ACCESIBILIDAD_PARTIDO`, `TAMANIOS_EQUIPO`), para que cada modelo importe de ahí en vez de escribir los strings a mano. Se definió el borrado lógico como política única (campo `estado`, incluso agregado a Usuario, que no lo tenía). Se agregó el estado `pendiente_aprobacion` en Partido, distinto de `confirmado`; y se dejó documentado que el rechazo del Lugar dispara automáticamente `eliminado` (no es una acción de Admin, sino del sistema — ver punto 9).

## 5. Casos de uso sin soporte en el modelo de datos

La votación de MVP post-partido (caso de uso "h") no tiene ningún campo asociado en `partidoModel.js` ni en `usuarioModel.js` más allá del contador `cantidad_MVPS` en el jugador ganador. Falta modelar dónde se registran los votos (¿un array de `{votante, votado}` dentro del Partido?), y las reglas de negocio: ¿un voto por jugador?, ¿puede uno votarse a sí mismo?, ¿hasta cuándo se puede votar?

Algo similar pasa con `calificacion` (0 a 5) en las estadísticas del Jugador: no hay ningún caso de uso que describa cómo un jugador califica a otro (¿es post-partido, como el MVP? ¿es la nota promedio de alguna evaluación entre pares?). Sin esa definición, el campo no se sabe quién lo actualiza ni cuándo.

**> Resuelto.** Se sacó `calificacion` de `estadisticas`. Se agregó `votos_mvp: [{ votante, votado }]` a `partidoModel.js` (se asumió que corresponde a Partido, no a Usuario, porque la votación ocurre en el contexto de un partido puntual — avisen si lo pensaban en otro lugar). Quedan documentadas como reglas de negocio a validar en el service (no se pueden expresar solo con el schema): un voto por jugador por partido, nadie se vota a sí mismo, y solo se vota cuando `estado === "finalizado"`.

## 6. Reglas de negocio y concurrencia no contempladas

Algunas reglas quedan implícitas y conviene explicitarlas antes de programar, porque cambian el diseño de los endpoints:

- **Cupo de partido**: si dos jugadores intentan unirse al último lugar disponible al mismo tiempo, un simple "leer array, chequear longitud, hacer push" es una condición de carrera clásica. Se necesita una actualización atómica (`findOneAndUpdate` con condición sobre el tamaño del array, o una transacción) para no exceder `jugadores_por_equipo`.
- **Coherencia equipo–partido**: nada valida que un Equipo con `cant_max_integrantes = 7` no pueda unirse a un Partido con `jugadores_por_equipo = 11`. Hay que agregar esa validación explícitamente (y de paso, unificar el nombre del campo: un lado dice `jugadores_por_equipo`, el otro `cant_max_integrantes`, para el mismo concepto).
- **Transferencia de titularidad**: el caso de uso "g" dice que si el creador se baja del partido "le da permisos a otro", pero no se define el criterio (¿el jugador más antiguo? ¿al azar? ¿el capitán del equipo?). Sin esta regla, es imposible implementar el endpoint.
- **Borrado en cascada / huérfanos**: MongoDB no tiene claves foráneas con cascada automática. Si se elimina un Usuario, ¿qué pasa con los Partidos que creó, los Equipos donde era capitán, o los mensajes pendientes donde era emisor/receptor? Esto hay que resolverlo a nivel de lógica de negocio (o decidir que el borrado de usuario siempre es soft-delete, nunca físico, para evitar el problema).

**> Estado: parcialmente resuelto.**
- Cupo de partido y coherencia equipo–partido: confirmado que son validaciones de service, no de modelo — quedaron como comentarios en `partidoModel.js`/`equipoModel.js` a modo de recordatorio. Se unificó el nombre del campo a `jugadores_por_equipo` en ambas colecciones.
- Transferencia de titularidad: se define como elección manual entre los jugadores actualmente inscriptos en el partido (documentado en `propuesta.md` y en el comentario de `creador` en `partidoModel.js`).
- Borrado en cascada: **sigue pendiente de decisión** — ver la sección dedicada más abajo, con las opciones para que lo definan como equipo.

## 7. Exposición de datos sensibles

`password` (y el resto de campos sensibles) no tiene ninguna protección declarada. Al construir el schema de Mongoose conviene marcar `password: { type: String, select: false }` para que nunca se devuelva por defecto en una consulta, sumado a un `toJSON`/`toObject` transform que lo excluya explícitamente en las respuestas de la API. Esto es más crítico todavía si en el punto 3 se confirma que `jugadores_equipo1/2` embebe objetos Usuario completos: eso filtraría hashes de contraseña en cualquier endpoint que devuelva un partido.

De paso, conviene definir qué campos de un perfil son públicos al usar "Ver otros perfiles" (caso de uso "j") — presumiblemente nombre, apellido y estadísticas, pero no mail/teléfono — porque hoy no hay ninguna distinción de visibilidad en el modelo.

**> Resuelto.** Regla confirmada por el equipo: de un Jugador, todos los campos son públicos excepto `password` e `historial`. `password` se protege a nivel de schema (`select: false`, ejemplo incluido en `usuarioModel.js`). `historial` **no** se puede resolver a nivel de schema porque depende de quién pide el perfil (el dueño sí lo ve, un tercero no) — queda documentado que esa proyección se decide en el controller/service según el usuario autenticado.

## 8. Tipos de datos y validaciones débiles

- `telefono: Number` — guardar teléfonos como número es un error común: se pierden ceros a la izquierda, no se puede representar bien un "+", y no permite validar formato con una expresión regular. Debería ser `String` con validación de formato.
- No se mencionan restricciones de unicidad (`username`, `mail`) ni case-insensitivity para el login. Conviene `unique: true` + normalizar a minúsculas antes de guardar/comparar.
- Ninguna colección declara `timestamps: true` (createdAt/updatedAt), salvo Mensajería que tiene `fecha_creacion` manual. Tenerlos automáticos ayuda a ordenar historiales y es prácticamente gratis con Mongoose.
- El documento de campos no especifica reglas de validación (formato de mail, fecha futura obligatoria para `fecha_horario`, longitud mínima de contraseña, rango real de `calificacion`, etc.), pero el parcial pide explícitamente documentar "para cada campo... validaciones y reglas" (punto 8) y CRUD "con sus respectivas validaciones" (punto 3). Conviene completar esa tabla de validaciones junto con el modelo, no después.

**> Resuelto.** `telefono` pasa a `String`. `username`/`mail` quedan documentados como `unique` + `lowercase`. Se agregó `timestamps: true` a Usuario, Partido y Equipo (Mensajería mantiene sus campos manuales `fecha_creacion`/`fecha_respuesta`, que tienen un significado propio distinto de un timestamp genérico). Se agregaron notas de validación puntuales en cada boceto (fecha futura en `fecha_horario`, enums de `TAMANIOS_EQUIPO`, etc.); falta todavía escribir las reglas finas (formato exacto de mail, longitud mínima de contraseña) cuando se traduzca esto a schemas reales de Mongoose.

## 9. Puntos a resolver para alinear con la consigna del parcial

Repasando los requisitos obligatorios del backend contra el estado actual:

- **Colecciones (mínimo 4)**: cumplido (Usuario, Partido, Equipo, Mensajería), incluso si "Lugar" termina siendo colección aparte.
- **Roles (mínimo 2: Usuario Final / Administrador)**: cumplido en el papel, pero falta el mecanismo técnico de diferenciación (punto 1) y una matriz explícita de permisos por endpoint y por rol — el enunciado pide expresamente que el grupo determine "los permisos y restricciones de cada rol sobre los casos de uso", así que vale la pena convertir la sección de "casos de uso" en una tabla rol × acción × endpoint antes de programar.
- **CRUD completo con validaciones (al menos una entidad)**: hay que elegir explícitamente cuál entidad (probablemente Partido o Equipo) y diseñar el Delete con la semántica que se decida en el punto 4.
- **JWT**: no hay definición todavía de expiración de token, refresh o logout — no es obligatorio en el enunciado, pero conviene decidirlo como equipo para la defensa oral, ya que la Etapa 2 evalúa comprensión profunda de lo implementado.

**> Actualizado según feedback del equipo:**
- La matriz de permisos por rol/endpoint queda como próximo paso (no bloquea el modelo de datos), a resolver junto con los casos de uso al empezar la programación.
- El CRUD completo se va a implementar sobre varias entidades, no solo la mínima requerida.
- Se confirmó que el borrado lógico (`estado: eliminado`) lo puede disparar Admin sobre Usuarios, Equipos, Partidos o Mensajería, **y además** el propio sistema de forma automática cuando un Lugar rechaza un Partido en `pendiente_aprobacion` (ver punto 4). Esto ya quedó reflejado en `propuesta.md` (nuevo ítem `p` en los casos de uso de Admin) y en las transiciones de estado de `partidoModel.js`.
- JWT: confirmado que es para sesión/autenticación de login, con el "tipo" del usuario viajando en el payload del token para que el middleware de autorización pueda diferenciar Jugador/Lugar/Admin en cada endpoint. Se implementa junto con el mecanismo de discriminators del punto 1.

---

## Pendiente de decisión: borrado en cascada

Este es el único punto que no se resolvió todavía porque el equipo pidió explícitamente más información antes de elegir. Como ya está decidido que **todo borrado es lógico** (campo `estado`, nunca se elimina un documento de la base), el problema de "huérfanos" que tienen las bases relacionales con `DELETE` físico se reduce bastante, pero no desaparece del todo. Estas son las opciones:

**Opción A — No hacer nada especial (recomendada para el alcance de este proyecto).**
Como nada se borra físicamente, un Usuario con `estado: "eliminado"` sigue existiendo y se lo puede seguir referenciando desde Partidos, Equipos o Mensajería sin romper nada a nivel de base de datos. Lo único que hay que resolver es a nivel de API/UI: por ejemplo, que un Lugar o Jugador con `estado: "eliminado"` no aparezca en búsquedas ni pueda ser invitado a partidos nuevos, y que si se popula un `creador` o `capitan` eliminado, el frontend pueda mostrar algo como "usuario dado de baja" en vez de romper. Es la opción más simple y la que menos código nuevo requiere, porque aprovecha que ya decidieron soft-delete en todos lados.

**Opción B — Cascada manual explícita en la capa de servicio.**
Cuando se da de baja (lógicamente) a un Usuario, además de cambiar su `estado`, el service recorre sus relaciones activas y actúa sobre ellas: por ejemplo, si era capitán de un Equipo, reasignar capitán o marcar el equipo como necesitando uno nuevo; si era creador de Partidos futuros, notificar y aplicar la misma regla de transferencia de titularidad del punto 6. Da un resultado más prolijo y consistente para quien usa la app, pero es bastante más código y más casos borde para probar (¿y si no queda nadie a quien transferirle el equipo?).

**Opción C — Borrado físico real, pero limitado a un caso puntual.**
Si en algún momento necesitan un "borrar de verdad" (por ejemplo, para cumplir un pedido explícito de un usuario de eliminar su cuenta y todos sus datos), se puede implementar aparte como una operación especial y poco frecuente, usando un hook de Mongoose (`pre('findOneAndDelete')`) que dispare la limpieza de referencias en ese momento puntual. No hace falta para el alcance del parcial (no hay ningún caso de uso que lo pida), pero queda anotado por si surge.

**Sugerencia**: arrancar con la Opción A (ya es coherente con la decisión de soft-delete que tomaron) y, si en la práctica aparece un caso donde de verdad haga falta reasignar cosas automáticamente al eliminar un usuario, migrar puntualmente a la Opción B para ese caso — no hace falta resolver los tres a la vez ahora.

---

## Estado de implementación (Mongoose real)

Los 4 modelos, `src/config/constantes.js`, `src/config/db.js` y un `src/index.js` mínimo ya
están escritos en código real de Mongoose (no bocetos). Node solo verificó la sintaxis de los
archivos (`node --check`); todavía no se pudo instalar `mongoose`, `dotenv` ni `bcryptjs` porque
el registro de npm está bloqueado desde esta sesión (403 `blocked-by-allowlist`), así que falta
correr `npm install mongoose dotenv bcryptjs` manualmente antes de poder levantar el servidor.
Tampoco existe todavía el cluster de MongoDB Atlas -> `MONGO_URI` en `.env` está vacía a propósito.
