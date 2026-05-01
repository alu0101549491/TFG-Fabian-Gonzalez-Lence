# Requirement Specifications

This directory contains the requirement specification documents generated for the five projects developed as part of the TFG *"Análisis de Capacidades de la IA en la Generación Semiautomática de Aplicaciones Complejas"* (ULL, 2025–2026).

## Purpose

Requirement specification was treated as an experiment in itself: for each project, multiple formalization levels were produced and used as input prompts to the AI Architect model. The goal was to evaluate how the degree of formalization in the requirements influenced the quality of the generated design and code.

## Structure

Each subdirectory corresponds to one project and contains 2–3 specification files, each representing a different formalization level:

| File | Format | Description |
|---|---|---|
| `informal.md` | Informal | Free-prose description of the application's features and objectives |
| `semiformal.md` | Semi-formal | Structured template with sections for goals, actors, features and constraints |
| `lnc.md` | Controlled Natural Language (EARS) | Requirements written using the EARS syntax (*Easy Approach to Requirements Syntax*), with explicit triggers and conditions |
| `user-stories.md` | User Stories | Agile-style user stories (HU-XX format) with acceptance criteria and priority, used for the two most complex projects |

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

These documents were fed directly to the AI Architect model (Claude Sonnet) as input context for architecture and design generation. The experiment and its results are discussed in chapters 6 (*Arquitectura y Diseño*) and 8 (*Resultados y Análisis*) of the written report.
