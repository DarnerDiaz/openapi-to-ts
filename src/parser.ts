import * as fs from 'fs';
import * as yaml from 'js-yaml';

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

export function parseOpenAPI(filePath: string): OpenAPISpec {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (filePath.endsWith('.json')) {
    return JSON.parse(content);
  } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return yaml.load(content) as OpenAPISpec;
  }
  
  throw new Error('Unsupported file format. Use .json, .yaml, or .yml');
}

export function extractSchemas(spec: OpenAPISpec): Record<string, any> {
  const schemas: Record<string, any> = {};
  
  // Extract from components.schemas
  if (spec.components?.schemas) {
    Object.assign(schemas, spec.components.schemas);
  }
  
  return schemas;
}
