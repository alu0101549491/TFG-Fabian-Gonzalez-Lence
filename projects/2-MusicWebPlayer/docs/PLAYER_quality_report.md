# Music Web Player — ISO/IEC 25010 Quality Report

**Date:** 2026-04-27
**Analyst:** GitHub Copilot Code Quality Agent
**Standard:** ISO/IEC 25010 (SQuaRE) + SonarQube rule alignment
**Application Complexity Tier:** Intermediate
**Files Reviewed:** 25 source files (22 test files, 7 configuration files)

---

## Executive Summary

Music Web Player is a solid React 18 + TypeScript application with strong separation of concerns via custom hooks (`useAudioPlayer`, `usePlaylist`, `useLocalStorage`, `useResourceLoader`), comprehensive ARIA labelling, and a custom `ErrorHandler` for media errors. The most pressing concern is reliability: the app lacks a top-level Error Boundary, IndexedDB initialisation errors are not caught at the application level, and `localStorage` quota-exceeded events are silenced — collectively a single point of failure that can blank-screen the UI. Maintainability is degraded by [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) exceeding 300 LOC with high cognitive complexity, scattered `'music-player-*'` `localStorage` keys, and a complex `usePlaylist.next()` (~18 cognitive complexity). Security posture is acceptable for a non-authenticated client app but the development-only "reset" debug button is weakly guarded. Overall the project is production-ready provided the BLOCKER and CRITICAL findings are remediated first.

---

## Quality Characteristic Ratings

| Characteristic | Sub-characteristics evaluated | Rating | Confidence |
|---|---|---|---|
| Functional Suitability | Completeness, Correctness, Appropriateness | 🟡 | High |
| Performance Efficiency | Time Behaviour, Resource Utilisation, Capacity | 🟢 | High |
| Compatibility | Co-existence, Interoperability | 🟡 | High |
| Usability | Learnability, Operability, Accessibility, Error Protection | 🟢 | High |
| Reliability | Maturity, Fault Tolerance, Recoverability, Availability | 🟡 | High |
| Security | Confidentiality, Integrity, Authenticity | 🟡 | High |
| Maintainability | Modularity, Reusability, Analysability, Modifiability, Testability | 🟡 | High |
| Portability | Adaptability, Installability, Replaceability | 🟢 | High |

---

## Full Incident List

