# OpenAPI to TypeScript: Generate Type-Safe Interfaces from Your API Specs 🚀

## The Problem

You've got an OpenAPI/Swagger specification for your API. You need TypeScript interfaces to match. Do you really want to manually write them all?

**No.**

## The Solution

**openapi-to-ts** automatically transforms OpenAPI 3.0 and Swagger specifications into TypeScript interfaces. One command. Type-safe code. Done.

```bash
openapi-to-ts petstore.yaml -o types.ts
```

That's it. Your API types are ready.

## Why This Matters

### 1. **Zero Manual Work**
Stop copy-pasting API response shapes. Stop manual type definitions. One CLI command generates everything.

### 2. **Type Safety from Day One**
Your TypeScript frontend immediately knows:
- What properties exist
- Their exact types
- Which fields are required
- Enum values

### 3. **DRY Principle**
Your OpenAPI spec is already the source of truth. No duplicating that information in TypeScript files.

### 4. **Stay in Sync**
When your API spec updates, regenerate types. No more "does this endpoint return a string or a number?" arguments.

## Quick Start

### Installation

```bash
npm install -g openapi-to-ts
```

### Basic Usage

Given an OpenAPI spec like this:

```json
{
  "openapi": "3.0.0",
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "email": { "type": "string" },
          "status": {
            "type": "string",
            "enum": ["active", "inactive", "pending"]
          }
        }
      }
    }
  }
}
```

Run this:

```bash
openapi-to-ts spec.json -o types.ts
```

Get this:

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
  status?: "active" | "inactive" | "pending";
}
```

## Features

✨ **Multiple Format Support** - JSON, YAML, and YAML specs
🔄 **Complex Type Handling** - Arrays, nested objects, enums, allOf/anyOf/oneOf
🎯 **Strict Mode** - Generate strict TypeScript types
⚡ **Zero Dependencies** - Just Node.js built-ins (plus js-yaml)
🛡️ **Deprecation Handling** - Mark deprecated fields in comments
📦 **Works Anywhere** - CLI tool or programmatic API

## Real-World Example

### Your API Spec (OpenAPI)

```yaml
openapi: 3.0.0
components:
  schemas:
    Product:
      type: object
      required:
        - id
        - name
        - price
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        price:
          type: number
          format: double
        discount:
          type: number
          nullable: true
        tags:
          type: array
          items:
            type: string
        metadata:
          type: object
          additionalProperties: true
    Order:
      type: object
      properties:
        id:
          type: string
        products:
          type: array
          items:
            $ref: '#/components/schemas/Product'
```

### Generated TypeScript

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number | null;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface Order {
  id?: string;
  products?: Product[];
}
```

### Your React Component

```typescript
import { Product, Order } from './types';

async function fetchOrder(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}`);
  return response.json();
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div>
      {order.products?.map((product: Product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

No more `any` types. No more guessing. Type-safe from API spec to React component.

## How It Works

1. **Parse** - Read your OpenAPI/Swagger spec (JSON or YAML)
2. **Extract** - Pull out all schema definitions
3. **Generate** - Convert schemas to TypeScript interfaces
4. **Output** - Write to file or stdout

## Advanced Features

### Strict Mode

```bash
openapi-to-ts spec.json --strict
```

Generates interfaces with mandatory properties and no optional fields unless explicitly marked.

### Handle Deprecated Fields

```typescript
interface LegacyUser {
  /** @deprecated Use newEmail instead */
  oldEmail?: string;
  newEmail: string;
}
```

### Support for Complex Types

- ✅ Nested objects
- ✅ Arrays and nested arrays
- ✅ Enum values
- ✅ Union types (oneOf/anyOf)
- ✅ Nullable/optional fields
- ✅ References ($ref)

## Integration Examples

### Use in Your Build Process

```json
{
  "scripts": {
    "generate-types": "openapi-to-ts ./api-spec.yaml -o src/types/api.ts",
    "build": "npm run generate-types && tsc"
  }
}
```

### Watch Mode for Development

```bash
nodemon --watch api-spec.yaml --exec "openapi-to-ts api-spec.yaml -o src/types/api.ts"
```

## Comparison with Alternatives

| Feature | openapi-to-ts | TypeGen | swagger-to-ts |
|---------|---------------|---------|---------------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **YAML Support** | ✅ | ❌ | ✅ |
| **CLI Tool** | ✅ | ❌ | ✅ |
| **Config Free** | ✅ | ❌ | ❌ |

## Getting Started

```bash
# Install
npm install -g openapi-to-ts

# Use
openapi-to-ts your-api-spec.json -o types.ts

# Done! Start using your types
```

## Contributing

We love contributions! Found a bug? Want to add a feature? Head over to:
**https://github.com/DarnerDiaz/openapi-to-ts**

## About the Author

Building tools that make developers' lives easier. 🚀

Check out my other projects:
- **json-to-ts**: Transform JSON into TypeScript types
- **financial-dashboard**: Real-time crypto dashboard

---

**Start generating type-safe code from your OpenAPI specs today!**

Share if this helped you! 💙

#typescript #openapi #swagger #codegen #devtools
