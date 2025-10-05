/**
 * Tests for template helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  screamingSnakeCase,
  toTsType,
  capitalize,
  pluralize,
  escapeComment,
  indent,
  formatComment,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  and,
  or,
  not,
} from '../src/helpers.js';

describe('Case Conversion Helpers', () => {
  describe('camelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(camelCase('user-name')).toBe('userName');
      expect(camelCase('api-key-value')).toBe('apiKeyValue');
    });

    it('should convert snake_case to camelCase', () => {
      expect(camelCase('user_name')).toBe('userName');
      expect(camelCase('api_key_value')).toBe('apiKeyValue');
    });

    it('should convert space-separated to camelCase', () => {
      expect(camelCase('user name')).toBe('userName');
      expect(camelCase('API Key Value')).toBe('aPIKeyValue');
    });

    it('should handle already camelCase strings', () => {
      expect(camelCase('userName')).toBe('userName');
    });

    it('should handle PascalCase strings', () => {
      expect(camelCase('UserName')).toBe('userName');
    });
  });

  describe('pascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      expect(pascalCase('user-name')).toBe('UserName');
      expect(pascalCase('api-key-value')).toBe('ApiKeyValue');
    });

    it('should convert snake_case to PascalCase', () => {
      expect(pascalCase('user_name')).toBe('UserName');
    });

    it('should convert camelCase to PascalCase', () => {
      expect(pascalCase('userName')).toBe('UserName');
    });

    it('should handle already PascalCase strings', () => {
      expect(pascalCase('UserName')).toBe('UserName');
    });
  });

  describe('kebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(kebabCase('userName')).toBe('user-name');
      expect(kebabCase('apiKeyValue')).toBe('api-key-value');
    });

    it('should convert PascalCase to kebab-case', () => {
      expect(kebabCase('UserName')).toBe('user-name');
    });

    it('should convert snake_case to kebab-case', () => {
      expect(kebabCase('user_name')).toBe('user-name');
    });

    it('should handle already kebab-case strings', () => {
      expect(kebabCase('user-name')).toBe('user-name');
    });
  });

  describe('snakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(snakeCase('userName')).toBe('user_name');
      expect(snakeCase('apiKeyValue')).toBe('api_key_value');
    });

    it('should convert PascalCase to snake_case', () => {
      expect(snakeCase('UserName')).toBe('user_name');
    });

    it('should convert kebab-case to snake_case', () => {
      expect(snakeCase('user-name')).toBe('user_name');
    });

    it('should handle already snake_case strings', () => {
      expect(snakeCase('user_name')).toBe('user_name');
    });
  });

  describe('screamingSnakeCase', () => {
    it('should convert camelCase to SCREAMING_SNAKE_CASE', () => {
      expect(screamingSnakeCase('userName')).toBe('USER_NAME');
      expect(screamingSnakeCase('apiKeyValue')).toBe('API_KEY_VALUE');
    });

    it('should convert PascalCase to SCREAMING_SNAKE_CASE', () => {
      expect(screamingSnakeCase('UserName')).toBe('USER_NAME');
    });

    it('should convert kebab-case to SCREAMING_SNAKE_CASE', () => {
      expect(screamingSnakeCase('user-name')).toBe('USER_NAME');
    });
  });
});

describe('Type Conversion Helpers', () => {
  describe('toTsType', () => {
    it('should convert OpenAPI primitive types to TypeScript', () => {
      expect(toTsType('string')).toBe('string');
      expect(toTsType('number')).toBe('number');
      expect(toTsType('integer')).toBe('number');
      expect(toTsType('boolean')).toBe('boolean');
      expect(toTsType('array')).toBe('Array');
      expect(toTsType('object')).toBe('object');
      expect(toTsType('null')).toBe('null');
    });

    it('should handle unknown types', () => {
      expect(toTsType('unknown-type')).toBe('unknown');
    });

    it('should handle format-specific string types', () => {
      expect(toTsType('string', 'date-time')).toBe('string');
      expect(toTsType('string', 'date')).toBe('string');
      expect(toTsType('string', 'email')).toBe('string');
      expect(toTsType('string', 'uuid')).toBe('string');
      expect(toTsType('string', 'uri')).toBe('string');
      expect(toTsType('string', 'binary')).toBe('Buffer');
    });
  });
});

describe('String Utilities', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('should handle already capitalized strings', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('pluralize', () => {
    it('should pluralize regular words', () => {
      expect(pluralize('user')).toBe('users');
      expect(pluralize('item')).toBe('items');
    });

    it('should handle words ending in s/x/z', () => {
      expect(pluralize('class')).toBe('classes');
      expect(pluralize('box')).toBe('boxes');
      expect(pluralize('quiz')).toBe('quizzes');
    });

    it('should handle words ending in y', () => {
      expect(pluralize('category')).toBe('categories');
      expect(pluralize('city')).toBe('cities');
    });
  });

  describe('escapeComment', () => {
    it('should escape closing comment markers', () => {
      expect(escapeComment('Normal comment')).toBe('Normal comment');
      expect(escapeComment('Comment */ with closing')).toBe('Comment *\\/ with closing');
    });
  });

  describe('indent', () => {
    it('should indent single line with default 2 spaces', () => {
      expect(indent('hello')).toBe('  hello');
    });

    it('should indent single line with custom spaces', () => {
      expect(indent('hello', 4)).toBe('    hello');
    });

    it('should indent multiline text', () => {
      const input = 'line1\nline2\nline3';
      const expected = '  line1\n  line2\n  line3';
      expect(indent(input)).toBe(expected);
    });

    it('should preserve empty lines', () => {
      const input = 'line1\n\nline3';
      const expected = '  line1\n\n  line3';
      expect(indent(input)).toBe(expected);
    });
  });

  describe('formatComment', () => {
    it('should format single-line comment', () => {
      expect(formatComment('Hello world')).toBe('/** Hello world */');
    });

    it('should format single-line comment with indent', () => {
      expect(formatComment('Hello world', 2)).toBe('  /** Hello world */');
    });

    it('should format multiline comment', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const expected = '/**\n * Line 1\n * Line 2\n * Line 3\n */';
      expect(formatComment(input)).toBe(expected);
    });

    it('should format multiline comment with indent', () => {
      const input = 'Line 1\nLine 2';
      const expected = '  /**\n   * Line 1\n   * Line 2\n   */';
      expect(formatComment(input, 2)).toBe(expected);
    });

    it('should escape comment markers', () => {
      const input = 'Comment */ with closing';
      expect(formatComment(input)).toContain('*\\/');
    });
  });
});

