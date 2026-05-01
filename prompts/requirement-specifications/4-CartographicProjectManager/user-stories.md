## HU-01 — Autenticación de usuarios

**Historia de usuario:**

Como usuario del sistema, quiero poder iniciar sesión con mis credenciales para acceder a mis proyectos y tareas según mi rol.

**Criterios de aceptación:**

- Se debe validar usuario y contraseña.
- Los permisos deben aplicarse automáticamente según el rol.
- El sistema debe mantener la sesión activa durante un periodo configurable.
- El sistema debe mostrar un mensaje de error ante credenciales inválidas.

**Prioridad:** Alta

---

## HU-02 — Creación de proyectos

**Historia de usuario:**

Como administrador, quiero crear nuevos proyectos con toda su información para gestionar su desarrollo y asignarlos a clientes.

**Criterios de aceptación:**

- Solo el administrador puede crear proyectos.
- Los proyectos deben incluir todos los campos definidos (código, cliente, tipo, fechas, coordenadas, etc.). Podría faltar algún campo, pero se debe confirmar que dicho campo no está relleno en el momento de aceptar, y permitir completarlo posteriormente.
- Se debe generar automáticamente una carpeta vinculada en Dropbox. O en cambio, se puede disponer de una carpeta creada en Dropbox que se le asigna al proyecto.
- El proyecto debe quedar visible para el cliente asignado.

**Prioridad:** Alta

---

## HU-03 — Asignación de proyectos a clientes

**Historia de usuario:**

Como administrador, quiero asignar un proyecto a un cliente específico para establecer su relación de trabajo.

**Criterios de aceptación:**

- El proyecto debe vincularse a un cliente registrado.
- El cliente solo podrá ver proyectos que le fueron asignados.
- La asignación debe registrarse en la base de datos.
- Se debe notificar al cliente sobre la asignación.

**Prioridad:** Alta

---

## HU-04 — Vinculación de usuarios especiales a proyectos

**Historia de usuario:**

Como administrador, quiero vincular usuarios especiales a proyectos concretos con permisos personalizados para colaboración limitada.

**Criterios de aceptación:**

- El administrador puede definir permisos por usuario especial.
- Un usuario especial solo accede a los proyectos asignados.
- Los permisos pueden ser: visualización, descarga, edición limitada, etc.
- El sistema debe respetar las restricciones en cada acción.

**Prioridad:** Media

---

## HU-05 — Visualización de proyectos asignados

**Historia de usuario:**

Como cliente, quiero ver únicamente los proyectos que me fueron asignados para gestionar mis tareas y entregas.

**Criterios de aceptación:**

- El cliente solo visualiza proyectos propios.
- Los proyectos deben mostrar información básica: código, nombre, fechas, estado.
- La lista debe estar ordenada (por fecha de entrega, por cliente, por fecha de creación, etc.).
- Cada proyecto debe permitir acceso rápido a sus tareas y mensajes.

**Prioridad:** Alta

---

## HU-06 — Creación de tareas por el administrador

**Historia de usuario:**

Como administrador, quiero crear tareas para los clientes dentro de un proyecto con descripciones, fechas y prioridad.

**Criterios de aceptación:**

- El administrador puede asignar tareas a cualquier usuario.
- Las tareas deben incluir: descripción, estado, prioridad, fecha límite y archivos opcionales.
- Se deben asociar a un proyecto.
- El usuario destinatario recibe una notificación automática.

**Prioridad:** Alta

---

## HU-07 — Creación de tareas por el cliente

**Historia de usuario:**

Como cliente, quiero crear tareas dirigidas al administrador para solicitar entregas o revisiones.

**Criterios de aceptación:**

- El cliente puede crear tareas dirigidas al administrador o a terceros que estén dados de alta en el proyecto.
- La tarea incluye descripción, fecha límite y archivos opcionales.
- Se genera notificación automática al administrador.
- El cliente puede eliminar solo tareas que haya creado.

