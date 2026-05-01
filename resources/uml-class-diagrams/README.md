# UML Class Diagrams

This directory contains the UML class diagrams generated for the five projects developed as part of the TFG *"Análisis de Capacidades de la IA en la Generación Semiautomática de Aplicaciones Complejas"* (ULL, 2025–2026).

## Purpose

Class diagram generation was treated as a design experiment: for each project, one diagram was produced per formalization level of the requirement specification, using the corresponding requirements document as the prompt input to the AI Architect model. The goal was to evaluate how the degree of formalization in the requirements influenced the structure and quality of the generated design.

## Structure

Each subdirectory corresponds to one project and contains 3 diagram files, each generated from a different formalization level of the requirements:

| File | Source format | Description |
|---|---|---|
| `informal.md` | Informal requirements | Class diagram generated from a free-prose description of the application |
| `semiformal.md` | Semi-formal requirements | Class diagram generated from a structured template with sections for goals, actors, features and constraints |
| `lnc.md` | Controlled Natural Language (EARS) | Class diagram generated from EARS-syntax requirements with explicit triggers and conditions |
| `user-stories.md` | User Stories | Class diagram generated from agile-style user stories (HU-XX format), used for the two most complex projects |

Each file records the full conversation with the AI model, including the initial diagram and any subsequent revisions requested during the session.

### Projects

| Directory | Project | Third format |
|---|---|---|
| `1-TheHangmanGame/` | The Hangman Game | LNC / EARS |
| `2-MusicWebPlayer/` | Music Web Player | LNC / EARS |
| `3-MiniBalatro/` | Mini Balatro | LNC / EARS |
| `4-CartographicProjectManager/` | Cartographic Project Manager | User Stories |
| `5-TennisTournamentManager/` | Tennis Tournament Manager | User Stories |

Projects 1–3 use EARS because they were internally defined and suited to a formal, trigger-based specification style. Projects 4–5 originated from real external clients whose requirements were expressed in natural language, making user stories a more appropriate formalization choice.

## Usage in the TFG

These diagrams were produced by the AI Architect model (Claude Sonnet) and later compared and analysed to study how the formalization level of the input requirements affects the resulting class structure. The experiment and its results are discussed in chapters 6 (*Diseño de los Proyectos*) of the written report.
