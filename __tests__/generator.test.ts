import { describe, it, expect } from 'vitest';
import {
  generateTypeScript,
  generateAllTypes,
  handleCompositionTypes,
  handleNullableTypes,
} from '../src/generator';

describe('Generator - Basic Type Mapping', () => {
  it('should generate interface with string properties', () => {
    const schema = {
      properties: { name: { type: 'string' } },
      required: ['name'],
    };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('interface User');
    expect(result).toContain('name: string');
  });

  it('should generate interface with number properties', () => {
    const schema = {
      properties: { age: { type: 'number' } },
      required: ['age'],
    };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('age: number');
  });

  it('should generate interface with integer properties', () => {
    const schema = {
      properties: { count: { type: 'integer' } },
      required: ['count'],
    };
    const result = generateTypeScript('Counter', schema);
    expect(result).toContain('count: number');
  });

  it('should generate interface with boolean properties', () => {
    const schema = {
      properties: { active: { type: 'boolean' } },
      required: ['active'],
    };
    const result = generateTypeScript('Status', schema);
    expect(result).toContain('active: boolean');
  });

  it('should mark optional properties with ?', () => {
    const schema = {
      properties: { email: { type: 'string' } },
      required: [],
    };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('email?: string');
  });

  it('should handle empty properties', () => {
    const schema = { properties: {}, required: [] };
    const result = generateTypeScript('Empty', schema);
    expect(result).toContain('interface Empty');
    expect(result).toContain('}');
  });

  it('should handle multiple properties', () => {
    const schema = {
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        active: { type: 'boolean' },
      },
      required: ['id', 'name'],
    };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
    expect(result).toContain('active?: boolean');
  });
});

describe('Generator - Array Types', () => {
  it('should generate string array type', () => {
    const schema = {
      properties: { tags: { type: 'array', items: { type: 'string' } } },
      required: ['tags'],
    };
    const result = generateTypeScript('Post', schema);
    expect(result).toContain('tags: string[]');
  });

  it('should generate number array type', () => {
    const schema = {
      properties: { scores: { type: 'array', items: { type: 'number' } } },
      required: ['scores'],
    };
    const result = generateTypeScript('Game', schema);
    expect(result).toContain('scores: number[]');
  });

  it('should handle empty array items', () => {
    const schema = {
      properties: { items: { type: 'array' } },
      required: ['items'],
    };
    const result = generateTypeScript('Collection', schema);
    expect(result).toContain('items: any[]');
  });
});

describe('Generator - Enum Types', () => {
  it('should generate enum from string with enum property', () => {
    const schema = {
      properties: { status: { type: 'string', enum: ['active', 'inactive', 'pending'] } },
      required: ['status'],
    };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('status: "active" | "inactive" | "pending"');
  });

  it('should handle single enum value', () => {
    const schema = {
      properties: { role: { type: 'string', enum: ['admin'] } },
      required: ['role'],
    };
    const result = generateTypeScript('Account', schema);
    expect(result).toContain('role: "admin"');
  });
});

describe('Generator - Composition Types (allOf, anyOf, oneOf)', () => {
  it('should handle allOf composition', () => {
    const schema = {
      properties: {
        combined: {
          allOf: [
            { type: 'string' },
            { type: 'number' },
          ],
        },
      },
      required: ['combined'],
    };
    const result = generateTypeScript('Mixed', schema);
    expect(result).toContain('combined: (string & number)');
  });

  it('should handle anyOf composition', () => {
    const schema = {
      properties: {
        flexible: {
          anyOf: [
            { type: 'string' },
            { type: 'number' },
          ],
        },
      },
      required: ['flexible'],
    };
    const result = generateTypeScript('Flexible', schema);
    expect(result).toContain('flexible: (string | number)');
  });

  it('should handle oneOf composition', () => {
    const schema = {
      properties: {
        unique: {
          oneOf: [
            { type: 'string' },
            { type: 'number' },
          ],
        },
      },
      required: ['unique'],
    };
    const result = generateTypeScript('Unique', schema);
    expect(result).toContain('unique: (string | number)');
  });

  it('should handle nested composition', () => {
    const schema = {
      properties: {
        nested: {
          allOf: [
            { anyOf: [{ type: 'string' }, { type: 'number' }] },
            { type: 'boolean' },
          ],
        },
      },
      required: ['nested'],
    };
    const result = generateTypeScript('Nested', schema);
    expect(result).toContain('nested: ((string | number) & boolean)');
  });
});

describe('Generator - Reference Types', () => {
  it('should handle $ref to other types', () => {
    const schema = {
      properties: {
        user: { $ref: '#/components/schemas/User' },
      },
      required: ['user'],
    };
    const result = generateTypeScript('Post', schema);
    expect(result).toContain('user: User');
  });

  it('should extract type name from $ref path', () => {
    const schema = {
      properties: {
        author: { $ref: '#/definitions/Author' },
      },
      required: ['author'],
    };
    const result = generateTypeScript('Article', schema);
    expect(result).toContain('author: Author');
  });
});

