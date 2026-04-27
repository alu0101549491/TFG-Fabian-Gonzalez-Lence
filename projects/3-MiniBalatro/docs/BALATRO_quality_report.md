# Mini Balatro — ISO/IEC 25010 Quality Report

**Date:** 2026-04-27
**Analyst:** GitHub Copilot Code Quality Agent
**Standard:** ISO/IEC 25010 (SQuaRE) + SonarQube rule alignment
**Application Complexity Tier:** Intermediate-Advanced
**Files Reviewed:** ~78 source files (15 test files, 6 configuration files)

---

## Executive Summary

Mini Balatro shows mature engineering for an Intermediate-Advanced game project: Clean MVC/domain layering, comprehensive poker-hand evaluation with strong unit-test backing, and an extensible joker/tarot/planet card system. Functional correctness of the scoring engine is verified by ~150 unit tests across hand-evaluator, score-calculator, and game-state, and the architectural decomposition (`models/poker`, `models/scoring`, `models/special-cards`, `services/persistence`) is faithful to the design. The most pressing quality risks are concentrated in the **persistence layer** — multiple `as any` casts, no version field in serialised state, and absence of transactional rollback during deserialisation can corrupt save files — and in the **single-responsibility violation** of [src/models/game/game-state.ts](projects/3-MiniBalatro/src/models/game/game-state.ts) (~800 LOC orchestrating deck, hand, joker, and consumable state). Accessibility is the secondary gap: card selection lacks keyboard support, React-component test coverage is effectively 0 % (jest excludes `src/views/**`), and there is no React Error Boundary. Overall the codebase is well structured but maintainability and accessibility require focused remediation before the project would be considered production-grade.

---

## Quality Characteristic Ratings

| Characteristic | Sub-characteristics evaluated | Rating | Confidence |
|---|---|---|---|
| Functional Suitability | Completeness, Correctness, Appropriateness | 🟢 | High |
| Performance Efficiency | Time Behaviour, Resource Utilisation | 🟢 | Medium |
| Compatibility | Co-existence, Interoperability | 🟢 | High |
| Usability | Operability, Accessibility, Error Protection | 🟡 | Medium |
| Reliability | Maturity, Fault Tolerance, Recoverability | 🟡 | Medium |
| Security | Confidentiality, Integrity | 🟢 | High |
| Maintainability | Modularity, Reusability, Analysability, Modifiability, Testability | 🟡 | High |
| Portability | Adaptability, Installability | 🟢 | High |

---

## Full Incident List

