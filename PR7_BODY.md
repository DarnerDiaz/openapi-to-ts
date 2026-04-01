## Summary

Comprehensive error handling module for OpenAPI parsing with full validation and recovery support.

## Changes

- **ErrorCollector**: Aggregate errors and warnings during parsing
- **OpenAPIParserError**: Structured error type for parsing failures
- **Schema Validation**: Validate OpenAPI schema objects
- **Error Normalization**: Consistent error handling across all error types

## Features

- Error severity levels (error/warning)
- Error context and path information
- JSON serialization for error reports
- Full test coverage (7 tests)

## Usage

```typescript
const collector = new ErrorCollector();
collector.addError('INVALID_SCHEMA', 'Schema must have type');
if (collector.hasErrors()) {
  console.log(collector.toJSON());
}
```
