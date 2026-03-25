# openapi-to-ts 🚀

Transform OpenAPI 3.0 and Swagger specifications into TypeScript interfaces automatically.

## Features

✨ **Automatic Type Generation** - Convert OpenAPI schemas to TypeScript interfaces
🔄 **Multiple Format Support** - Supports JSON and YAML OpenAPI specs
⚡ **Zero-Config CLI** - Just point it to your spec file
🎯 **Type-Safe** - Generates strict TypeScript types
💪 **Advanced Types** - Supports allOf, anyOf, oneOf, additionalProperties
🏷️ **Format Support** - Handles date, uuid, email, uri, ipv4, binary formats
📝 **JSDoc Support** - Generates descriptions as JSDoc comments
🔄 **Composition Types** - Merges and union types for complex schemas

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

# In strict mode
openapi-to-ts petstore.json --strict
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

## Advanced Features

### Composition Types (allOf, anyOf, oneOf)

```json
{
  "PaymentMethod": {
    "oneOf": [
      { "$ref": "#/components/schemas/CreditCard" },
      { "$ref": "#/components/schemas/PayPal" },
      { "$ref": "#/components/schemas/BankAccount" }
    ]
  }
}
```

Generates:

```typescript
type PaymentMethod = CreditCard | PayPal | BankAccount;
```

### Additional Properties

```json
{
  "Metadata": {
    "type": "object",
    "additionalProperties": {
      "type": "string"
    }
  }
}
```

Generates:

```typescript
interface Metadata {
  [key: string]: string;
}
```

### Format Support

Handles OpenAPI format modifiers:
- `date` → string (YYYY-MM-DD)
- `date-time` → string (ISO8601)
- `uuid` → string
- `email` → string
- `uri` → string
- `ipv4` → string
- `binary` → Buffer

### Field Descriptions

Auto-generates JSDoc comments from schema descriptions:

```typescript
interface User {
  /** The unique identifier for the user */
  id: string;
  /** User's full name */
  name: string;
}
```

## Development

```bash
npm install
npm run build
npm run dev    # Watch mode
npm run test
```

## Examples

Check the `/examples` folder for complete OpenAPI specs and generated types.

## Roadmap

- [ ] Support for OpenAPI 2.0 (Swagger)
- [ ] Custom type mappings
- [ ] Prettier integration
- [ ] Watch mode
- [ ] NPM package types generation
- [ ] REST client generation
- [ ] GraphQL schema generation

## Contributing

We love contributions! Found a bug? Want to add a feature? Head over to:
**https://github.com/DarnerDiaz/openapi-to-ts**

## License

MIT © Darner Diaz
