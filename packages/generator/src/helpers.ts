/**
 * Template helper functions for Handlebars
 * These helpers provide utilities for case conversion, type mapping, and code generation
 */

import type Handlebars from 'handlebars';

/**
 * Convert string to camelCase
 * Example: "user-name" -> "userName", "user_name" -> "userName"
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

/**
 * Convert string to PascalCase
 * Example: "user-name" -> "UserName", "user_name" -> "UserName"
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Convert string to kebab-case
 * Example: "userName" -> "user-name", "UserName" -> "user-name"
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * Example: "userName" -> "user_name", "UserName" -> "user_name"
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to SCREAMING_SNAKE_CASE
 * Example: "userName" -> "USER_NAME"
 */
export function screamingSnakeCase(str: string): string {
  return snakeCase(str).toUpperCase();
}

/**
 * Convert OpenAPI type to TypeScript type
 */
export function toTsType(openApiType: string, format?: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'number',
    boolean: 'boolean',
    array: 'Array',
    object: 'object',
    null: 'null',
  };

  // Handle format-specific types
  if (openApiType === 'string' && format) {
    const formatMap: Record<string, string> = {
      'date-time': 'string', // Could be Date, but string is safer
      date: 'string',
      time: 'string',
      email: 'string',
      uuid: 'string',
      uri: 'string',
      binary: 'Buffer',
      byte: 'string',
    };
    return formatMap[format] || 'string';
  }

  return typeMap[openApiType] || 'unknown';
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simple pluralize function (English only)
 */
export function pluralize(str: string): string {
  // Words ending in z: double the z before adding es (quiz -> quizzes)
  if (str.endsWith('z')) {
    return str + 'zes';
  }
  if (str.endsWith('s') || str.endsWith('x')) {
    return str + 'es';
  }
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  return str + 's';
}

/**
 * Escape string for use in comments
 */
export function escapeComment(str: string): string {
  return str.replace(/\*\//g, '*\\/');
}

/**
 * Indent text by specified number of spaces
 */
export function indent(text: string, spaces: number = 2): string {
  const indentation = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.trim() ? indentation + line : line))
    .join('\n');
}

/**
 * Format JSDoc comment
 */
export function formatComment(text: string, indent: number = 0): string {
  const indentation = ' '.repeat(indent);
  const escaped = escapeComment(text);
  const lines = escaped.split('\n');

  if (lines.length === 1) {
    return `${indentation}/** ${lines[0]} */`;
  }

  return [
    `${indentation}/**`,
    ...lines.map((line) => `${indentation} * ${line}`),
    `${indentation} */`,
  ].join('\n');
}

/**
 * Equality comparison
 */
export function eq(a: unknown, b: unknown): boolean {
  return a === b;
}

/**
 * Not equal comparison
 */
export function ne(a: unknown, b: unknown): boolean {
  return a !== b;
}

/**
 * Greater than comparison
 */
export function gt(a: number, b: number): boolean {
  return a > b;
}

/**
 * Greater than or equal comparison
 */
export function gte(a: number, b: number): boolean {
  return a >= b;
}

/**
 * Less than comparison
 */
export function lt(a: number, b: number): boolean {
  return a < b;
}

/**
 * Less than or equal comparison
 */
export function lte(a: number, b: number): boolean {
  return a <= b;
}

/**
 * Logical AND
 */
export function and(...args: unknown[]): boolean {
  // Last argument is Handlebars options object
  const values = args.slice(0, -1);
  return values.every((v) => !!v);
}

/**
 * Logical OR
 */
export function or(...args: unknown[]): boolean {
  // Last argument is Handlebars options object
  const values = args.slice(0, -1);
  return values.some((v) => !!v);
}

/**
 * Logical NOT
 */
export function not(value: unknown): boolean {
  return !value;
}

/**
 * Register all helper functions with Handlebars
 */
export function registerHelpers(handlebars: typeof Handlebars): void {
  // Case conversion helpers
  handlebars.registerHelper('camelCase', camelCase);
  handlebars.registerHelper('PascalCase', pascalCase);
  handlebars.registerHelper('kebabCase', kebabCase);
  handlebars.registerHelper('snakeCase', snakeCase);
  handlebars.registerHelper('screamingSnakeCase', screamingSnakeCase);

  // Type conversion
  handlebars.registerHelper('toTsType', toTsType);

  // String utilities
  handlebars.registerHelper('capitalize', capitalize);
  handlebars.registerHelper('pluralize', pluralize);
  handlebars.registerHelper('escapeComment', escapeComment);
  handlebars.registerHelper('indent', indent);
  handlebars.registerHelper('formatComment', formatComment);

  // Comparison helpers
  handlebars.registerHelper('eq', eq);
  handlebars.registerHelper('ne', ne);
  handlebars.registerHelper('gt', gt);
  handlebars.registerHelper('gte', gte);
  handlebars.registerHelper('lt', lt);
  handlebars.registerHelper('lte', lte);

  // Logical helpers
  handlebars.registerHelper('and', and);
  handlebars.registerHelper('or', or);
  handlebars.registerHelper('not', not);

  // JSON stringify helper
  handlebars.registerHelper('json', (context: unknown) => {
    return JSON.stringify(context, null, 2);
  });
}
