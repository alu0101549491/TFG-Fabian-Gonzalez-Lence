# Prompts de Revisión de Código — V2

## Descripción

> ⚠️ **Nota importante:** Esta carpeta **no contiene plantillas genéricas reutilizables**. Contiene los **prompts reales** utilizados durante el proceso de revisión de código del proyecto **4 — Cartographic Project Manager (CARTO)**, diseñados como un flujo de revisión estructurado en 3 fases.

Estos prompts fueron desarrollados para el **"IA Revisor 2.0"** y están específicamente orientados a la arquitectura y stack tecnológico de CARTO (TypeScript 5.x, Vue.js 3, Pinia, Vue Router, Socket.io, Axios). No son plantillas genéricas vacías sino prompts operativos completos y ejecutables tal cual.

## Contenido

| Fichero | Fase | Descripción |
|---|---|---|
| `todo-list-review-template.md` | Fase 1 | El agente IA analiza todo el codebase de CARTO y genera una **TODO List** organizando todos los ficheros en grupos lógicos de revisión por capa y módulo, con prioridad y complejidad estimada. |
| `report-review-template.md` | Fase 2 | Siguiendo la TODO List generada en la Fase 1, el agente revisa sistemáticamente cada grupo y genera un **Informe de Incidencias** con todos los problemas encontrados clasificados por severidad (🔴 Crítico, 🟠 Alto, 🟡 Medio, 🟢 Bajo). |
| `incident-fix-review-template.md` | Fase 3 | El agente analiza el informe de la Fase 2 y aplica **todas las correcciones** de forma ordenada (crítico → alto → medio → bajo), verificando cada fix y generando un informe de resolución final. |

## Proyectos en los que se aplicó

| Proyecto | IA Revisora | Observación |
|---|---|---|
| 4 — Cartographic Project Manager | GitHub Copilot (GPT-5.4) | Prompts reales guardados aquí |
| 5 — Tennis Tournament Manager | GitHub Copilot (GPT-5.4) | Mismos prompts adaptados al contexto de TENNIS |

> Para TENNIS se reutilizaron estos mismos prompts realizando las adaptaciones necesarias (nombre del proyecto, stack específico, descripción de la arquitectura), por lo que no se generó una carpeta `v3/` separada.
