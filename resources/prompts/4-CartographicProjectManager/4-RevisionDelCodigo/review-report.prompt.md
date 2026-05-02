# CODE REVIEW EXECUTION - INCIDENT REPORT GENERATION

## OBJECTIVE
You are a Senior Code Reviewer Agent. Following the TODO List created in Phase 1, your task is to systematically review each code group and generate a comprehensive incident report documenting all issues found.

## PROJECT CONTEXT

**Project:** Cartographic Project Manager (CPM)
**Architecture:** Layered Architecture with Clean Architecture principles
**Tech Stack:** TypeScript 5.x, Vue.js 3, Pinia, Vue Router, Socket.io, Axios

## REFERENCE DOCUMENTS

Before starting the review, ensure you have access to:
1. **Requirements Specification:** Project requirements and acceptance criteria
2. **Architecture Documentation:** Layer responsibilities, module structure
3. **Class/Component Diagrams:** Expected relationships and interfaces
4. **Coding Standards:** Google TypeScript Style Guide

## TODO LIST TO FOLLOW
[Reference the TODO List generated in Prompt 1]

## EVALUATION CRITERIA FOR EACH GROUP

### 1. DESIGN ADHERENCE (Weight: 30%)
- Does the implementation respect the architecture diagram?
- Are layer boundaries respected (no cross-layer violations)?
- Are relationships between objects correct?
- Are design patterns applied correctly?
- Is responsibility coherent with the layer/module?

### 2. CODE QUALITY (Weight: 25%)
Analyze using these metrics:
- Cyclomatic complexity of methods (flag if > 10)
- Coupling (fan-in, fan-out analysis)
- Class/component cohesion
- Code smells detection:
  * Long Method (> 30 lines)
  * Large Class (> 300 lines)
  * Feature Envy
  * Code Duplication
  * Magic Numbers/Strings
  * Dead Code
  * Inconsistent Naming

### 3. REQUIREMENTS COMPLIANCE (Weight: 25%)
- Does it meet acceptance criteria?
- Does it handle edge cases correctly?
- Are exceptions properly managed?
- Is the logic correct and complete?
- Are TypeScript types properly defined?

### 4. MAINTAINABILITY (Weight: 10%)
- Descriptive and consistent naming
- Sufficient and clear documentation
- Useful comments (not redundant)
- Self-documenting code
- Proper file organization

### 5. BEST PRACTICES (Weight: 10%)
- SOLID principles respected
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Input validations present
- Resource management (cleanup, unsubscribe)
- Vue.js best practices (composition API patterns)
- TypeScript best practices (strict mode compliance)

## REVIEW PROCESS

For each group in the TODO List:

1. **Read all files in the group**
2. **Evaluate against all 5 criteria**
3. **Document all incidents found**
4. **Assign severity levels:**
   - 🔴 **CRITICAL:** Blocks functionality, security vulnerability, data loss risk
   - 🟠 **HIGH:** Significant bug, performance issue, major code smell
   - 🟡 **MEDIUM:** Minor bug, maintainability issue, minor code smell
   - 🟢 **LOW:** Style issue, minor improvement suggestion

5. **Record positive aspects** (well-implemented patterns, clean code)
6. **Generate group score** (weighted average of criteria)

## OUTPUT FORMAT

Generate the report in the following structure and save it to:
`docs/review_reports/CODE_REVIEW_REPORT.md`

