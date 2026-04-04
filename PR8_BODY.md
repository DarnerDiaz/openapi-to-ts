## Summary

Add comprehensive support for Swagger 2.0 (OpenAPI 2.0) specifications, including parsing, validation, and conversion to OpenAPI 3.0 format.

## Changes

- **Swagger2Parser**: Complete parser for Swagger 2.0 specifications
- **OpenAPI 3.0 Conversion**: Automatically convert Swagger 2.0 to OpenAPI 3.0 format
- **Type Extraction**: Extract TypeScript types from Swagger definitions
- **Server Configuration**: Convert host/basePath to OpenAPI servers

## Features

- Full Swagger 2.0 schema support
- Path item and operation conversion
- Definition/schema extraction
- Format type mappings (date-time, uuid, email, etc.)
- Backward compatible with existing OpenAPI 3.0+ support
- 7 comprehensive tests

## Usage

```typescript
import { Swagger2Parser } from './swagger2-parser';

const swagger = { swagger: '2.0', ... };
const openapi3 = Swagger2Parser.toOpenAPI3Format(swagger);
const definitions = Swagger2Parser.extractDefinitions(swagger);
```
