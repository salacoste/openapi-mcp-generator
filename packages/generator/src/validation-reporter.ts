/**
 * Validation Report Generator
 * Generates comprehensive validation reports for integration testing
 * Story 3.9: AC#17
 */

import { writeFile as fsWriteFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Validation result for a single check
 */
export interface ValidationCheck {
  name: string;
  category: 'compilation' | 'linting' | 'testing' | 'performance' | 'quality';
  status: 'pass' | 'fail' | 'skip' | 'warn';
  message?: string;
  details?: unknown;
  duration?: number;
}

/**
 * Test statistics
 */
export interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  generationTime: number;
  compilationTime?: number;
  memoryUsage: number;
  peakMemoryUsage?: number;
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  /** Report timestamp */
  timestamp: string;
  /** Report version */
  version: string;
  /** Project information */
  project: {
    name: string;
    version: string;
  };
  /** Validation checks */
  checks: ValidationCheck[];
  /** Test statistics */
  tests: TestStats;
  /** Performance metrics */
  performance: PerformanceMetrics;
  /** Overall status */
  status: 'pass' | 'fail' | 'warn';
  /** Summary message */
  summary: string;
}

/**
 * Validation reporter class
 */
export class ValidationReporter {
  private checks: ValidationCheck[] = [];
  private startTime: number;
  private projectName: string;
  private projectVersion: string;

  constructor(projectName: string = 'MCP Server Generator', projectVersion: string = '1.0.0') {
    this.startTime = Date.now();
    this.projectName = projectName;
    this.projectVersion = projectVersion;
  }

  /**
   * Add a validation check result
   */
  addCheck(check: ValidationCheck): void {
    this.checks.push(check);
  }

  /**
   * Add multiple validation checks
   */
  addChecks(checks: ValidationCheck[]): void {
    this.checks.push(...checks);
  }

  /**
   * Generate the validation report
   */
  generateReport(testStats: TestStats, performanceMetrics: PerformanceMetrics): ValidationReport {
    const totalDuration = Date.now() - this.startTime;

    // Determine overall status
    const hasFailed = this.checks.some((c) => c.status === 'fail');
    const hasWarnings = this.checks.some((c) => c.status === 'warn');
    const status = hasFailed ? 'fail' : hasWarnings ? 'warn' : 'pass';

    // Generate summary
    const passCount = this.checks.filter((c) => c.status === 'pass').length;
    const failCount = this.checks.filter((c) => c.status === 'fail').length;
    const warnCount = this.checks.filter((c) => c.status === 'warn').length;
    const skipCount = this.checks.filter((c) => c.status === 'skip').length;

    const summary = `Validation ${status.toUpperCase()}: ${passCount} passed, ${failCount} failed, ${warnCount} warnings, ${skipCount} skipped`;

    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      project: {
        name: this.projectName,
        version: this.projectVersion,
      },
      checks: this.checks,
      tests: testStats,
      performance: {
        ...performanceMetrics,
        generationTime: performanceMetrics.generationTime || totalDuration,
      },
      status,
      summary,
    };
  }

  /**
   * Save report to JSON file
   */
  async saveReport(
    report: ValidationReport,
    outputPath: string = 'test-results/validation-report.json'
  ): Promise<void> {
    const fullPath = resolve(outputPath);
    const dir = dirname(fullPath);

    // Ensure directory exists
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Write report
    await fsWriteFile(fullPath, JSON.stringify(report, null, 2));
  }

  /**
   * Generate human-readable summary
   */
  generateHumanReadableSummary(report: ValidationReport): string {
    const lines: string[] = [];

    // Header
    lines.push('═'.repeat(80));
    lines.push(`  VALIDATION REPORT - ${report.project.name} v${report.project.version}`);
    lines.push(`  Generated: ${report.timestamp}`);
    lines.push('═'.repeat(80));
    lines.push('');

    // Overall Status
    const statusIcon = report.status === 'pass' ? '✅' : report.status === 'fail' ? '❌' : '⚠️';
    lines.push(`${statusIcon} ${report.summary}`);
    lines.push('');

    // Test Statistics
    lines.push('─'.repeat(80));
    lines.push('TEST STATISTICS');
    lines.push('─'.repeat(80));
    lines.push(`  Total Tests:    ${report.tests.total}`);
    lines.push(`  ✅ Passed:       ${report.tests.passed}`);
    lines.push(`  ❌ Failed:       ${report.tests.failed}`);
    lines.push(`  ⏭️  Skipped:      ${report.tests.skipped}`);
    lines.push(`  ⏱️  Duration:     ${report.tests.duration}ms`);
    lines.push('');

    // Performance Metrics
    lines.push('─'.repeat(80));
    lines.push('PERFORMANCE METRICS');
    lines.push('─'.repeat(80));
    lines.push(`  Generation Time:     ${report.performance.generationTime}ms`);
    if (report.performance.compilationTime) {
      lines.push(`  Compilation Time:    ${report.performance.compilationTime}ms`);
    }
    lines.push(`  Memory Usage:        ${(report.performance.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    if (report.performance.peakMemoryUsage) {
      lines.push(`  Peak Memory:         ${(report.performance.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
    lines.push('');

    // Validation Checks by Category
    lines.push('─'.repeat(80));
    lines.push('VALIDATION CHECKS');
    lines.push('─'.repeat(80));

    const categories: Array<ValidationCheck['category']> = [
      'compilation',
      'linting',
      'testing',
      'performance',
      'quality',
    ];

    for (const category of categories) {
      const categoryChecks = report.checks.filter((c) => c.category === category);
      if (categoryChecks.length === 0) {continue;}

      lines.push('');
      lines.push(`${category.toUpperCase()}:`);
      for (const check of categoryChecks) {
        const icon =
          check.status === 'pass'
            ? '✅'
            : check.status === 'fail'
              ? '❌'
              : check.status === 'warn'
                ? '⚠️'
                : '⏭️';
        const duration = check.duration ? ` (${check.duration}ms)` : '';
        lines.push(`  ${icon} ${check.name}${duration}`);
        if (check.message) {
          lines.push(`     ${check.message}`);
        }
      }
    }

    lines.push('');
    lines.push('═'.repeat(80));

    return lines.join('\n');
  }

  /**
   * Save human-readable summary to file
   */
  async saveSummary(
    report: ValidationReport,
    outputPath: string = 'test-results/validation-summary.txt'
  ): Promise<void> {
    const summary = this.generateHumanReadableSummary(report);
    const fullPath = resolve(outputPath);
    const dir = dirname(fullPath);

    // Ensure directory exists
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await fsWriteFile(fullPath, summary);
  }
}

/**
 * Helper function to create a validation check
 */
export function createCheck(
  name: string,
  category: ValidationCheck['category'],
  status: ValidationCheck['status'],
  message?: string,
  details?: unknown
): ValidationCheck {
  return {
    name,
    category,
    status,
    message,
    details,
  };
}
