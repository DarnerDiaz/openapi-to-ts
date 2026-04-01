/**
 * OpenAPI Error Handling Utilities
 * 
 * Comprehensive error handling, validation, and recovery utilities for OpenAPI parsing.
 */

export interface ParserError {
  code: string;
  message: string;
  path?: string;
  severity: 'error' | 'warning';
  context?: Record<string, any>;
}

export class OpenAPIParserError extends Error {
  constructor(
    code: string,
    message: string,
    public severity: 'error' | 'warning' = 'error',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'OpenAPIParserError';
    this.code = code;
    Object.setPrototypeOf(this, OpenAPIParserError.prototype);
  }
}

export class ErrorCollector {
  private errors: ParserError[] = [];

  add(error: ParserError): void {
    this.errors.push(error);
  }

  addError(code: string, message: string, path?: string, context?: Record<string, any>): void {
    this.add({
      code,
      message,
      path,
      severity: 'error',
      context
    });
  }

  addWarning(code: string, message: string, path?: string, context?: Record<string, any>): void {
    this.add({
      code,
      message,
      path,
      severity: 'warning',
      context
    });
  }

  hasErrors(): boolean {
    return this.errors.some(e => e.severity === 'error');
  }

  getErrors(): ParserError[] {
    return this.errors.filter(e => e.severity === 'error');
  }

  getWarnings(): ParserError[] {
    return this.errors.filter(e => e.severity === 'warning');
  }

  getAllErrors(): ParserError[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }

  toJSON(): Record<string, any> {
    return {
      errors: this.getErrors(),
      warnings: this.getWarnings(),
      total: this.errors.length,
      hasErrors: this.hasErrors()
    };
  }
}

export function validateSchemaObject(schema: any, path: string = 'root'): ParserError[] {
  const errors: ParserError[] = [];

  if (!schema) {
    errors.push({
      code: 'INVALID_SCHEMA',
      message: 'Schema object is null or undefined',
      path,
      severity: 'error'
    });
    return errors;
  }

  if (typeof schema !== 'object') {
    errors.push({
      code: 'SCHEMA_NOT_OBJECT',
      message: `Schema must be an object, got ${typeof schema}`,
      path,
      severity: 'error'
    });
    return errors;
  }

  // Validate required fields for OpenAPI 3.0+
  if (!schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
    errors.push({
      code: 'MISSING_TYPE_INFO',
      message: 'Schema must define type, $ref, allOf, oneOf, or anyOf',
      path,
      severity: 'warning'
    });
  }

  return errors;
}

export function handleParsingError(error: unknown, context: string = 'OpenAPI Parsing'): ParserError {
  if (error instanceof OpenAPIParserError) {
    return {
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context
    };
  }

  if (error instanceof SyntaxError) {
    return {
      code: 'SYNTAX_ERROR',
      message: `${context}: ${error.message}`,
      severity: 'error',
      context: { original: error.message }
    };
  }

  if (error instanceof Error) {
    return {
      code: 'PARSE_ERROR',
      message: `${context}: ${error.message}`,
      severity: 'error',
      context: { original: error.message }
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: `${context}: Unknown error occurred`,
    severity: 'error',
    context: { original: String(error) }
  };
}
