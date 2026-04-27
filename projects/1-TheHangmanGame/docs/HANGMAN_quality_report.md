# The Hangman Game — ISO/IEC 25010 Quality Report

**Date:** 2026-04-27
**Analyst:** GitHub Copilot Code Quality Agent
**Standard:** ISO/IEC 25010 (SQuaRE) + SonarQube rule alignment
**Application Complexity Tier:** Basic
**Files Reviewed:** 11 source TS files (9 test files, 6 configuration files)

---

## Executive Summary

The Hangman project is a well-engineered, production-ready educational game that demonstrates strong software-engineering fundamentals proportional to its Basic complexity tier. The MVC architecture is correctly implemented with clear separation between models, views, controllers, and rendering helpers; dependency injection enables a robust suite of unit tests achieving ~82% line coverage. All eleven TypeScript source files include the TFG header template, ESLint enforces the Google Style Guide, and no security vulnerabilities or functional bugs were detected. The principal quality gaps are confined to maintainability — magic numbers in canvas coordinates, four near-duplicated limb-drawing methods, scattered hardcoded UI strings — plus the absence of a global error handler and integration coverage for [src/main.ts](projects/1-TheHangmanGame/src/main.ts). Overall quality is acceptable for production deployment with only minor housekeeping recommended.

---

## Quality Characteristic Ratings

| Characteristic | Sub-characteristics evaluated | Rating | Confidence |
|---|---|---|---|
| Functional Suitability | Completeness, Correctness, Appropriateness | 🟢 | High |
| Performance Efficiency | Time Behaviour, Resource Utilisation, Capacity | 🟢 | Medium |
| Compatibility | Co-existence, Interoperability | 🟢 | High |
| Usability | Recognisability, Learnability, Operability, Accessibility, Error Protection | 🟢 | Medium |
| Reliability | Maturity, Availability, Fault Tolerance, Recoverability | 🟡 | Medium |
| Security | Confidentiality, Integrity, Authenticity | 🟢 | High |
| Maintainability | Modularity, Reusability, Analysability, Modifiability, Testability | 🟢 | High |
| Portability | Adaptability, Installability, Replaceability | 🟢 | High |

> Reliability is rated 🟡 only because there is no `window.onerror`/`unhandledrejection` fallback and `main.ts` itself is excluded from coverage; runtime behaviour is otherwise sound.

---

## Full Incident List

- [ ] [HANGMAN-QA-001] [View] [src/views/hangman-renderer.ts](projects/1-TheHangmanGame/src/views/hangman-renderer.ts) — Magic numbers scattered across canvas drawing methods (50, 200, 125, 350, 30, 210, 290, …) | 🟡 MAJOR
- [ ] [HANGMAN-QA-002] [Model] [src/models/guess-result.ts](projects/1-TheHangmanGame/src/models/guess-result.ts) — File header lacks `@author` tag (only `@since`) | 🔵 MINOR
- [ ] [HANGMAN-QA-003] [View] [src/views/hangman-renderer.ts](projects/1-TheHangmanGame/src/views/hangman-renderer.ts) — Code duplication: `drawLeftArm`/`drawRightArm`/`drawLeftLeg`/`drawRightLeg` follow identical pattern (DRY violation) | 🔵 MINOR
- [ ] [HANGMAN-QA-004] [View] [src/views/message-display.ts](projects/1-TheHangmanGame/src/views/message-display.ts) — Hardcoded UI strings ("You Won!", "You Lost.", "Attempts: ") not centralised | 🔵 MINOR
- [ ] [HANGMAN-QA-005] [Entry] [src/main.ts](projects/1-TheHangmanGame/src/main.ts) — Missing global `error` / `unhandledrejection` listeners; uncaught exceptions silently fail | 🔵 MINOR
- [ ] [HANGMAN-QA-006] [Tests] [src/main.ts](projects/1-TheHangmanGame/src/main.ts) — No integration test for the entry point (excluded from Jest coverage) | 🔵 MINOR

---

## Detailed Findings by Quality Characteristic

### 1. Functional Suitability
**Rating:** 🟢 GOOD
**Assessed sub-characteristics:** Completeness, Correctness, Appropriateness

#### Notes
The full gameplay loop (word selection, letter guessing, win/lose detection, attempt tracking) is implemented and verified by 9 test suites. `GuessResult` enumerates all gameplay outcomes; `GameModel.guessLetter()` validates input via regex (`/^[a-zA-Z]$/`). No functional defects detected.