- [ ] [BALATRO-QA-001] [Persistence] [src/services/persistence/game-persistence.ts](projects/3-MiniBalatro/src/services/persistence/game-persistence.ts) — 4× `as any` casts in deserialisation (type safety defeated) | 🟠 CRITICAL
- [ ] [BALATRO-QA-002] [Game] [src/models/game/game-state.ts](projects/3-MiniBalatro/src/models/game/game-state.ts) — `debugForceBoss(bossType as any)` runtime cast | 🟠 CRITICAL
- [ ] [BALATRO-QA-003] [Persistence] [src/services/persistence/game-persistence.ts](projects/3-MiniBalatro/src/services/persistence/game-persistence.ts) — `deserializeGameState()` lacks rollback; partial failure → corrupt state | 🟠 CRITICAL
- [ ] [BALATRO-QA-004] [Game] [src/models/game/game-state.ts](projects/3-MiniBalatro/src/models/game/game-state.ts) — File ~800 LOC; multiple responsibilities (SRP violation) | 🟡 MAJOR
- [ ] [BALATRO-QA-005] [Poker] [src/models/poker/hand-evaluator.ts](projects/3-MiniBalatro/src/models/poker/hand-evaluator.ts) — Duplicated sort/group logic across 8 detection methods | 🟡 MAJOR
- [ ] [BALATRO-QA-006] [Scoring] [src/models/scoring/score-calculator.ts](projects/3-MiniBalatro/src/models/scoring/score-calculator.ts) — `calculateScore()` has 6 parameters + optional modifier; cyclomatic ≈ 12 | 🟡 MAJOR
- [ ] [BALATRO-QA-007] [View] [src/views/App.tsx](projects/3-MiniBalatro/src/views/App.tsx) — Callback handlers not wrapped in try/catch | 🟡 MAJOR
- [ ] [BALATRO-QA-008] [Blinds] [src/models/blinds/blind-generator.ts](projects/3-MiniBalatro/src/models/blinds/blind-generator.ts) — `Math.random()` not injected; non-deterministic for tests | 🟡 MAJOR
- [ ] [BALATRO-QA-009] [Shop] [src/services/shop/shop-item-generator.ts](projects/3-MiniBalatro/src/services/shop/shop-item-generator.ts) — Silent fallback to `ChipJoker` for unknown types | 🟡 MAJOR
- [ ] [BALATRO-QA-010] [Tarot] [src/models/special-cards/tarots/targeted-tarot.ts](projects/3-MiniBalatro/src/models/special-cards/tarots/targeted-tarot.ts) — `applyEffect()` switch lacks default with context | 🟡 MAJOR
- [ ] [BALATRO-QA-011] [Scoring] [src/models/scoring/score-calculator.ts](projects/3-MiniBalatro/src/models/scoring/score-calculator.ts) — `Math.floor()` blind-modifier rounding off-by-one risk | 🟡 MAJOR
- [ ] [BALATRO-QA-012] [Deck] [src/models/core/deck.ts](projects/3-MiniBalatro/src/models/core/deck.ts) — Fisher-Yates uses `Math.random()`; weak entropy (low risk) | 🟡 MAJOR
- [ ] [BALATRO-QA-013] [Types] [src/types/global.d.ts](projects/3-MiniBalatro/src/types/global.d.ts) — 9× `any` in callback/serialised types | 🔵 MINOR
- [ ] [BALATRO-QA-014] [View] [src/views/App.tsx](projects/3-MiniBalatro/src/views/App.tsx) — Dev globals `window.gameController/gameState` not type-safe | 🔵 MINOR
- [ ] [BALATRO-QA-015] [Game] [src/models/game/game-state.ts](projects/3-MiniBalatro/src/models/game/game-state.ts) — `debugForceBoss()` shipped in production | 🔵 MINOR
- [ ] [BALATRO-QA-016] [Utils] [src/utils/helpers.ts](projects/3-MiniBalatro/src/utils/helpers.ts) — Loose helpers; no namespace/barrel | 🔵 MINOR
- [ ] [BALATRO-QA-017] [Blinds] [src/models/blinds/blind-modifier.ts](projects/3-MiniBalatro/src/models/blinds/blind-modifier.ts) — 15-way switch in `createForBoss()` | 🔵 MINOR
- [ ] [BALATRO-QA-018] [Config] [src/services/config/balancing-config.ts](projects/3-MiniBalatro/src/services/config/balancing-config.ts) — Mapping objects not exposed for test injection | 🔵 MINOR
- [ ] [BALATRO-QA-019] [Joker] [src/models/special-cards/jokers/joker.ts](projects/3-MiniBalatro/src/models/special-cards/jokers/joker.ts) — Long protocol comment indicates need for `ScoringPhase` interface | 🔵 MINOR
- [ ] [BALATRO-QA-020] [Tests] [jest.config.js](projects/3-MiniBalatro/jest.config.js) — `src/views/**/*.tsx` excluded → ~0 % component coverage | 🔵 MINOR
- [ ] [BALATRO-QA-021] [Poker] [src/models/poker/hand-type.enum.ts](projects/3-MiniBalatro/src/models/poker/hand-type.enum.ts) — Magic poker base values (100, 8, 60…) undocumented | 🔵 MINOR
- [ ] [BALATRO-QA-022] [Scoring] [src/models/scoring/score-calculator.ts](projects/3-MiniBalatro/src/models/scoring/score-calculator.ts) — Hardcoded `5` empty-joker-slot constant | 🔵 MINOR
- [ ] [BALATRO-QA-023] [Persistence] [src/services/persistence/game-persistence.ts](projects/3-MiniBalatro/src/services/persistence/game-persistence.ts) — Serialised state has no `version` field; future migrations impossible | 🔵 MINOR
- [ ] [BALATRO-QA-024] [Tests] [tests/integration/](projects/3-MiniBalatro/tests/) — Minimal integration test for `GameState ↔ GameController` flow | 🔵 MINOR
- [ ] [BALATRO-QA-025] [Views] [src/views/components/](projects/3-MiniBalatro/src/views/components/) — Inconsistent prop interface enforcement | 🔵 MINOR
- [ ] [BALATRO-QA-026] [Views] [src/](projects/3-MiniBalatro/src/) — No React Error Boundary | 🔵 MINOR
- [ ] [BALATRO-QA-027] [Views] [src/views/components/](projects/3-MiniBalatro/src/views/components/) — Card selection lacks keyboard navigation (WCAG 2.1) | 🔵 MINOR
- [ ] [BALATRO-QA-028] [Views] [src/views/components/](projects/3-MiniBalatro/src/views/components/) — No screen-reader / axe-core test pass | 🔵 MINOR

