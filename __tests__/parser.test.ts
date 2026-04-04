import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseOpenAPI, extractSchemas } from '../src/parser';
import type { OpenAPISpec } from '../src/parser';

const testDir = path.join(__dirname, 'fixtures');

beforeAll(() => {
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
});

afterAll(() => {
  // Cleanup test files
  const files = fs.readdirSync(testDir);
  files.forEach(file => {
    fs.unlinkSync(path.join(testDir, file));
  });
  try {
    fs.rmdirSync(testDir);
  } catch (e) {
    // Directory not empty, ignore
  }
});

describe('Parser - parseOpenAPI JSON', () => {
  it('should parse valid JSON OpenAPI spec', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      components: {
        schemas: { User: { type: 'object' } },
      },
    };
    const filePath = path.join(testDir, 'test.json');
    fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));

    const result = parseOpenAPI(filePath);
    expect(result.openapi).toBe('3.0.0');
    expect(result.info.title).toBe('Test API');
    expect(result.components?.schemas?.User).toEqual({ type: 'object' });

    fs.unlinkSync(filePath);
  });

  it('should parse JSON with OpenAPI 3.1.0', () => {
    const spec: OpenAPISpec = {
      openapi: '3.1.0',
      info: { title: 'Modern API', version: '1.0.0' },
    };
    const filePath = path.join(testDir, 'modern.json');
    fs.writeFileSync(filePath, JSON.stringify(spec));

    const result = parseOpenAPI(filePath);
    expect(result.openapi).toBe('3.1.0');

    fs.unlinkSync(filePath);
  });

  it('should throw error for .txt files', () => {
    const filePath = path.join(testDir, 'invalid.txt');
    fs.writeFileSync(filePath, 'not a valid spec');

    expect(() => parseOpenAPI(filePath)).toThrow('Unsupported file format');

    fs.unlinkSync(filePath);
  });

  it('should throw error for invalid JSON', () => {
    const filePath = path.join(testDir, 'invalid.json');
    fs.writeFileSync(filePath, '{invalid json}');

    expect(() => parseOpenAPI(filePath)).toThrow();

    fs.unlinkSync(filePath);
  });
});

describe('Parser - parseOpenAPI YAML', () => {
  it('should parse valid .yaml OpenAPI spec', () => {
    const yamlContent = `
openapi: 3.0.0
info:
  title: YAML API
  version: 1.0.0
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: number
`;
    const filePath = path.join(testDir, 'test.yaml');
    fs.writeFileSync(filePath, yamlContent);

    const result = parseOpenAPI(filePath);
    expect(result.openapi).toBe('3.0.0');
    expect(result.info.title).toBe('YAML API');
    expect(result.components?.schemas?.User.type).toBe('object');

    fs.unlinkSync(filePath);
  });

  it('should parse valid .yml OpenAPI spec', () => {
    const ymlContent = `
openapi: 3.0.0
info:
  title: YML API
  version: 2.0.0
paths:
  /users:
    get:
      responses:
        200:
          description: Success
`;
    const filePath = path.join(testDir, 'test.yml');
    fs.writeFileSync(filePath, ymlContent);

    const result = parseOpenAPI(filePath);
    expect(result.openapi).toBe('3.0.0');
    expect(result.paths?.['/users']).toBeDefined();

    fs.unlinkSync(filePath);
  });

  it('should throw error for invalid YAML', () => {
    const yamlContent = `
openapi: 3.0.0
  bad: indentation
   wrong: structure
`;
    const filePath = path.join(testDir, 'invalid.yaml');
    fs.writeFileSync(filePath, yamlContent);

    expect(() => parseOpenAPI(filePath)).toThrow();

    fs.unlinkSync(filePath);
  });

  it('should handle YAML with arrays', () => {
    const yamlContent = `
openapi: 3.0.0
info:
  title: Array API
  version: 1.0.0
tags:
  - name: users
  - name: posts
  - name: comments
`;
    const filePath = path.join(testDir, 'arrays.yaml');
    fs.writeFileSync(filePath, yamlContent);

    const result = parseOpenAPI(filePath);
    expect(Array.isArray(result.tags)).toBe(true);
    expect(result.tags).toHaveLength(3);

    fs.unlinkSync(filePath);
  });

  it('should handle YAML with nested objects', () => {
    const yamlContent = `
openapi: 3.0.0
info:
  title: Nested API
  version: 1.0.0
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.com/oauth/authorize
          tokenUrl: https://example.com/oauth/token
          scopes:
            read: Read access
            write: Write access
`;
    const filePath = path.join(testDir, 'nested.yaml');
    fs.writeFileSync(filePath, yamlContent);

    const result = parseOpenAPI(filePath);
    expect(result.components?.securitySchemes?.oauth2?.flows?.authorizationCode?.scopes).toBeDefined();

    fs.unlinkSync(filePath);
  });
});