```markdown
# CODE REVIEW REPORT
## Cartographic Project Manager (CPM)

**Review Date:** [DATE]
**Reviewer:** GitHub Copilot Agent
**Codebase Version:** [commit/version]
**Total Files Reviewed:** X
**Total Groups Reviewed:** X

---

## EXECUTIVE SUMMARY

**Overall Codebase Score:** X.X/10

**Summary:**
[3-5 sentences describing the overall state of the codebase, major strengths, and primary concerns]

**Statistics:**
- Critical Issues: X
- High Issues: X
- Medium Issues: X
- Low Issues: X
- Total Issues: X

**Recommendation:**
- [ ] ✅ APPROVED - Ready for production
- [ ] ⚠️ APPROVED WITH RESERVATIONS - Functional but needs improvements
- [ ] ❌ REQUIRES REMEDIATION - Critical issues must be fixed

---

## GROUP REVIEW DETAILS

### Phase 1: Domain Layer

#### Group 1.1: Enumerations
**Files Reviewed:** [list]
**Score:** X/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D1-001 | 🟡 MEDIUM | ProjectStatus.ts | 5-10 | Missing JSDoc documentation | Add documentation for each enum value |
| D1-002 | 🟢 LOW | FileType.ts | 15 | Inconsistent naming convention | Rename to follow pattern |

**Positive Aspects:**
- [Strength 1]
- [Strength 2]

**Group Notes:**
[Brief notes about this group's overall quality]

---

#### Group 1.2: Value Objects
**Files Reviewed:** [list]
**Score:** X/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| D2-001 | 🟠 HIGH | Email.ts | 20-35 | Validation logic is incomplete | Add RFC 5322 compliant validation |

**Positive Aspects:**
- [Strength 1]

**Group Notes:**
[Brief notes]

---

[Continue for ALL groups in the TODO List...]

---

### Phase 3: Infrastructure Layer

#### Group 3.1: HTTP Client
**Files Reviewed:** [list]
**Score:** X/10

**Issues Found:**
| ID | Severity | File | Line(s) | Description | Suggested Fix |
|----|----------|------|---------|-------------|---------------|
| I1-001 | 🔴 CRITICAL | axios.client.ts | 45-50 | No error handling for network failures | Implement retry logic with exponential backoff |
| I1-002 | 🟠 HIGH | axios.client.ts | 78 | Token stored insecurely | Use httpOnly cookies or secure storage |

**Positive Aspects:**
- [Strength 1]

**Group Notes:**
[Brief notes]

---

[Continue for ALL groups...]

---

## INCIDENT TODO LIST

### Critical Issues (Must Fix)
- [ ] **I1-001** - axios.client.ts:45-50 - No error handling for network failures
- [ ] **I3-005** - socket.handler.ts:120 - Memory leak in event listeners
- [ ] [Continue listing all critical issues...]

### High Issues (Should Fix)
- [ ] **I1-002** - axios.client.ts:78 - Token stored insecurely
- [ ] **P2-003** - ProjectCard.vue:45 - Missing accessibility attributes
- [ ] [Continue listing all high issues...]

### Medium Issues (Recommended Fix)
- [ ] **D1-001** - ProjectStatus.ts:5-10 - Missing JSDoc documentation
- [ ] **C3-002** - useAuth.ts:90 - Complex function should be split
- [ ] [Continue listing all medium issues...]

### Low Issues (Optional Fix)
- [ ] **D1-002** - FileType.ts:15 - Inconsistent naming convention
- [ ] [Continue listing all low issues...]

---

## CROSS-CUTTING CONCERNS

### Type Safety Analysis
**Issues:**
- [List TypeScript-specific issues across the codebase]

**Recommendation:**
- [Suggestions for improving type safety]

### Consistency Analysis
**Issues:**
- [List inconsistencies in naming, patterns, structure]

**Recommendation:**
- [Suggestions for improving consistency]

### Security Analysis
**Issues:**
- [List security-related concerns]

**Recommendation:**
- [Suggestions for improving security]

### Performance Analysis
**Issues:**
- [List performance-related concerns]

**Recommendation:**
- [Suggestions for improving performance]

---

## RECOMMENDED REFACTORINGS

### Refactoring 1: [Name]
**Affected Files:** [list]
**Priority:** [Critical/High/Medium/Low]
**Effort:** [Low/Medium/High]

**Before:**
```typescript
// Problematic code example
```

**After:**
```typescript
// Improved code example
```

**Rationale:**
[Why this refactoring is needed]

---

### Refactoring 2: [Name]
[Continue pattern...]

---

## FINAL CODEBASE NOTES

### Architecture Compliance
[Assessment of how well the codebase follows the intended architecture]

### Code Organization
[Assessment of file structure, module organization, barrel exports]

### Documentation Status
[Assessment of documentation coverage and quality]

### Technical Debt Summary
[Summary of accumulated technical debt and prioritized remediation plan]

---

## NEXT STEPS

1. **Immediate Actions (Critical):**
   - [Action 1]
   - [Action 2]

2. **Short-term Actions (High):**
   - [Action 1]
   - [Action 2]

3. **Medium-term Actions (Medium):**
   - [Action 1]
   - [Action 2]

4. **Long-term Actions (Low):**
   - [Action 1]
   - [Action 2]

---

**Report Generated:** [TIMESTAMP]
**Next Review Scheduled:** [Recommendation]
```

## INSTRUCTIONS

1. **Follow the TODO List sequentially** - do not skip groups
2. **Be thorough but concise** - document issues clearly without verbosity
3. **Provide actionable fixes** - each issue should have a clear solution path
4. **Use consistent ID format:** [Layer Initial][Group Number]-[Issue Number]
   - D = Domain, A = Application, I = Infrastructure, P = Presentation, S = Shared
5. **Score honestly** - do not inflate or deflate scores
6. **Document positive aspects** - recognize good practices
7. **Cross-reference related issues** - note if issues in one group affect others
8. **Save progress regularly** - update the report as you complete each group

## OUTPUT LOCATION

Save the report to: `docs/review_reports/CODE_REVIEW_REPORT.md`

Begin the systematic review now, following the TODO List from Phase 1.