describe('Generator - Generate AllTypes', () => {
  it('should generate multiple type definitions', () => {
    const schemas = {
      User: {
        properties: { id: { type: 'number' }, name: { type: 'string' } },
        required: ['id'],
      },
      Post: {
        properties: { title: { type: 'string' }, author: { $ref: '#/components/schemas/User' } },
        required: ['title'],
      },
    };
    const result = generateAllTypes(schemas);
    expect(result).toContain('interface User');
    expect(result).toContain('interface Post');
    expect(result).toContain('id: number');
    expect(result).toContain('User');
  });

  it('should join interfaces with newlines', () => {
    const schemas = {
      TypeA: { properties: { a: { type: 'string' } }, required: [] },
      TypeB: { properties: { b: { type: 'number' } }, required: [] },
    };
    const result = generateAllTypes(schemas);
    expect(result).toContain('\n\n');
  });
});

describe('Generator - Handle Composition Types', () => {
  it('should extract allOf composition', () => {
    const schema = {
      allOf: [{ type: 'string' }, { type: 'number' }],
    };
    const result = handleCompositionTypes(schema);
    expect(result).toBe('string & number');
  });

  it('should extract anyOf composition', () => {
    const schema = {
      anyOf: [{ type: 'string' }, { type: 'boolean' }],
    };
    const result = handleCompositionTypes(schema);
    expect(result).toBe('string | boolean');
  });

  it('should extract oneOf composition', () => {
    const schema = {
      oneOf: [{ type: 'number' }, { type: 'boolean' }],
    };
    const result = handleCompositionTypes(schema);
    expect(result).toBe('number | boolean');
  });

  it('should return any for non-composition types', () => {
    const schema = { type: 'string' };
    const result = handleCompositionTypes(schema);
    expect(result).toBe('any');
  });
});

describe('Generator - Handle Nullable Types', () => {
  it('should add null union for nullable string', () => {
    const schema = { type: 'string', nullable: true };
    const result = handleNullableTypes(schema);
    expect(result).toContain('string | null');
  });

  it('should not add null for non-nullable types', () => {
    const schema = { type: 'string', nullable: false };
    const result = handleNullableTypes(schema);
    expect(result).toBe('string');
  });

  it('should handle nullable number', () => {
    const schema = { type: 'number', nullable: true };
    const result = handleNullableTypes(schema);
    expect(result).toContain('number | null');
  });

  it('should handle nullable array', () => {
    const schema = {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    };
    const result = handleNullableTypes(schema);
    expect(result).toBe('string[] | null');
  });
});

describe('Generator - Edge Cases', () => {
  it('should handle schema without properties', () => {
    const schema = { required: [] };
    const result = generateTypeScript('Empty', schema);
    expect(result).toContain('interface Empty');
  });

  it('should handle schema without required array', () => {
    const schema = { properties: { name: { type: 'string' } } };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('name?: string');
  });

  it('should generate valid TypeScript syntax', () => {
    const schema = {
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['id', 'name'],
    };
    const result = generateTypeScript('Complex', schema);
    // Check that output is valid TypeScript
    expect(result).toMatch(/interface Complex \{[\s\S]*\}/);
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
    expect(result).toContain('tags?: string[]');
  });

  it('should handle special characters in property names', () => {
    const schema = {
      properties: {
        'x-custom': { type: 'string' },
        '_internal': { type: 'number' },
      },
      required: [],
    };
    const result = generateTypeScript('Special', schema);
    expect(result).toContain('x-custom?: string');
    expect(result).toContain('_internal?: number');
  });
});

describe('Generator - Real-World Scenarios', () => {
  it('should handle real API schema - OpenAPI Pet Store User', () => {
    const schema = {
      properties: {
        id: { type: 'integer' },
        username: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        userStatus: { type: 'integer', enum: [1, 2, 3] },
      },
      required: ['username', 'email', 'password'],
    };
    const result = generateTypeScript('User', schema);
    expect(result).toContain('interface User');
    expect(result).toContain('username: string');
    expect(result).toContain('email: string');
    expect(result).toContain('id?: number');
    expect(result).toContain('userStatus?: number');
  });

  it('should handle nested object with composition', () => {
    const schema = {
      properties: {
        metadata: {
          allOf: [
            {
              properties: {
                created: { type: 'string' },
                updated: { type: 'string' },
              },
            },
          ],
        },
      },
      required: [],
    };
    const result = generateTypeScript('Document', schema);
    expect(result).toContain('interface Document');
  });

  it('should handle discriminated unions with anyOf', () => {
    const schema = {
      properties: {
        payload: {
          anyOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            { $ref: '#/components/schemas/ErrorResponse' },
          ],
        },
      },
      required: ['payload'],
    };
    const result = generateTypeScript('Result', schema);
    expect(result).toContain('payload: (SuccessResponse | ErrorResponse)');
  });
});