**Prioridad:** Alta

---

## HU-08 — Modificación y eliminación de tareas

**Historia de usuario:**

Como cliente, quiero modificar o eliminar mis tareas creadas para mantener la información actualizada.

**Criterios de aceptación:**

- El cliente puede editar tareas creadas por él o por terceros dentro del proyecto.
- Solo puede eliminar tareas propias.
- Las modificaciones deben registrarse en el historial de la tarea.
- Se deben enviar notificaciones sobre todos los cambios.

**Prioridad:** Media

---

## HU-09 — Cambios de estado en tareas

**Historia de usuario:**

Como usuario, quiero actualizar el estado de mis tareas para reflejar su progreso real.

**Criterios de aceptación:**

- Los estados válidos son: pendiente, en progreso, parcial, realizada, completada.
- Solo el destinatario puede marcar una tarea como completada.
- El cambio de estado debe registrarse y notificar al creador.
- Las tareas finalizadas deben requerir confirmación del destinatario.

**Prioridad:** Alta

---

## HU-10 — Adjuntar archivos a tareas

**Historia de usuario:**

Como usuario, quiero poder adjuntar archivos técnicos a las tareas para compartir documentación relacionada.

**Criterios de aceptación:**

- Los archivos deben almacenarse en la carpeta del proyecto en Dropbox (/DROPBOX/.../XX_Proyecto/00-Registro/01-Recibidos).
- Se deben permitir formatos PDF, KML, SHP, DWG, IFC, 3DS, imágenes y documentos.
- El sistema debe validar tamaño y formato antes de subir.
- El destinatario debe poder descargar los archivos adjuntos.

**Prioridad:** Alta

---

## HU-11 — Mensajería interna por proyecto

**Historia de usuario:**

Como usuario, quiero intercambiar mensajes dentro de cada proyecto para comunicar avances o resolver dudas.

**Criterios de aceptación:**

- Cada mensaje pertenece a un proyecto.
- Puede incluir texto y archivos adjuntos.
- Los mensajes deben mostrar el remitente y la fecha.
- Deben existir indicadores de mensajes no leídos.

**Prioridad:** Alta

---

## HU-12 — Notificaciones automáticas

**Historia de usuario:**

Como usuario, quiero recibir notificaciones automáticas cuando se produzcan eventos importantes para mantenerme informado.

**Criterios de aceptación:**

- Notificaciones por: mensajes, tareas nuevas, cambios de estado, archivos recibidos.
- Se deben mostrar dentro de la aplicación.
- Debe existir opción de recibirlas por WhatsApp.
- Las notificaciones deben marcarse como leídas al ser vistas.

**Prioridad:** Alta

---

## HU-13 — Integración con Dropbox

**Historia de usuario:**

Como usuario, quiero que los archivos del proyecto estén sincronizados con Dropbox para garantizar almacenamiento seguro y accesible.

**Criterios de aceptación:**

- Cada proyecto debe tener su carpeta en Dropbox.
- Los archivos deben subirse y descargarse desde la aplicación.
- Los enlaces deben ser seguros y privados.
- El sistema debe actualizar automáticamente los archivos compartidos.

**Prioridad:** Alta

---

## HU-14 — Pantalla principal de proyectos

**Historia de usuario:**

Como usuario, quiero una pantalla principal con resumen de todos los proyectos para tener una visión global de su estado.

**Criterios de aceptación:**

- Debe listar proyectos con código, fechas y estado.
- Colores: rojo (tareas pendientes), verde (sin tareas pendientes).
- Contador de mensajes no leídos por proyecto.
- Acceso directo al detalle del proyecto.

**Prioridad:** Media

---

## HU-15 — Vista de calendario

**Historia de usuario:**

Como usuario, quiero una vista de calendario con todos los proyectos para visualizar fechas de entrega y plazos fácilmente.

**Criterios de aceptación:**

