/**
 * Generator package entry point
 * Exports code generation engine, template helpers, types, and utilities
 */

// Core generator
export { CodeGenerator } from './generator.js';

// MCP Server generator (main entry point)
export { generateMCPServer } from './mcp-generator.js';

// Interface generator
export * from './interface-generator.js';

// Tool generator
export * from './tool-generator.js';

// Parameter mapper
export * from './parameter-mapper.js';

// Response processor
export * from './response-processor.js';

// Scaffolder
export * from './scaffolder.js';

// Template helpers
export * from './helpers.js';

// Types
export * from './types.js';

// Errors
export * from './errors.js';

// File system utilities
export * from './fs-utils.js';

// Logger
export * from './utils/logger.js';

// Validation Reporter
export * from './validation-reporter.js';

// Security Analyzer (Story 4.6)
export * from './security-analyzer.js';

export const version = '0.1.0';
