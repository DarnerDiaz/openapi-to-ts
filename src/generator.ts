export interface TypeDefinition {
  name: string;
  properties: Record<string, PropertyType>;
}

export interface PropertyType {
  type: string;
  required?: boolean;
  description?: string;
}

export function generateTypeScript(schemaName: string, schema: any): string {
  const properties = schema.properties || {};
  const required = schema.required || [];
  
  let typeScript = `interface ${schemaName} {\n`;
  
  for (const [propName, propSchema] of Object.entries(properties)) {
    const prop = propSchema as any;
    const isRequired = required.includes(propName);
    const optionalMarker = isRequired ? '' : '?';
    const tsType = mapOpenAPITypeToTS(prop);
    
    typeScript += `  ${propName}${optionalMarker}: ${tsType};\n`;
  }
  
  typeScript += '}\n';
  
  return typeScript;
}

function mapOpenAPITypeToTS(schema: any): string {
  // Handle composition types (allOf, anyOf, oneOf)
  if (schema.allOf) {
    const types = schema.allOf.map(s => mapOpenAPITypeToTS(s)).join(' & ');
    return `(${types})`;
  }
  if (schema.anyOf) {
    const types = schema.anyOf.map(s => mapOpenAPITypeToTS(s)).join(' | ');
    return `(${types})`;
  }
  if (schema.oneOf) {
    const types = schema.oneOf.map(s => mapOpenAPITypeToTS(s)).join(' | ');
    return `(${types})`;
  }
  
  // Handle basic types
  if (schema.type === 'string') {
    if (schema.enum) {
      return schema.enum.map((v: string) => `"${v}"`).join(' | ');
    }
    return 'string';
  }
  if (schema.type === 'number' || schema.type === 'integer') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') {
    return `${mapOpenAPITypeToTS(schema.items || {})}[]`;
  }
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }
  
  return 'any';
}

export function generateAllTypes(schemas: Record<string, any>): string {
  const types = Object.entries(schemas)
    .map(([name, schema]) => generateTypeScript(name, schema))
    .join('\n');
  
  return types;
}

export function handleCompositionTypes(schema: any): string {
  if (schema.allOf) {
    const types = schema.allOf.map(s => mapOpenAPITypeToTS(s)).join(' & ');
    return types;
  }
  if (schema.anyOf) {
    const types = schema.anyOf.map(s => mapOpenAPITypeToTS(s)).join(' | ');
    return types;
  }
  if (schema.oneOf) {
    const types = schema.oneOf.map(s => mapOpenAPITypeToTS(s)).join(' | ');
    return types;
  }
  return 'any';
}

export function handleNullableTypes(schema: any): string {
  const baseType = mapOpenAPITypeToTS(schema);
  return schema.nullable ? `${baseType} | null` : baseType;
}
