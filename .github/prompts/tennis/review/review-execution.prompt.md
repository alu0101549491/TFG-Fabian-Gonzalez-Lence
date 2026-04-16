# TASK: CODE REVIEW EXECUTION — TENNIS Tournament Manager

Now that the TODO List plan is ready, proceed to review each group following the planned order.

## Objective
Review every file group from the TODO List and produce a **single consolidated incident report** saved as:

  `docs/review_reports/TENNIS_review_report.md`

## Review Criteria (apply to every group)

For each group, evaluate:
- **Design Adherence** (30%): Does implementation match the architecture? Are relationships, patterns and responsibilities correct?
- **Code Quality** (25%): Method complexity, coupling, cohesion, code smells (Long Method, Large Class, Feature Envy, Duplication, Magic Numbers)
- **Requirements Compliance** (25%): Acceptance criteria, edge cases, exception handling, logic correctness
- **Maintainability** (10%): Naming, documentation, comments
- **Best Practices** (10%): SOLID, DRY, KISS, input validation, resource management

## Report Format

The report must follow this exact structure:

---
# TENNIS Tournament Manager — Code Review Report
**Date:** [date]
**Reviewer:** GitHub Copilot Agent

---
## TODO List: Incidents Found
- [ ] [INC-001] [Group] [File] — [short description]
- [ ] [INC-002] ...
(one line per incident, this list will be used in the fix phase)

---
## Group Reviews

### G1 – Configuration & Tooling
**Note:** [2–3 sentence summary]
**Incidents:**
- [INC-XXX] `file` line X — [description] | Severity: BLOCKER / MINOR

### G2 – Domain Layer
...
(repeat for all groups)

---
## Final Codebase Note
[3–5 sentence overall assessment: architecture coherence, main strengths, main risks]

---
## Summary Statistics
- Total files reviewed: X
- Blockers: X
- Minor issues: X
- Overall health: 🔴 CRITICAL / 🟡 NEEDS WORK / 🟢 ACCEPTABLE

---

## Instructions
- Work through the TODO List group by group. Mark each group task as ✅ when done.
- Keep incident descriptions **short and actionable** (one line each).
- Assign a unique ID to every incident: INC-001, INC-002, etc.
- Distinguish severity: **BLOCKER** (breaks functionality or design) vs **MINOR** (improvement/smell).
- Save the report to `docs/review_reports/TENNIS_review_report.md` when complete.
- Confirm when the full report has been generated.