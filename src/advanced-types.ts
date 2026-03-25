/**
 * Utility functions for advanced OpenAPI type generation
 */

export interface AdvancedTypeOptions {
  strict?: boolean;
  nullable?: boolean;
  additionalProps?: boolean;
}

export function handleAdditionalProperties(schema: any): string {
  if (!schema.additionalProperties) {
    return '';
  }
  
  if (schema.additionalProperties === true) {
    return '[key: string]: any;';
  }
  
  if (typeof schema.additionalProperties === 'object') {
    const propType = mapSchemaToType(schema.additionalProperties);
    return `[key: string]: ${propType};`;
  }
  
  return '';
}

function mapSchemaToType(schema: any): string {
  if (schema.type === 'string') return 'string';
  if (schema.type === 'number') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') return 'any[]';
  if (schema.$ref) return schema.$ref.split('/').pop() || 'any';
  return 'any';
}

export function generateStrictTypes(schemaName: string, schema: any): string {
  const properties = schema.properties || {};
  const required = new Set(schema.required || []);

  let typeScript = `interface ${schemaName} {\n`;

  for (const [propName, propSchema] of Object.entries(properties)) {
    const prop = propSchema as any;
    const isRequired = required.has(propName);
    const optionalMarker = isRequired ? '' : '?';
    // In strict mode, all optional properties must be explicit
    
    typeScript += `  ${propName}${optionalMarker}: any;\n`;
  }

  typeScript += '}\n';
  return typeScript;
}

export function extractDescription(schema: any): string {
  return schema.description ? `/** ${schema.description} */\n` : '';
}
