/**
 * Swagger 2.0 (OpenAPI 2.0) Support Module
 * 
 * Adds support for parsing and converting Swagger 2.0 specifications to TypeScript types.
 * Maintains backward compatibility with OpenAPI 3.0+ specifications.
 */

export interface Swagger2Schema {
  swagger: '2.0';
  info: {
    title: string;
    version: string;
    description?: string;
  };
  host?: string;
  basePath?: string;
  schemes?: string[];
  consumes?: string[];
  produces?: string[];
  paths: Record<string, any>;
  definitions?: Record<string, any>;
  parameters?: Record<string, any>;
  responses?: Record<string, any>;
  securityDefinitions?: Record<string, any>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
  externalDocs?: {
    url: string;
    description?: string;
  };
}

export interface SwaggerDefinition {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  items?: any;
  enum?: any[];
  default?: any;
  description?: string;
  format?: string;
  example?: any;
  xml?: Record<string, any>;
}

export class Swagger2Parser {
  /**
   * Parse Swagger 2.0 specification
   */
  static parse(spec: unknown): Swagger2Schema {
    if (!spec || typeof spec !== 'object') {
      throw new Error('Invalid Swagger specification');
    }

    const swagger = spec as Record<string, any>;
    
    if (swagger.swagger !== '2.0') {
      throw new Error('Not a Swagger 2.0 specification');
    }

    return swagger as Swagger2Schema;
  }

  /**
   * Convert Swagger 2.0 definitions to OpenAPI 3.0 format
   */
  static toOpenAPI3Format(swagger: Swagger2Schema): Record<string, any> {
    const openapi3 = {
      openapi: '3.0.0',
      info: swagger.info,
      servers: this.buildServers(swagger),
      paths: this.convertPaths(swagger.paths),
      components: {
        schemas: swagger.definitions || {},
        securitySchemes: swagger.securityDefinitions || {}
      }
    };

    return openapi3;
  }

  /**
   * Build servers array from Swagger 2.0 host/basePath
   */
  private static buildServers(swagger: Swagger2Schema): any[] {
    if (!swagger.host) {
      return [];
    }

    const scheme = swagger.schemes?.[0] || 'https';
    const basePath = swagger.basePath || '';
    
    return [{
      url: `${scheme}://${swagger.host}${basePath}`,
      description: 'API Server'
    }];
  }

  /**
   * Convert Swagger 2.0 paths to OpenAPI 3.0 format
   */
  private static convertPaths(paths: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};

    for (const [path, pathItem] of Object.entries(paths)) {
      converted[path] = this.convertPathItem(pathItem);
    }

    return converted;
  }

  /**
   * Convert individual path item
   */
  private static convertPathItem(pathItem: Record<string, any>): Record<string, any> {
    const converted: Record<string, any> = {};

    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method)) {
        converted[method] = this.convertOperation(operation as Record<string, any>);
      }
    }

    return converted;
  }

  /**
   * Convert operation object
   */
  private static convertOperation(operation: Record<string, any>): Record<string, any> {
    return {
      summary: operation.summary,
      description: operation.description,
      operationId: operation.operationId,
      tags: operation.tags,
      parameters: operation.parameters,
      requestBody: operation.parameters?.find((p: any) => p.in === 'body') ? {
        content: {
          'application/json': {
            schema: operation.parameters.find((p: any) => p.in === 'body').schema
          }
        }
      } : undefined,
      responses: operation.responses
    };
  }

  /**
   * Extract TypeScript types from Swagger 2.0 definitions
   */
  static extractDefinitions(swagger: Swagger2Schema): Record<string, SwaggerDefinition> {
    return swagger.definitions || {};
  }

  /**
   * Check if specification is Swagger 2.0
   */
  static isSwagger2(spec: unknown): boolean {
    if (!spec || typeof spec !== 'object') {
      return false;
    }

    return (spec as Record<string, any>).swagger === '2.0';
  }
}

/**
 * Convert Swagger 2.0 definition to TypeScript interface
 */
export function swaggerDefinitionToInterface(
  name: string,
  definition: SwaggerDefinition,
  indent: string = ''
): string {
  let result = `${indent}interface ${name} {\n`;

  if (definition.properties) {
    for (const [key, prop] of Object.entries(definition.properties)) {
      const required = definition.required?.includes(key) ? '' : '?';
      const type = getTypeName(prop);
      const description = prop.description ? `  ${indent}/** ${prop.description} */\n` : '';
      
      result += `${description}${indent}  ${key}${required}: ${type};\n`;
    }
  }

  result += `${indent}}`;
  return result;
}

/**
 * Get TypeScript type name from Swagger definition
 */
function getTypeName(definition: any): string {
  if (!definition) return 'any';

  if (definition.$ref) {
    return definition.$ref.split('/').pop() || 'any';
  }

  if (definition.type === 'array') {
    const itemType = definition.items ? getTypeName(definition.items) : 'any';
    return `${itemType}[]`;
  }

  if (definition.type === 'object') {
    return 'Record<string, any>';
  }

  if (definition.enum) {
    return definition.enum.map((v: any) => 
      typeof v === 'string' ? `'${v}'` : v
    ).join(' | ');
  }

  return mapSwaggerTypeToTS(definition.type, definition.format);
}

/**
 * Map Swagger types to TypeScript types
 */
function mapSwaggerTypeToTS(type?: string, format?: string): string {
  if (!type) return 'any';

  const typeMap: Record<string, string> = {
    'string': 'string',
    'number': 'number',
    'integer': 'number',
    'boolean': 'boolean',
    'array': 'any[]',
    'object': 'Record<string, any>'
  };

  let tsType = typeMap[type] || 'any';

  // Handle format modifiers
  if (format === 'date-time') tsType = 'Date';
  if (format === 'date') tsType = 'string';
  if (format === 'uuid') tsType = 'string';

  return tsType;
}
