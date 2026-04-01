/**
 * Tests for Swagger 2.0 parser
 */

import {
  Swagger2Parser,
  swaggerDefinitionToInterface,
  Swagger2Schema
} from '../src/swagger2-parser';

describe('Swagger2Parser', () => {
  const mockSwagger2: Swagger2Schema = {
    swagger: '2.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API Description'
    },
    host: 'api.example.com',
    basePath: '/v1',
    schemes: ['https'],
    paths: {
      '/users': {
        get: {
          summary: 'Get users',
          operationId: 'getUsers',
          responses: {
            '200': {
              description: 'Success'
            }
          }
        }
      }
    },
    definitions: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' }
        },
        required: ['id', 'name']
      }
    }
  };

  test('should parse valid Swagger 2.0 specification', () => {
    const parsed = Swagger2Parser.parse(mockSwagger2);
    expect(parsed.swagger).toBe('2.0');
    expect(parsed.info.title).toBe('Test API');
  });

  test('should throw on invalid swagger version', () => {
    const invalid = { ...mockSwagger2, swagger: '3.0' };
    expect(() => Swagger2Parser.parse(invalid)).toThrow();
  });

  test('should detect Swagger 2.0 specifications', () => {
    expect(Swagger2Parser.isSwagger2(mockSwagger2)).toBe(true);
    expect(Swagger2Parser.isSwagger2({ openapi: '3.0.0' })).toBe(false);
  });

  test('should convert to OpenAPI 3.0 format', () => {
    const openapi3 = Swagger2Parser.toOpenAPI3Format(mockSwagger2);
    expect(openapi3.openapi).toBe('3.0.0');
    expect(openapi3.servers).toHaveLength(1);
    expect(openapi3.servers[0].url).toContain('api.example.com');
  });

  test('should extract definitions', () => {
    const definitions = Swagger2Parser.extractDefinitions(mockSwagger2);
    expect(definitions.User).toBeDefined();
    expect(definitions.User.type).toBe('object');
  });

  test('should build servers from host and basePath', () => {
    const servers = Swagger2Parser.toOpenAPI3Format(mockSwagger2).servers;
    expect(servers[0].url).toBe('https://api.example.com/v1');
  });

  test('should handle missing host', () => {
    const noHost = { ...mockSwagger2, host: undefined };
    const openapi3 = Swagger2Parser.toOpenAPI3Format(noHost);
    expect(openapi3.servers).toEqual([]);
  });
});

describe('swaggerDefinitionToInterface', () => {
  test('should convert swagger definition to TypeScript interface', () => {
    const definition = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      },
      required: ['id', 'name']
    };

    const result = swaggerDefinitionToInterface('User', definition);
    expect(result).toContain('interface User');
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
    expect(result).toContain('email?: string');
  });

  test('should handle nested objects', () => {
    const definition = {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            bio: { type: 'string' }
          }
        }
      }
    };

    const result = swaggerDefinitionToInterface('User', definition);
    expect(result).toContain('profile');
  });

  test('should include JSDoc descriptions', () => {
    const definition = {
      type: 'object',
      properties: {
        name: { 
          type: 'string',
          description: 'User full name'
        }
      }
    };

    const result = swaggerDefinitionToInterface('User', definition);
    expect(result).toContain('/** User full name */');
  });
});