describe('Parser - extractSchemas', () => {
  it('should extract schemas from components.schemas', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: { type: 'object', properties: { id: { type: 'number' } } },
          Post: { type: 'object', properties: { title: { type: 'string' } } },
        },
      },
    };

    const schemas = extractSchemas(spec);
    expect(schemas).toHaveProperty('User');
    expect(schemas).toHaveProperty('Post');
    expect(schemas.User.properties.id.type).toBe('number');
  });

  it('should return empty object if no components', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
    };

    const schemas = extractSchemas(spec);
    expect(schemas).toEqual({});
  });

  it('should return empty object if no schemas in components', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {},
    };

    const schemas = extractSchemas(spec);
    expect(schemas).toEqual({});
  });

  it('should extract multiple schemas', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: { type: 'object' },
          Post: { type: 'object' },
          Comment: { type: 'object' },
          Tag: { type: 'object' },
        },
      },
    };

    const schemas = extractSchemas(spec);
    expect(Object.keys(schemas)).toHaveLength(4);
    expect(Object.keys(schemas)).toContain('User');
    expect(Object.keys(schemas)).toContain('Post');
    expect(Object.keys(schemas)).toContain('Comment');
    expect(Object.keys(schemas)).toContain('Tag');
  });

  it('should extract complex schemas with nested structures', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
              profile: {
                type: 'object',
                properties: {
                  bio: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
      },
    };

    const schemas = extractSchemas(spec);
    expect(schemas.User.properties.profile.properties.bio.type).toBe('string');
  });

  it('should extract schemas with array types', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      components: {
        schemas: {
          Collection: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Item' },
              },
            },
          },
          Item: { type: 'object' },
        },
      },
    };

    const schemas = extractSchemas(spec);
    expect(schemas.Collection.properties.items.type).toBe('array');
  });
});

describe('Parser - Real-World Scenarios', () => {
  it('should parse a complete Pet Store OpenAPI spec', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'Swagger Petstore',
        version: '1.0.0',
      },
      paths: {
        '/pet': {
          post: {
            summary: 'Add a new pet',
            requestBody: {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
            },
          },
        },
      },
      components: {
        schemas: {
          Pet: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              status: { type: 'string', enum: ['available', 'pending', 'sold'] },
            },
            required: ['name'],
          },
          Category: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const schemas = extractSchemas(spec);
    expect(schemas).toHaveProperty('Pet');
    expect(schemas).toHaveProperty('Category');
    expect(schemas.Pet.required).toContain('name');
  });

  it('should handle spec with multiple composition patterns', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Complex API', version: '1.0.0' },
      components: {
        schemas: {
          BaseEntity: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          User: {
            allOf: [
              { $ref: '#/components/schemas/BaseEntity' },
              {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            ],
          },
        },
      },
    };

    const schemas = extractSchemas(spec);
    expect(schemas.User.allOf).toBeDefined();
  });
});