- Debe mostrar proyectos por fecha de entrega.
- Colores coherentes con la pantalla principal.
- Debe permitir navegar por meses y años.
- Clic sobre un proyecto abre su detalle.

**Prioridad:** Media

---

## HU-16 — Finalización de proyectos

**Historia de usuario:**

Como administrador, quiero marcar proyectos como finalizados para mantener el control de los que ya fueron completados.

**Criterios de aceptación:**

- Un proyecto puede finalizarse cuando no tenga tareas pendientes o manualmente por el administrador.
- Los proyectos finalizados quedan accesibles en modo lectura, con opción de poder reactivarse manualmente por el administrador.
- Debe registrarse la fecha de finalización.
- Se notificará al cliente la finalización del proyecto.

**Prioridad:** Alta

---

## HU-17 — Permisos de usuario especial

**Historia de usuario:**

Como usuario especial, quiero acceder solo a los proyectos y archivos autorizados por el administrador para respetar las restricciones de acceso.

**Criterios de aceptación:**

- Solo puede ver proyectos asignados.
- Permisos definidos individualmente (ver, descargar, editar).
- Acceso denegado si intenta exceder sus permisos (se notifica al administrador).
- Debe recibir notificaciones sobre cambios que le afecten.

**Prioridad:** Media

---

## HU-18 — Visualización responsive

**Historia de usuario:**

Como usuario, quiero poder acceder desde cualquier dispositivo (web, móvil o tablet) con una interfaz adaptada.

**Criterios de aceptación:**

- La interfaz debe adaptarse automáticamente al tamaño de pantalla.
- Debe conservar la funcionalidad completa en móviles.
- Los cambios deben sincronizarse en tiempo real.
- Debe mantener rendimiento óptimo.

**Prioridad:** Media

---

## HU-19 — Exportación de datos

**Historia de usuario:**

Como administrador, quiero exportar la información de proyectos y tareas para respaldo o análisis externo.

**Criterios de aceptación:**

- Debe permitir exportar datos en formatos estándar (CSV, PDF, etc.).
- Solo el administrador puede usar esta función.
- Debe incluir filtros por cliente, proyecto o rango de fechas.
- Los archivos exportados deben generarse correctamente.

**Prioridad:** Baja

---

## HU-20 — Sistema de backup y recuperación

**Historia de usuario:**

Como administrador, quiero disponer de un sistema de respaldo y restauración de información para evitar pérdida de datos.

**Criterios de aceptación:**

- Debe realizar copias automáticas periódicas.
- Debe poder restaurar información de un backup.
- Las copias deben incluir proyectos, tareas y mensajes.
- El sistema debe alertar sobre fallos de copia.

**Prioridad:** Media

---

## Resumen de historias

| ID | Título | Prioridad |
| --- | --- | --- |
| HU-01 | Autenticación de usuarios | Alta |
| HU-02 | Creación de proyectos | Alta |
| HU-03 | Asignación de proyectos a clientes | Alta |
| HU-04 | Vinculación de usuarios especiales a proyectos | Media |
| HU-05 | Visualización de proyectos asignados | Alta |
| HU-06 | Creación de tareas por el administrador | Alta |
| HU-07 | Creación de tareas por el cliente | Alta |
| HU-08 | Modificación y eliminación de tareas | Media |
| HU-09 | Cambios de estado en tareas | Alta |
| HU-10 | Adjuntar archivos a tareas | Alta |
| HU-11 | Mensajería interna por proyecto | Alta |
| HU-12 | Notificaciones automáticas | Alta |
| HU-13 | Integración con Dropbox | Alta |
| HU-14 | Pantalla principal de proyectos | Media |
| HU-15 | Vista de calendario | Media |
| HU-16 | Finalización de proyectos | Alta |
| HU-17 | Permisos de usuario especial | Media |
| HU-18 | Visualización responsive | Media |
| HU-19 | Exportación de datos | Baja |
| HU-20 | Sistema de backup y recuperación | Media |