---

## Detailed Findings by Quality Characteristic

### 1. Functional Suitability — 🟢 GOOD
All nine poker hands are correctly recognised with thorough unit tests (wheel-low straight, royal flush, edge bounds). Joker priority (CHIPS → MULT → MULTIPLIER) and The Mouth boss hand-locking are correct. The only **Functional Correctness** risk is the `Math.floor()` rounding in blind-modifier divisors (BALATRO-QA-011).

### 2. Performance Efficiency — 🟢 GOOD
Hand evaluation is O(1) over 5 cards; React rendering uses `useCallback`/`memo` appropriately; saving to `localStorage` is bounded by a 5 MB sanity check. `CardComponent` is not memoised (BALATRO-QA-025-related observation).

### 3. Compatibility — 🟢 GOOD
Modern browser APIs only; TypeScript strict mode; standalone bundle.

### 4. Usability — 🟡 NEEDS WORK
Modals carry `role="dialog"` and `aria-modal="true"`, but the game board has no semantic landmarks, cards are not labelled with `aria-label`, and arrow-key navigation for card selection is absent (BALATRO-QA-027/-028). Falls short of WCAG 2.1 AA.

### 5. Reliability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| BALATRO-QA-002 | [src/models/game/game-state.ts](projects/3-MiniBalatro/src/models/game/game-state.ts) | `debugForceBoss` | Runtime `as any` cast | 🟠 CRITICAL |
| BALATRO-QA-003 | [src/services/persistence/game-persistence.ts](projects/3-MiniBalatro/src/services/persistence/game-persistence.ts) | `deserializeGameState` | No transactional rollback | 🟠 CRITICAL |
| BALATRO-QA-007 | [src/views/App.tsx](projects/3-MiniBalatro/src/views/App.tsx) | callbacks | No try/catch | 🟡 MAJOR |
| BALATRO-QA-009 | [src/services/shop/shop-item-generator.ts](projects/3-MiniBalatro/src/services/shop/shop-item-generator.ts) | factory | Silent fallback | 🟡 MAJOR |
| BALATRO-QA-010 | [src/models/special-cards/tarots/targeted-tarot.ts](projects/3-MiniBalatro/src/models/special-cards/tarots/targeted-tarot.ts) | switch | No default branch | 🟡 MAJOR |
| BALATRO-QA-026 | [src/](projects/3-MiniBalatro/src/) | App | No Error Boundary | 🔵 MINOR |

