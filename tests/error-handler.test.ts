/**
 * Tests for error handling utilities
 */

import {
  OpenAPIParserError,
  ErrorCollector,
  validateSchemaObject,
  handleParsingError
} from '../src/error-handler';

describe('ErrorCollector', () => {
  let collector: ErrorCollector;

  beforeEach(() => {
    collector = new ErrorCollector();
  });

  test('should collect errors and warnings separately', () => {
    collector.addError('INVALID', 'Invalid schema');
    collector.addWarning('DEPRECATED', 'Deprecated field');

    expect(collector.getErrors()).toHaveLength(1);
    expect(collector.getWarnings()).toHaveLength(1);
    expect(collector.getAllErrors()).toHaveLength(2);
  });

  test('should detect if errors exist', () => {
    expect(collector.hasErrors()).toBe(false);
    collector.addError('INVALID', 'Invalid schema');
    expect(collector.hasErrors()).toBe(true);
  });

  test('should clear all errors', () => {
    collector.addError('INVALID', 'Invalid');
    collector.addWarning('DEPRECATED', 'Deprecated');
    collector.clear();
    expect(collector.getAllErrors()).toHaveLength(0);
  });

  test('should serialize to JSON', () => {
    collector.addError('INVALID', 'Invalid schema');
    collector.addWarning('DEPRECATED', 'Deprecated field');
    
    const json = collector.toJSON();
    expect(json.errors).toHaveLength(1);
    expect(json.warnings).toHaveLength(1);
    expect(json.total).toBe(2);
    expect(json.hasErrors).toBe(true);
  });
});

describe('validateSchemaObject', () => {
  test('should validate null schema', () => {
    const errors = validateSchemaObject(null);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INVALID_SCHEMA');
  });

  test('should validate non-object schema', () => {
    const errors = validateSchemaObject('string');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('SCHEMA_NOT_OBJECT');
  });

  test('should warn on schema without type info', () => {
    const errors = validateSchemaObject({});
    expect(errors.some(e => e.code === 'MISSING_TYPE_INFO')).toBe(true);
  });

  test('should accept schema with type', () => {
    const errors = validateSchemaObject({ type: 'object' });
    expect(errors).toHaveLength(0);
  });

  test('should accept schema with $ref', () => {
    const errors = validateSchemaObject({ $ref: '#/components/schemas/User' });
    expect(errors).toHaveLength(0);
  });
});

describe('handleParsingError', () => {
  test('should handle OpenAPIParserError', () => {
    const error = new OpenAPIParserError('CUSTOM', 'Custom error message');
    const result = handleParsingError(error);
    expect(result.code).toBe('CUSTOM');
    expect(result.message).toBe('Custom error message');
  });

  test('should handle SyntaxError', () => {
    const error = new SyntaxError('Unexpected token');
    const result = handleParsingError(error, 'JSON Parse');
    expect(result.code).toBe('SYNTAX_ERROR');
    expect(result.message).toContain('JSON Parse');
  });

  test('should handle generic Error', () => {
    const error = new Error('Generic error');
    const result = handleParsingError(error);
    expect(result.code).toBe('PARSE_ERROR');
    expect(result.message).toContain('Generic error');
  });

  test('should handle unknown error type', () => {
    const result = handleParsingError('string error');
    expect(result.code).toBe('UNKNOWN_ERROR');
  });
});