---

### 2. Performance Efficiency
**Rating:** 🟢 GOOD | **Confidence:** Medium
DOM updates batched via `DocumentFragment`; canvas drawing is O(1) per frame; word lookup is O(n) over a small dictionary. No memory leaks observed (Canvas API; no event listener accumulation).

---

### 3. Compatibility
**Rating:** 🟢 GOOD
ES2020 target, Canvas API, no platform-specific code, GitHub Pages-ready Vite base path.

---

### 4. Usability
**Rating:** 🟢 GOOD | **Confidence:** Medium
Bulma CSS provides clear visual hierarchy; alphabet buttons disable after use; message display gives explicit feedback. ARIA attributes were not exhaustively reviewed against WCAG 2.1 — confidence Medium for Accessibility.

---

### 5. Reliability
**Rating:** 🟡 NEEDS WORK

#### Findings
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| HANGMAN-QA-005 | [src/main.ts](projects/1-TheHangmanGame/src/main.ts) | Bootstrap | No global error handler (ISO/IEC 25010 §6.3 Fault Tolerance) | 🔵 MINOR |
| HANGMAN-QA-006 | [src/main.ts](projects/1-TheHangmanGame/src/main.ts) | Coverage | Entry point excluded from Jest, no integration test | 🔵 MINOR |

---

### 6. Security
**Rating:** 🟢 GOOD
No `eval()`, no `innerHTML` for user input (uses `textContent`), no external API calls, no secrets in source. JSON dictionary import only.

---

### 7. Maintainability
**Rating:** 🟢 GOOD

#### Findings
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| HANGMAN-QA-001 | [src/views/hangman-renderer.ts](projects/1-TheHangmanGame/src/views/hangman-renderer.ts) | drawing methods | Magic numbers (canvas coordinates) — SonarQube `typescript:S109` | 🟡 MAJOR |
| HANGMAN-QA-003 | [src/views/hangman-renderer.ts](projects/1-TheHangmanGame/src/views/hangman-renderer.ts) | drawLeftArm/Right/Leg/Leg | Duplicated drawing pattern — SonarQube `common-ts:DuplicatedBlocks` | 🔵 MINOR |
| HANGMAN-QA-004 | [src/views/message-display.ts](projects/1-TheHangmanGame/src/views/message-display.ts) | render methods | Hardcoded user-facing strings — SonarQube `typescript:S1192` | 🔵 MINOR |
| HANGMAN-QA-002 | [src/models/guess-result.ts](projects/1-TheHangmanGame/src/models/guess-result.ts) | header | Missing `@author` field in TFG header | 🔵 MINOR |

---

### 8. Portability
**Rating:** 🟢 GOOD
Stateless logic, no platform-specific APIs, Vite handles base path for GitHub Pages.

---

## SonarQube-Category Summary

| Category | Count | Notable examples |
|---|---|---|
| Bugs | 0 | — |
| Vulnerabilities | 0 | — |
| Code Smells | 4 | HANGMAN-QA-001 (magic numbers), HANGMAN-QA-003 (duplication), HANGMAN-QA-004 (string literals), HANGMAN-QA-002 (header) |
| Coverage Gaps | 2 | HANGMAN-QA-005, HANGMAN-QA-006 |

---

## Style Guide Compliance (Google Style Guide + TFG Standards)
**Overall:** Compliant

| Rule | Status | Files affected |
|---|---|---|
| TFG file header present and complete | ⚠️ | 1 (guess-result.ts missing `@author`) |
| Explicit access modifiers on class members | ✅ | 0 violations |
| TSDoc/JSDoc on all public APIs | ✅ | 0 violations (90 %+) |
| `camelCase` / `PascalCase` naming conventions | ✅ | 0 violations |
| No magic numbers / magic strings | ⚠️ | 2 (HangmanRenderer, MessageDisplay) |
| Consistent import ordering | ✅ | 0 violations |

---

## Summary Statistics
- Total source files reviewed: 11
- 🔴 Blockers: 0
- 🟠 Critical: 0
- 🟡 Major: 1
- 🔵 Minor: 5
- Total incidents: 6
- **Overall Quality Score:** 🏆 GOOD

> Coordination: All findings are routed to the Coding Agent — no architectural redesign needed. The Testing Agent should add an integration test for [src/main.ts](projects/1-TheHangmanGame/src/main.ts) (HANGMAN-QA-006).