describe('Comparison Helpers', () => {
  describe('eq', () => {
    it('should return true for equal values', () => {
      expect(eq(1, 1)).toBe(true);
      expect(eq('hello', 'hello')).toBe(true);
      expect(eq(true, true)).toBe(true);
    });

    it('should return false for different values', () => {
      expect(eq(1, 2)).toBe(false);
      expect(eq('hello', 'world')).toBe(false);
      expect(eq(true, false)).toBe(false);
    });
  });

  describe('ne', () => {
    it('should return true for different values', () => {
      expect(ne(1, 2)).toBe(true);
      expect(ne('hello', 'world')).toBe(true);
    });

    it('should return false for equal values', () => {
      expect(ne(1, 1)).toBe(false);
      expect(ne('hello', 'hello')).toBe(false);
    });
  });

  describe('gt', () => {
    it('should return true when first is greater', () => {
      expect(gt(2, 1)).toBe(true);
      expect(gt(10, 5)).toBe(true);
    });

    it('should return false when first is not greater', () => {
      expect(gt(1, 2)).toBe(false);
      expect(gt(1, 1)).toBe(false);
    });
  });

  describe('gte', () => {
    it('should return true when first is greater or equal', () => {
      expect(gte(2, 1)).toBe(true);
      expect(gte(1, 1)).toBe(true);
    });

    it('should return false when first is less', () => {
      expect(gte(1, 2)).toBe(false);
    });
  });

  describe('lt', () => {
    it('should return true when first is less', () => {
      expect(lt(1, 2)).toBe(true);
    });

    it('should return false when first is not less', () => {
      expect(lt(2, 1)).toBe(false);
      expect(lt(1, 1)).toBe(false);
    });
  });

  describe('lte', () => {
    it('should return true when first is less or equal', () => {
      expect(lte(1, 2)).toBe(true);
      expect(lte(1, 1)).toBe(true);
    });

    it('should return false when first is greater', () => {
      expect(lte(2, 1)).toBe(false);
    });
  });
});

describe('Logical Helpers', () => {
  describe('and', () => {
    it('should return true when all values are truthy', () => {
      expect(and(true, true, {})).toBe(true);
      expect(and(1, 'hello', {})).toBe(true);
    });

    it('should return false when any value is falsy', () => {
      expect(and(true, false, {})).toBe(false);
      expect(and(1, 0, {})).toBe(false);
      expect(and('', true, {})).toBe(false);
    });
  });

  describe('or', () => {
    it('should return true when any value is truthy', () => {
      expect(or(false, true, {})).toBe(true);
      expect(or(0, 1, {})).toBe(true);
    });

    it('should return false when all values are falsy', () => {
      expect(or(false, false, {})).toBe(false);
      expect(or(0, '', {})).toBe(false);
    });
  });

  describe('not', () => {
    it('should return true for falsy values', () => {
      expect(not(false)).toBe(true);
      expect(not(0)).toBe(true);
      expect(not('')).toBe(true);
      expect(not(null)).toBe(true);
      expect(not(undefined)).toBe(true);
    });

    it('should return false for truthy values', () => {
      expect(not(true)).toBe(false);
      expect(not(1)).toBe(false);
      expect(not('hello')).toBe(false);
      expect(not({})).toBe(false);
    });
  });
});
