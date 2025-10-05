/**
 * Error formatting utilities for user-friendly error display
 * Uses chalk for color formatting and box drawing for visual structure
 */

import chalk from 'chalk';
import type { BaseError } from './base-error.js';

export interface FormatOptions {
  /**
   * Show stack trace (verbose mode)
   */
  verbose?: boolean;

  /**
   * Show colored output
   */
  colors?: boolean;
}

/**
 * Format error for display to user
 * Creates a visually structured error message with context and suggested fix
 */
export function formatError(error: unknown, options: FormatOptions = {}): string {
  const { verbose = false, colors = true } = options;

  // Handle non-Error objects
  if (!(error instanceof Error)) {
    const message = String(error);
    return colors ? chalk.red(`❌ Error: ${message}`) : `❌ Error: ${message}`;
  }

  const lines: string[] = [];

  // Top border
  lines.push('┌─────────────────────────────────────────────────┐');

  // Error type (red)
  const errorType = error.name || 'Error';
  const typeLineContent = `│ ❌ ${errorType}`;
  const padding = ' '.repeat(50 - typeLineContent.length);
  lines.push(colors ? chalk.red(typeLineContent + padding + '│') : typeLineContent + padding + '│');

  // Separator
  lines.push('├─────────────────────────────────────────────────┤');

  // Error message
  const message = error.message;
  const messageLines = wrapText(message, 47);
  for (const line of messageLines) {
    const linePadding = ' '.repeat(47 - line.length);
    lines.push(`│ ${line}${linePadding} │`);
  }

  // Context (if available)
  const baseError = error as BaseError;
  if (baseError.context && Object.keys(baseError.context).length > 0) {
    lines.push('│                                                 │');
    lines.push('│ Context:                                        │');

    for (const [key, value] of Object.entries(baseError.context)) {
      const contextLine = `  ${key}: ${String(value)}`;
      const contextLines = wrapText(contextLine, 47);
      for (const line of contextLines) {
        const linePadding = ' '.repeat(47 - line.length);
        lines.push(`│ ${line}${linePadding} │`);
      }
    }
  }

  // Suggested fix (if available)
  if (baseError.suggestedFix) {
    lines.push('│                                                 │');
    lines.push('│ Suggested Fix:                                  │');

    const fixLines = wrapText(baseError.suggestedFix, 47);
    for (const line of fixLines) {
      const linePadding = ' '.repeat(47 - line.length);
      lines.push(`│ ${line}${linePadding} │`);
    }
  }

  // Bottom border
  lines.push('└─────────────────────────────────────────────────┘');

  let output = lines.join('\n');

  // Add stack trace in verbose mode
  if (verbose && error.stack) {
    output += '\n\n' + (colors ? chalk.gray('Stack trace:') : 'Stack trace:');
    output += '\n' + (colors ? chalk.gray(error.stack) : error.stack);
  }

  return output;
}

/**
 * Wrap text to specified width
 */
function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= width) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

/**
 * Format error for logging (structured JSON)
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const baseError = error as BaseError;
    return {
      name: error.name,
      message: error.message,
      context: baseError.context,
      suggestedFix: baseError.suggestedFix,
      stack: error.stack,
    };
  }

  return {
    error: String(error),
  };
}