- [ ] [PLAYER-QA-001] [App] [src/App.tsx](projects/2-MusicWebPlayer/src/App.tsx) — No React Error Boundary wrapping `<Player />`; any render error blanks the UI | 🔴 BLOCKER
- [ ] [PLAYER-QA-002] [Util] [src/utils/indexed-db-storage.ts](projects/2-MusicWebPlayer/src/utils/indexed-db-storage.ts) — IndexedDB `initDB()` errors not caught at top level (private browsing crashes) | 🟠 CRITICAL
- [ ] [PLAYER-QA-005] [Component] [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) — `handleNext`/`handlePrevious` `.catch()` blocks log only; silent error states | 🟠 CRITICAL
- [ ] [PLAYER-QA-003] [Util] [src/utils/env.ts](projects/2-MusicWebPlayer/src/utils/env.ts) — `import.meta.env.BASE_URL` fallback swallowed silently | 🟡 MAJOR
- [ ] [PLAYER-QA-004] [Component] [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) — File ~350 LOC, exceeds 300-line guideline; mixes state, handlers, render | 🟡 MAJOR
- [ ] [PLAYER-QA-006] [Component] [src/components/AddSongForm.tsx](projects/2-MusicWebPlayer/src/components/AddSongForm.tsx) — 50+ line `validateForm` should be extracted to `useFormValidation` | 🟡 MAJOR
- [ ] [PLAYER-QA-007] [Component] [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) — Reset/debug button only gated by `NODE_ENV`; no confirmation or feature flag | 🟡 MAJOR
- [ ] [PLAYER-QA-008] [Hook/Comp] [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx), [src/hooks/usePlaylist.ts](projects/2-MusicWebPlayer/src/hooks/usePlaylist.ts), [src/hooks/useAudioPlayer.ts](projects/2-MusicWebPlayer/src/hooks/useAudioPlayer.ts) — Magic-string `localStorage` keys scattered (`'music-player-*'`) | 🟡 MAJOR
- [ ] [PLAYER-QA-010] [Hook] [src/hooks/usePlaylist.ts](projects/2-MusicWebPlayer/src/hooks/usePlaylist.ts) — `next()` cognitive complexity ≈ 18 (threshold 15) | 🟡 MAJOR
- [ ] [PLAYER-QA-011] [Hook] [src/hooks/useLocalStorage.ts](projects/2-MusicWebPlayer/src/hooks/useLocalStorage.ts) — `QuotaExceededError` not surfaced to UI; persistence failures silent | 🟡 MAJOR
- [ ] [PLAYER-QA-012] [Hook] [src/hooks/useResourceLoader.ts](projects/2-MusicWebPlayer/src/hooks/useResourceLoader.ts) — Blob URL cleanup race on unmount during async fetch (memory leak) | 🟡 MAJOR
- [ ] [PLAYER-QA-014] [Hook] [src/hooks/usePlaylist.ts](projects/2-MusicWebPlayer/src/hooks/usePlaylist.ts) — Shuffle queue not regenerated when shuffle toggled mid-playback | 🟡 MAJOR
- [ ] [PLAYER-QA-009] [Component] [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) — Error alert lacks `aria-describedby` linkage | 🔵 MINOR
- [ ] [PLAYER-QA-013] [Component] [src/components/TrackInfo.tsx](projects/2-MusicWebPlayer/src/components/TrackInfo.tsx) — Missing explicit return type on `React.FC` component | 🔵 MINOR
- [ ] [PLAYER-QA-015] [Data] [src/data/playlist-data-provider.ts](projects/2-MusicWebPlayer/src/data/playlist-data-provider.ts) — Hard-coded `'playlist.json'` path with no schema documentation | 🔵 MINOR
- [ ] [PLAYER-QA-016] [App] [src/App.tsx](projects/2-MusicWebPlayer/src/App.tsx) — Skip-to-content link is commented out (WCAG 2.1 Level A) | 🔵 MINOR
- [ ] [PLAYER-QA-017] [Util] [src/utils/audio-validator.ts](projects/2-MusicWebPlayer/src/utils/audio-validator.ts) — Magic number `2048` (URL length) lacks explanation | 🔵 MINOR
- [ ] [PLAYER-QA-018] [Component] [src/components/AddSongForm.tsx](projects/2-MusicWebPlayer/src/components/AddSongForm.tsx) — `crypto.randomUUID` fallback uses `Date.now() + Math.random()`; comment unclear | 🔵 MINOR
- [ ] [PLAYER-QA-019] [Tests] [tests/](projects/2-MusicWebPlayer/tests/) — Branches at 80 % threshold; error-path branches uncovered (IndexedDB, quota) | 🔵 MINOR
- [ ] [PLAYER-QA-020] [Hook] [src/hooks/useAudioPlayer.ts](projects/2-MusicWebPlayer/src/hooks/useAudioPlayer.ts) — `mediaError as unknown as Error` cast; should be type guard | 🔵 MINOR
- [ ] [PLAYER-QA-021] [Component] [src/components/AddSongForm.tsx](projects/2-MusicWebPlayer/src/components/AddSongForm.tsx) — Timer ref may fire on unmounted component | 🔵 MINOR
- [ ] [PLAYER-QA-022] [Component] [src/components/Playlist.tsx](projects/2-MusicWebPlayer/src/components/Playlist.tsx) — `deleteConfirmId` missing from delete-timer cleanup deps | 🔵 MINOR
- [ ] [PLAYER-QA-023] [Hook] [src/hooks/useLocalStorage.ts](projects/2-MusicWebPlayer/src/hooks/useLocalStorage.ts) — `localStorage` data unencrypted (low risk; documentation gap) | 🔵 MINOR
- [ ] [PLAYER-QA-024] [Component] [src/components/AddSongForm.tsx](projects/2-MusicWebPlayer/src/components/AddSongForm.tsx) — `crypto.randomUUID` fallback non-cryptographic | 🔵 MINOR
- [ ] [PLAYER-QA-025] [Component] [src/components/Controls.tsx](projects/2-MusicWebPlayer/src/components/Controls.tsx) — Unicode icon glyphs without font-family fallback | 🔵 MINOR

---

## Detailed Findings by Quality Characteristic

### 1. Functional Suitability — 🟡 NEEDS WORK
The shuffle-queue regeneration bug (PLAYER-QA-014) and edge-case behaviour around removing the last song during playback indicate gaps in **Functional Correctness** (ISO/IEC 25010 §1.2). All primary user flows (play, pause, seek, volume, playlist CRUD) are present and correct.

### 2. Performance Efficiency — 🟢 GOOD
Memoisation via `React.memo`/`useCallback` is well applied. The blob-URL cleanup race (PLAYER-QA-012) is the only real **Resource Utilisation** concern; no virtual scrolling for >100-item playlists is acceptable for the intended use case.

### 3. Compatibility — 🟡 NEEDS WORK
IndexedDB ↔ `localStorage` fallback is a strength. `import.meta.env.BASE_URL` may behave inconsistently in Node/Jest contexts (PLAYER-QA-003).

### 4. Usability — 🟢 GOOD
ARIA coverage is exemplary (`aria-label`, `aria-pressed`, `aria-current`); keyboard navigation in `ProgressBar`/`VolumeControl` is implemented. Minor gaps: `aria-describedby` on error alerts (PLAYER-QA-009) and the commented-out skip link (PLAYER-QA-016).

