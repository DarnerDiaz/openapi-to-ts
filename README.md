# openapi-to-ts 🚀

Transform OpenAPI 3.0 and Swagger specifications into TypeScript interfaces automatically.

## Features

✨ **Automatic Type Generation** - Convert OpenAPI schemas to TypeScript interfaces
🔄 **Multiple Format Support** - Supports JSON and YAML OpenAPI specs
⚡ **Zero-Config CLI** - Just point it to your spec file
🎯 **Type-Safe** - Generates strict TypeScript types

## Installation

```bash
npm install -g openapi-to-ts
```

## Quick Start

```bash
# From JSON file
openapi-to-ts petstore.json

# From YAML file
openapi-to-ts petstore.yaml

# With output file
openapi-to-ts petstore.json -o types.ts
```

## Usage Example

Given this OpenAPI schema:

```json
{
  "openapi": "3.0.0",
  "paths": {
    "/users": {
      "get": {
        "responses": {
          "200": {
            "schema": {
              "type": "object",
              "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "email": { "type": "string" }
              }
            }
          }
        }
      }
    }
  }
}
```

Generates:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}
```

## Development

```bash
npm install
npm run build
npm run dev    # Watch mode
```

## License

MIT © Darner Diaz
