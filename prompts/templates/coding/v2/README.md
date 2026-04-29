# Prompts de Codificación — V2

## Descripción

> ⚠️ **Nota importante:** Esta carpeta **no contiene plantillas genéricas reutilizables**. Contiene los **prompts reales** utilizados durante el desarrollo del proyecto **5 — Tennis Tournament Manager (TENNIS)**, adaptados específicamente al contexto de dicho proyecto.

En el flujo V2, la **IA Desarrollador** es **GitHub Copilot con Claude Sonnet 4.5**, que trabaja directamente sobre el agente de codificación de VS Code con acceso al codebase.

## Contenido

| Fichero | Descripción |
|---|---|
| `planning-codification-template.md` | Prompt de **planificación previa** a la codificación. El agente genera el fichero `CODIFICATION-PROGRESS.md` con el plan completo de categorías, orden de dependencias e índice global de ficheros. No escribe código fuente en este paso. |
| `general-codification-template.md` | Prompt principal de **implementación iterativa**. El agente recorre las categorías del plan en orden, escribe el código fuente completo de cada fichero, actualiza el progreso en `CODIFICATION-PROGRESS.md` y registra los cambios en `CHANGES.md`. |

## Origen de los prompts

A diferencia de los proyectos V1 (donde se usaban plantillas genéricas rellenables), en V2 los prompts evolucionaron a conversaciones más contextualizadas. Los prompts de TENNIS se construyeron tomando como base la experiencia del proyecto **CARTO** (4 — Cartographic Project Manager), adaptando el enfoque al dominio del torneo de tenis y a la arquitectura Angular + TypeScript.

## Proyectos en los que se aplicó

| Proyecto | IA Desarrollador | Observación |
|---|---|---|
| 5 — Tennis Tournament Manager | GitHub Copilot (Claude Sonnet 4.5) | Prompts reales guardados aquí |

> **CARTO (proyecto 4)** también utilizó prompts V2, pero sus prompts de codificación no fueron guardados en esta carpeta al ser el primer proyecto V2 donde se fue explorando el flujo de trabajo.