### 5. Reliability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| PLAYER-QA-001 | [src/App.tsx](projects/2-MusicWebPlayer/src/App.tsx) | App tree | No Error Boundary — ISO/IEC 25010 §5.3 Fault Tolerance failure | 🔴 BLOCKER |
| PLAYER-QA-002 | [src/utils/indexed-db-storage.ts](projects/2-MusicWebPlayer/src/utils/indexed-db-storage.ts) | `initDB` | Init errors not caught — Recoverability failure | 🟠 CRITICAL |
| PLAYER-QA-005 | [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) | `handleNext/Prev` | Silent `.catch()` blocks | 🟠 CRITICAL |
| PLAYER-QA-011 | [src/hooks/useLocalStorage.ts](projects/2-MusicWebPlayer/src/hooks/useLocalStorage.ts) | `setValue` | Quota errors not surfaced | 🟡 MAJOR |
| PLAYER-QA-022 | [src/components/Playlist.tsx](projects/2-MusicWebPlayer/src/components/Playlist.tsx) | timer effect | Stale closure in deps | 🔵 MINOR |

### 6. Security — 🟡 NEEDS WORK
No XSS vectors (no `dangerouslySetInnerHTML`). Concerns: dev-only debug reset (PLAYER-QA-007), weak UUID fallback (PLAYER-QA-018, PLAYER-QA-024), unencrypted `localStorage` (PLAYER-QA-023; acceptable for the threat model).

### 7. Maintainability — 🟡 NEEDS WORK
| ID | File | Scope | Description | Severity |
|---|---|---|---|---|
| PLAYER-QA-004 | [src/components/Player.tsx](projects/2-MusicWebPlayer/src/components/Player.tsx) | whole file | ~350 LOC, multiple responsibilities — SonarQube `typescript:S104` | 🟡 MAJOR |
| PLAYER-QA-008 | multiple | storage keys | Magic strings — SonarQube `typescript:S1192` | 🟡 MAJOR |
| PLAYER-QA-010 | [src/hooks/usePlaylist.ts](projects/2-MusicWebPlayer/src/hooks/usePlaylist.ts) | `next()` | Cognitive complexity ≈ 18 — SonarQube `typescript:S3776` | 🟡 MAJOR |
| PLAYER-QA-006 | [src/components/AddSongForm.tsx](projects/2-MusicWebPlayer/src/components/AddSongForm.tsx) | validation | Long method, low reuse | 🟡 MAJOR |
| PLAYER-QA-020 | [src/hooks/useAudioPlayer.ts](projects/2-MusicWebPlayer/src/hooks/useAudioPlayer.ts) | error cast | Unsafe cast | 🔵 MINOR |
| PLAYER-QA-013, -015, -017 | various | docs/types | Style/clarity gaps | 🔵 MINOR |

### 8. Portability — 🟢 GOOD
Vite base-path handling, npm-standard install, no platform code.

---

## SonarQube-Category Summary

| Category | Count | Notable examples |
|---|---|---|
| Bugs | 7 | PLAYER-QA-002, -005, -011, -012, -014, -021, -022 |
| Vulnerabilities | 2 | PLAYER-QA-007, -018/-024 |
| Code Smells | 12 | PLAYER-QA-004, -006, -008, -010, -013, -015, -017, -020, -023, -025 |
| Coverage Gaps | 1 | PLAYER-QA-019 |

---

## Style Guide Compliance (Google Style Guide + TFG Standards)
**Overall:** Partially Compliant (≈ 82 %)

| Rule | Status | Files affected |
|---|---|---|
| TFG file header present and complete | ✅ | All TS files |
| Explicit access modifiers on class members | ✅ | 0 |
| TSDoc/JSDoc on all public APIs | ✅ | Excellent coverage |
| `camelCase` / `PascalCase` naming conventions | ✅ | 0 |
| No magic numbers / magic strings | ❌ | 8+ instances (PLAYER-QA-008, -017) |
| Consistent import ordering | ✅ | 0 |
| File length ≤ 300 lines | ❌ | 1 (Player.tsx) |
| Explicit return types on FC components | ⚠️ | 1 (TrackInfo.tsx) |

---

## Summary Statistics
- Total source files reviewed: 25
- 🔴 Blockers: 1
- 🟠 Critical: 2
- 🟡 Major: 9
- 🔵 Minor: 12
- Total incidents: 24
- **Overall Quality Score:** 🟡 NEEDS WORK

> Coordination: PLAYER-QA-001/002/005 are immediate items for the Coding Agent. The Testing Agent should add IndexedDB-error and `QuotaExceededError` paths (PLAYER-QA-019). PLAYER-QA-004 (component split) may benefit from an Architecture Agent pass.
