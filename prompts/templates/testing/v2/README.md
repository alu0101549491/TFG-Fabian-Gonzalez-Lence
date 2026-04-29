# Prompts de Testing E2E — V2

## Descripción

> ⚠️ **Nota importante:** Esta carpeta **no contiene plantillas genéricas reutilizables**. Contiene los **prompts reales** utilizados durante la fase de testing del proyecto **4 — Cartographic Project Manager (CARTO)**, diseñados como un flujo de testing E2E en 2 fases con **Playwright**.

Los prompts son operativos y están adaptados directamente al contexto de CARTO (TypeScript 5.x, Vue.js 3, Pinia, Vue Router, Socket.io, Axios, autenticación JWT, roles ADMINISTRATOR/CLIENT/SPECIAL_USER).

## Contenido

| Fichero | Fase | Descripción |
|---|---|---|
| `test-scenario-template.md` | Fase 1 | El agente analiza los diagramas de casos de uso y el codebase de CARTO para generar el documento `E2E_TEST_SCENARIOS.md` con todos los escenarios de test (AUTH, PROJ, TASK, MSG, FILE, NOTIF, CAL, BACK…), con precondiciones, pasos detallados, resultados esperados y matriz de prioridad. |
| `test-implementation-template.md` | Fase 2 | Siguiendo el documento de escenarios de la Fase 1, el agente genera los **ficheros de test Playwright** completos: configuración, Page Object Models, fixtures de autenticación, helpers, datos de prueba y tests organizados por prioridad (critical/high/medium/low). |

## Proyectos en los que se aplicó

| Proyecto | IA Tester | Observación |
|---|---|---|
| 4 — Cartographic Project Manager | GitHub Copilot (GPT-5.4) | Prompts originales guardados aquí |
| 5 — Tennis Tournament Manager | GitHub Copilot (GPT-5.4) | El agente IA tomó estos prompts como base para generar los escenarios e implementaciones de testing específicos de TENNIS; no se creó un conjunto de prompts independiente |
