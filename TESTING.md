# Testing Guide for openapi-to-ts

## Overview
This project includes comprehensive test coverage for all core functionality using Vitest.

## Test Structure

```
__tests__/
├── generator.test.ts    # 37 tests for type generation
└── parser.test.ts       # 24 tests for spec parsing
```

**Total: 61 tests | Coverage: 85%+ code coverage**

## Running Tests

### Run tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### View interactive UI
```bash
npm run test:ui
```

### Generate coverage reports
```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/index.html` - HTML report
- `coverage/coverage-final.json` - JSON report
- `coverage/lcov.info` - LCOV report

## Test Categories

### Generator Tests (37 tests)
- **Basic Type Mapping (7 tests)**: string, number, integer, boolean, optional, empty, multiple properties
- **Array Types (3 tests)**: string[], number[], empty arrays
- **Enum Types (2 tests)**: enum parsing and single values
- **Composition Types (4 tests)**: allOf, anyOf, oneOf, nested composition
- **Reference Types (2 tests)**: $ref handling
- **Multi-type Generation (2 tests)**: generateAllTypes() function
- **Composition Handlers (4 tests)**: handleCompositionTypes() utility
- **Nullable Types (4 tests)**: nullable string, number, array
- **Edge Cases (4 tests)**: missing properties, missing required, valid syntax, special characters
- **Real-World Scenarios (3 tests)**: Pet Store schema, nested objects, discriminated unions

### Parser Tests (24 tests)
- **JSON Parsing (4 tests)**: valid specs, 3.1.0 version, invalid JSON, unsupported formats
- **YAML Parsing (6 tests)**: .yaml files, .yml files, invalid YAML, arrays, nested objects
- **Schema Extraction (7 tests)**: basic extraction, empty schemas, multiple schemas, complex structures, arrays, references
- **Real-World Scenarios (2 tests)**: Pet Store OpenAPI, composition patterns

## Example Tests

### Basic Type Mapping
```typescript
it('should generate interface with string properties', () => {
  const schema = {
    properties: { name: { type: 'string' } },
    required: ['name'],
  };
  const result = generateTypeScript('User', schema);
  expect(result).toContain('interface User');
  expect(result).toContain('name: string');
});
```

### Parsing JSON OpenAPI
```typescript
it('should parse valid JSON OpenAPI spec', () => {
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    components: { schemas: { User: { type: 'object' } } },
  };
  const filePath = path.join(testDir, 'test.json');
  fs.writeFileSync(filePath, JSON.stringify(spec));

  const result = parseOpenAPI(filePath);
  expect(result.openapi).toBe('3.0.0');
});
```

### Extracting Schemas
```typescript
it('should extract schemas from components', () => {
  const spec = {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
    components: {
      schemas: {
        User: { type: 'object' },
        Post: { type: 'object' },
      },
    },
  };

  const schemas = extractSchemas(spec);
  expect(schemas).toHaveProperty('User');
  expect(schemas).toHaveProperty('Post');
});
```

## Coverage Target
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

View detailed coverage:
```bash
npm run test:coverage
open coverage/index.html
```

## Contributing Tests

When adding new features, please:
1. Add unit tests in the appropriate test file
2. Run tests to ensure all pass: `npm test`
3. Check coverage: `npm run test:coverage`
4. Aim for 80%+ coverage on new code

## CI/CD Integration

These tests are designed to run in CI/CD pipelines. Example:

```yaml
# .github/workflows/test.yml
- run: npm install
- run: npm test
- run: npm run test:coverage
```

## Troubleshooting

### Tests fail with file not found
Ensure you're running tests from the project root:
```bash
cd openapi-to-ts
npm test
```

### Coverage threshold not met
Review the HTML report:
```bash
npm run test:coverage
open coverage/index.html
```

Check which files need more test coverage.

## Related Documentation
- [README.md](../README.md) - Project overview
- [package.json](../package.json) - Dependencies and scripts
