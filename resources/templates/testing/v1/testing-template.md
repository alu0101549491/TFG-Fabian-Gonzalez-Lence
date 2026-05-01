# TESTING CONTEXT
Project: [Name]
Component under test: [ClassName]
Testing framework: Jest, TSJest
Target coverage: [E.g.: 80% lines, 100% public methods]

# CODE TO TEST
```[language]
[Code of the implemented class]
```

# JEST CONFIGURATION
```json
[Code from jest.config.js]
```

# JEST SETUP
```json
[Code from jest.setup.js]
```

# TYPESCRIPT CONFIGURATION
```json
[Code from tsconfig.json]
```

# REQUIREMENTS SPECIFICATION
[Attach Requirements Specification]

# USE CASE DIAGRAM
[Attach Use Case Diagram]

# TASK
Generate a complete unit test suite that covers:

## 1. NORMAL CASES (Happy Path)
For each public method:
- Typical valid inputs
- Expected flow without errors
- Verification of postconditions

## 2. EDGE CASES
- Boundary values (min, max, empty)
- Empty lists, empty strings, nulls
- First and last element
- Single-element collections

## 3. EXCEPTIONAL CASES (Error Handling)
- Invalid inputs that should throw exceptions
- Unmet preconditions
- Inconsistent states
- External dependency errors

## 4. INTEGRATION CASES (if applicable)
- Correct interaction with dependencies
- Mocking of external services
- Verification of calls to collaborators

# STRUCTURE OF EACH TEST

Use the **AAA (Arrange-Act-Assert)** pattern with TypeScript:
```typescript
describe('[ClassName/Module]', () => {
  // Common setup if necessary
  beforeEach(() => {
    // Reset mocks, create fresh instances, etc.
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('[methodName]', () => {
    it('should [expected behavior] when [condition]', () => {
      // ARRANGE: Prepare data and context
      const input: InputType = { ... };
      const expected: OutputType = { ... };
      
      // ACT: Execute the method under test
      const result = sut.method(input);
      
      // ASSERT: Verify results
      expect(result).toEqual(expected);
      expect(result).toHaveProperty('field');
    });

    it('should throw [ErrorType] when [invalid condition]', () => {
      // ARRANGE
      const invalidInput: InputType = { ... };
      
      // ACT & ASSERT
      expect(() => sut.method(invalidInput))
        .toThrow(ErrorType);
    });
  });
});
```

# TEST REQUIREMENTS

## Configuration and types:
- [ ] Correct Jest types imports: `import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';`
- [ ] Strict typing in all test data
- [ ] Use type guards when necessary
- [ ] Typed assertions: `expect<ExpectedType>(result)`

## Mocking in TypeScript:
- [ ] Typed mocks: `jest.mock<typeof OriginalModule>('./module')`
- [ ] Typed spy: `jest.spyOn<Class, 'method'>(instance, 'method')`
- [ ] Module mocks with factory: `jest.mock('./dep', () => ({ ... }))`
- [ ] Partial mocks for interfaces: `Partial<CompleteInterface>`

## Jest-specific assertions:
```typescript
// Deep equality (objects/arrays)
expect(result).toEqual(expected);

// Referential identity
expect(result).toBe(expected);

// Properties and structure
expect(result).toHaveProperty('key', value);
expect(result).toMatchObject({ subset: 'values' });

// Arrays and collections
expect(array).toHaveLength(n);
expect(array).toContain(element);
expect(array).toContainEqual({ object });

// Strings and regex
expect(string).toMatch(/regex/);
expect(string).toContain('substring');

// Numbers
expect(num).toBeGreaterThan(x);
expect(num).toBeCloseTo(3.14, 2); // For floats

// Booleans and existence
expect(value).toBeTruthy();
expect(value).toBeDefined();
expect(value).not.toBeNull();

// Functions and calls
expect(mockFn).toHaveBeenCalledTimes(n);
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenLastCalledWith(args);

// Promises (async/await)
await expect(promise).resolves.toEqual(value);
await expect(promise).rejects.toThrow(Error);

// Exceptions
expect(() => function()).toThrow(ErrorType);
expect(() => function()).toThrow('specific message');
```

## Asynchronous tests:
```typescript
it('should handle async operation', async () => {
  // ARRANGE
  const mockData: Type = { ... };
  mockService.fetchData.mockResolvedValue(mockData);
  
  // ACT
  const result = await sut.asyncMethod();
  
  // ASSERT
  expect(result).toEqual(expected);
  expect(mockService.fetchData).toHaveBeenCalledWith(params);
});

it('should handle rejection', async () => {
  // ARRANGE
  const error = new CustomError('Failed');
  mockService.fetchData.mockRejectedValue(error);
  
  // ACT & ASSERT
  await expect(sut.asyncMethod()).rejects.toThrow(CustomError);
});
```

## Naming conventions:
- Files: `[name].spec.ts` or `[name].test.ts`
- Describe blocks: Class/module name
- Nested describe: Method/function name
- It blocks: `should [action] when [condition]`

# DELIVERABLES

## 1. Complete Test Class
```typescript
[Test code]
```

## 2. Coverage Matrix

| Method | Normal Cases | Edge Cases | Exceptions | Total Tests |
|--------|--------------|------------|------------|-------------|
| method1 | 2 | 3 | 2 | 7 |
| method2 | 1 | 2 | 1 | 4 |
| **TOTAL** | | | | **X** |

## 3. Test Data (if necessary)
```[format]
[Fixtures, mocks, input data]
```

## 4. Expected Coverage Analysis
- Estimated line coverage: ___%
- Estimated branch coverage: ___%
- Methods covered: ___/___
- Uncovered scenarios (if any): [List with justification]

## 5. Execution Instructions
```bash
# Command to run tests
[command]

# Command to view coverage
[command]
```

# SPECIAL CASES TO CONSIDER
- [Special situation 1 from the problem domain]
- [Special situation 2]

# ADDITIONAL NOTES
- Tests must be deterministic (same result always)
- Avoid sleeps or waits (use time mocks if necessary)