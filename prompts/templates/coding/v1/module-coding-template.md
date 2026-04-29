# GLOBAL CONTEXT
Project: [Name]
Architecture: [Type]
Current module: [E.g.: Domain Layer / Controllers / Services]

# INPUT ARTIFACTS
## 1. Requirements Specification
[Attach Requirements Specification]

## 2. Class Diagram
[Attach Class Diagram]

## 3. Use Case Diagram
[Attach Use Case Diagram]

# SPECIFIC TASK
Implement the class/module: **[ClassName]**

## Responsibilities:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

## Methods to implement:
1. **[methodName1]**(parameters) → return
   - Description: [What it does]
   - Preconditions: [Required state before]
   - Postconditions: [State after]
   - Exceptions to handle: [What can fail]

2. **[methodName2]**(parameters) → return
   - [Same]

3. ...

## Dependencies:
- Classes it must use: [ClassList]
- Interfaces it implements: [InterfaceList]
- External services it consumes: [If applicable]

# CONSTRAINTS AND STANDARDS

## Code:
- Language: [Name + version]
- Code style: [PEP8, Google Style Guide, etc.]
- Maximum cyclomatic complexity: [Number, e.g.: 10]
- Maximum method length: [Lines, e.g.: 50]

## Mandatory best practices:
- Application of SOLID principles
- Input parameter validation
- Robust exception handling
- Logging at critical points
- Comments for complex logic (not obvious things)

## Security:
- Input sanitization and validation
- [Other specific considerations]

# DELIVERABLES

1. **Complete source code** of the class with:
   - Organized imports
   - Constants/configurations at the beginning
   - Fully implemented methods
   - Docstrings/JavaDoc on all public methods

2. **Inline documentation**:
   - Justification of non-trivial decisions
   - TODOs if pending optimizations remain

3. **New dependencies**:
   - List of additional libraries needed
   - Justification of why they are needed

4. **Edge cases considered**:
   - List of handled edge cases
   - Contemplated error situations

# OUTPUT FORMAT
```[language]
[Code here]
```

**Design decisions made:**
- [Decision 1 and its justification]
- [Decision 2 and its justification]
- ...

**Possible future improvements:**
- [Improvement 1]
- [Improvement 2]
- ...