# Impresión general
Interface limpia y con multitud de opciones, aunque algo confusa en su
navegación. Configuración de torneos, cuadros y orden de juego bien,
aunque cuadros algo limitados en sus opciones de configuración.
Confusion respecto a los estados de encuentros, fases del torneos y
fechas. Visualización de encuentros algo pobre. En general es una buena
base de trabajo, pero al rascar un poco se ve que falta afinarla y hay
confusiones importantes que lo convierten poco usable en este estado.

Requisitos cubiertos ([X]), semicubiertos ([-]), desconocidos ([?]) y no cubiertos ([ ])
- [X] Posibilidad de de gestionar simultáneamente múltiples torneos de tenis

## Cubra todas las fases del torneo, incluyendo:
- [X] Alta y configuración de torneos
- [X] Alta e inscripción de participantes
- [X] Diseño de cuadros de juego
- [X] Diseño de orden de juego
- [X] Alta de resultados
- [X] Cálculo y publicación de clasificaciones
- [X] Publicación de comunicados
- [X] Envío de notificaciones ante nuevos resultados y comunicados
- [X] Estadísticas del torneo
* Características de la aplicación:
- [X] Aplicación web responsive, accesible desde ordenador y dispositivos móviles
- [X] Configurable la gama de colores, logotipos y menús
- [X] Interfaz web de administración de torneos, participantes y comunicados
- [ ] Notificaciones a participantes por email, Telegram o web push
- [ ] Notificaciones a administradores ante nuevos resultados, alta o modificación de participantes, nuevas inscripciones

## Características de los torneos:
- [-] Cada torneo puede contener varios cuadros
- [-] Distintos tipos de cuadros: Round Robbin, Eliminatorios, Match Play
- [-] Lista de jugadores participantes, incluyendo sus estados de entrada en el torneo
- [X] Generador y sorteo de cuadros
- [X] Generador de orden de juego
- [X] Generador de clasificaciones: basada en puntos o basada en ratios
- [X] Posibilidad de especificar normativa específica para cada cuadro

## Participantes pueden registrarse como usuarios del sistema, lo que les permite:
- [X] Inscribirse a torneos
- [?] Insertar ellos mismos inmediatamente sus resultados
- [X] Configurar perfil de usuario e indicar datos de contacto
- [ ] Ver los perfiles de usuario y datos de contactos de otros participantes registrados
- [?] Recibir notificaciones ante nuevos resultados y comunicaciones
- [?] Ver información personalizada sobre sus encuentros previstos y concluidos
- [?] Ver los comunicados no públicos exclusivos para registrados
- [?] Indicaciones personalizadas de número de resultados y alertas aún sin visualizar
- [?] Indicaciones personalizadas de sus resultados con otros participantes

## Características de los encuentros:
- [ ] Distintas modalidades de encuentros: 2 set mas supertiebreaks, 3 sets, sets a 4 ó 6 juegos
- [?] Incluye cancha o pista de juego
- [ ] Incluye comentarios del jugador sobre el encuentro
- [-] Contempla posibilidad de encuentros no finalizados: abandono, retirada, WO, Bye, ...
- [ ] Incluye posibilidad de indicar quien puso las bolas del encuentro
- [ ] Posibilidad de exportar los resultados

## Características de los comunicados:
- [X] Comunicados públicos y restringidos a usuarios registrados
- [X] Fecha de publicación y de caducidad
- [X] Incluye resumen y texto largo
- [X] Incluye asignación de etiquetas a comunicados
- [ ] Puede incluir una imagen y enlace en el comunicado

## Algunas anomalías o errores detectados:
- Colour Previews no parece hacer nada
- Problemas al añadir participantes externos si no hay categorías creadas
- Visualización de participantes registrados poco clara
- No es posible cambiar el estado de participantes a otro que no sea aceptado o rechazado
- Multiples ventanas algo confusas en cambio características de participantes registrados
- Visualización de encuentros pobre: faltas semillas, estado aceptación
- Generación de pdf de rondas pobre: faltan títulos, logo, mejor visualización de partidos
- Tipo de cuadros limitado y poco configurables
- Confuso que proveedor de bolas pueda cambiar por partido
- Navegación confusa, los backs no vuelven a pasos anteriores, y a veces no hay backs
- Confusión con BYE y participante TBD, permite programar partidos BYE
- No localizo como dar de alta pistas
- Confusión entre estado: Sheduled pero sin asignar horario, WO y RET pero sin especificar quien, estado Bye ¿?
- Deja hacer acciones contrarias al estado del torneo
- No puede tratar distintos tipos de marcadores mas que añadir sets
- Contadores iniciales parece no actualizarse bien
- No muestra logos en subpáginas
