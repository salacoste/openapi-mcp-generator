/**
 * Core code generation engine
 * Handles template rendering, formatting, and file generation
 */

import Handlebars from 'handlebars';
import fs from 'fs-extra';
import { format as prettierFormat } from 'prettier';
import { registerHelpers } from './helpers.js';
import {
  TemplateRenderError,
  TemplateNotFoundError,
  CodeFormattingError,
  DataValidationError,
} from './errors.js';
import type {
  GeneratorOptions,
  PrettierConfig,
  TemplateDataModel,
} from './types.js';

/**
 * Default Prettier configuration for generated code
 */
const DEFAULT_PRETTIER_CONFIG: PrettierConfig = {
  parser: 'typescript',
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
};

/**
 * Code generator class
 * Manages template compilation, rendering, and code formatting
 */
export class CodeGenerator {
  private templateEngine: typeof Handlebars;
  private templateCache: Map<string, HandlebarsTemplateDelegate>;
  private prettierConfig: PrettierConfig;
  private verbose: boolean;

  constructor(options: Partial<GeneratorOptions> = {}) {
    // Create isolated Handlebars instance
    this.templateEngine = Handlebars.create();

    // Register all helper functions
    registerHelpers(this.templateEngine);

    // Initialize template cache
    this.templateCache = new Map();

    // Set Prettier configuration
    this.prettierConfig = {
      ...DEFAULT_PRETTIER_CONFIG,
      ...options.prettierConfig,
    };

    // Set verbose mode
    this.verbose = options.verbose ?? false;
  }

  /**
   * Generate code from a template file
   * @param templatePath - Path to the Handlebars template file
   * @param data - Data to pass to the template
   * @param outputPath - Optional output file path (for writing)
   * @returns Rendered and formatted code
   */
  async generateFromTemplate(
    templatePath: string,
    data: TemplateDataModel | Record<string, unknown>,
    outputPath?: string
  ): Promise<string> {
    try {
      // Validate template exists
      await this.validateTemplateExists(templatePath);

      // Load and compile template
      const template = await this.loadTemplate(templatePath);

      // Validate data
      this.validateTemplateData(data);

      // Render template
      const rendered = this.renderTemplate(template, data, templatePath);

      // Format code with Prettier
      const formatted = await this.formatCode(rendered);

      // Log if verbose
      if (this.verbose) {
        this.log(`Generated code from template: ${templatePath}`);
        if (outputPath) {
          this.log(`Output will be written to: ${outputPath}`);
        }
      }

      return formatted;
    } catch (error) {
      if (
        error instanceof TemplateRenderError ||
        error instanceof TemplateNotFoundError ||
        error instanceof CodeFormattingError ||
        error instanceof DataValidationError
      ) {
        throw error;
      }

      throw new TemplateRenderError(
        `Failed to generate from template: ${error instanceof Error ? error.message : String(error)}`,
        templatePath,
        undefined,
        { originalError: error }
      );
    }
  }

  /**
   * Validate that template file exists
   */
  private async validateTemplateExists(templatePath: string): Promise<void> {
    const exists = await fs.pathExists(templatePath);
    if (!exists) {
      throw new TemplateNotFoundError(templatePath);
    }
  }

  /**
   * Load and compile template from file
   * Uses cache to avoid recompiling the same template
   */
  private async loadTemplate(
    templatePath: string
  ): Promise<HandlebarsTemplateDelegate> {
    // Check cache
    const cached = this.templateCache.get(templatePath);
    if (cached) {
      return cached;
    }

    try {
      // Read template file
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Compile template
      const compiled = this.templateEngine.compile(templateContent, {
        strict: true,
        noEscape: false,
      });

      // Cache compiled template
      this.templateCache.set(templatePath, compiled);

      return compiled;
    } catch (error) {
      throw new TemplateRenderError(
        `Failed to load template: ${error instanceof Error ? error.message : String(error)}`,
        templatePath,
        undefined,
        { originalError: error }
      );
    }
  }

  /**
   * Validate template data has required fields
   */
  private validateTemplateData(
    data: TemplateDataModel | Record<string, unknown>
  ): void {
    if (!data || typeof data !== 'object') {
      throw new DataValidationError(
        'Template data must be an object',
        ['data'],
        { receivedType: typeof data }
      );
    }

    // Basic validation - check that data is not empty
    if (Object.keys(data).length === 0) {
      throw new DataValidationError(
        'Template data is empty',
        ['data'],
        { data }
      );
    }
  }

  /**
   * Render template with data
   */
  private renderTemplate(
    template: HandlebarsTemplateDelegate,
    data: TemplateDataModel | Record<string, unknown>,
    templatePath: string
  ): string {
    try {
      return template(data);
    } catch (error) {
      // Extract line number from Handlebars error if available
      const lineNumber = this.extractLineNumber(error);

      throw new TemplateRenderError(
        `Template rendering failed: ${error instanceof Error ? error.message : String(error)}`,
        templatePath,
        lineNumber,
        { originalError: error }
      );
    }
  }

  /**
   * Format code with Prettier
   */
  private async formatCode(code: string): Promise<string> {
    try {
      return await prettierFormat(code, this.prettierConfig as Record<string, unknown>);
    } catch (error) {
      // If Prettier fails, return unformatted code
      // This can happen with non-TypeScript content like plain text or partial code
      if (this.verbose) {
        this.log(
          `Warning: Prettier formatting failed, returning unformatted code: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      return code;
    }
  }

  /**
   * Extract line number from Handlebars error
   */
  private extractLineNumber(error: unknown): number | undefined {
    if (error instanceof Error && 'lineNumber' in error) {
      return error.lineNumber as number;
    }
    return undefined;
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.verbose) {
       
      console.log(`[CodeGenerator] ${message}`);
    }
  }

  /**
   * Clear template cache
   * Useful for development or when templates change
   */
  clearCache(): void {
    this.templateCache.clear();
    if (this.verbose) {
      this.log('Template cache cleared');
    }
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.templateCache.size;
  }

  /**
   * Register a custom helper function
   * Useful for adding project-specific helpers
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.templateEngine.registerHelper(name, helper);
    if (this.verbose) {
      this.log(`Registered custom helper: ${name}`);
    }
  }

  /**
   * Register a partial template
   * Partials can be reused across multiple templates
   */
  registerPartial(name: string, partial: string): void {
    this.templateEngine.registerPartial(name, partial);
    if (this.verbose) {
      this.log(`Registered partial: ${name}`);
    }
  }
}
