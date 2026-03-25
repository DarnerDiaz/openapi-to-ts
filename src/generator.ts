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