### 6. Security — 🟢 GOOD
Client-only game; `Math.random()` is acceptable. `sanitizeStorageData()` strips control characters before persistence — good practice.

### 7. Maintainability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| BALATRO-QA-001 | [src/services/persistence/game-persistence.ts](projects/3-MiniBalatro/src/services/persistence/game-persistence.ts) | deserialiser | `as any` × 4 — SonarQube `typescript:S6571` | 🟠 CRITICAL |
| BALATRO-QA-004 | [src/models/game/game-state.ts](projects/3-MiniBalatro/src/models/game/game-state.ts) | class | ~800 LOC, SRP violation — `typescript:S104` | 🟡 MAJOR |
| BALATRO-QA-005 | [src/models/poker/hand-evaluator.ts](projects/3-MiniBalatro/src/models/poker/hand-evaluator.ts) | hand checks | Duplicated logic — `common-ts:DuplicatedBlocks` | 🟡 MAJOR |
| BALATRO-QA-006 | [src/models/scoring/score-calculator.ts](projects/3-MiniBalatro/src/models/scoring/score-calculator.ts) | `calculateScore` | Long parameter list — `typescript:S107` | 🟡 MAJOR |
| BALATRO-QA-008 | [src/models/blinds/blind-generator.ts](projects/3-MiniBalatro/src/models/blinds/blind-generator.ts) | randomness | Not injectable — testability gap | 🟡 MAJOR |
| BALATRO-QA-013 | [src/types/global.d.ts](projects/3-MiniBalatro/src/types/global.d.ts) | callbacks | 9× `any` | 🔵 MINOR |
| BALATRO-QA-017 | [src/models/blinds/blind-modifier.ts](projects/3-MiniBalatro/src/models/blinds/blind-modifier.ts) | factory | 15-way switch | 🔵 MINOR |
| BALATRO-QA-021/-022 | scoring/poker | constants | Magic numbers | 🔵 MINOR |
| BALATRO-QA-023 | persistence | save schema | No `version` field | 🔵 MINOR |
| BALATRO-QA-020/-024 | tests | coverage | Components excluded; integration thin | 🔵 MINOR |

### 8. Portability — 🟢 GOOD
Vite build works for sub-path deployments; npm-only setup.

---

## SonarQube-Category Summary

| Category | Count | Notable examples |
|---|---|---|
| Bugs | 4 | BALATRO-QA-002, -003, -011, -010 |
| Vulnerabilities | 1 | BALATRO-QA-012 (weak random; low risk) |
| Code Smells | 18 | BALATRO-QA-001, -004, -005, -006, -008, -009, -013-022, -025 |
| Coverage Gaps | 2 | BALATRO-QA-020, -024 |

---

## Style Guide Compliance (Google Style Guide + TFG Standards)
**Overall:** Compliant (≈ 91 %)

| Rule | Status | Files affected |
|---|---|---|
| TFG file header present and complete | ⚠️ | ~5 component files missing header |
| Explicit access modifiers on class members | ✅ | minor inconsistency in helpers |
| TSDoc/JSDoc on all public APIs | ✅ | ~92 % coverage |
| `camelCase` / `PascalCase` naming conventions | ✅ | 1 minor (`GAME_CONFIG`) |
| No magic numbers / magic strings | ❌ | scoring + poker (BALATRO-QA-021/-022) |
| Consistent import ordering | ✅ | minor inconsistency in helpers.ts |

---

## Summary Statistics
- Total source files reviewed: 78
- 🔴 Blockers: 0
- 🟠 Critical: 3
- 🟡 Major: 9
- 🔵 Minor: 16
- Total incidents: 28
- **Overall Quality Score:** 🟡 NEEDS WORK

> Coordination: BALATRO-QA-004 (split `game-state.ts`) warrants an Architecture Agent pass before the Coding Agent refactors. The Testing Agent should add React-component tests (BALATRO-QA-020) and integration tests (BALATRO-QA-024).
