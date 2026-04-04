import * as fs from 'fs';
import * as yaml from 'js-yaml';

/**
 * OpenAPI specification structure
 * Contains metadata, paths, and component schemas
 */
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths?: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

/**
 * Parses OpenAPI specification from JSON or YAML file
 * @param {string} filePath - Path to OpenAPI spec file (.json, .yaml, .yml)
 * @returns {OpenAPISpec} Parsed OpenAPI specification object
 * @throws {Error} If file format is not JSON, YAML, or YML
 * @example
 * ```typescript
 * const spec = parseOpenAPI('./petstore.yaml');
 * console.log(spec.info.title); // 'Swagger Petstore'
 * ```
 */
export function parseOpenAPI(filePath: string): OpenAPISpec {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (filePath.endsWith('.json')) {
    return JSON.parse(content);
  } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return yaml.load(content) as OpenAPISpec;
  }
  
  throw new Error('Unsupported file format. Use .json, .yaml, or .yml');
}

/**
 * Extracts all schema definitions from OpenAPI specification
 * @param {OpenAPISpec} spec - Parsed OpenAPI specification
 * @returns {Record<string, any>} Map of schema names to schema definitions
 * @example
 * ```typescript
 * const schemas = extractSchemas(spec);
 * console.log(schemas['User']); // User schema definition
 * ```
 */
export function extractSchemas(spec: OpenAPISpec): Record<string, any> {
  const schemas: Record<string, any> = {};
  
  // Extract from components.schemas
  if (spec.components?.schemas) {
    Object.assign(schemas, spec.components.schemas);
  }
  
  return schemas;
}
  // YAML support added
