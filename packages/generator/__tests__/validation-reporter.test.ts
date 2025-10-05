/**
 * Tests for ValidationReporter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join } from 'node:path';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { ValidationReporter, createCheck } from '../src/validation-reporter.js';
import type { TestStats, PerformanceMetrics } from '../src/validation-reporter.js';

describe('ValidationReporter', () => {
  let reporter: ValidationReporter;
  let tempDir: string;

  beforeEach(async () => {
    reporter = new ValidationReporter('Test Project', '1.0.0');
    tempDir = await mkdtemp(join(tmpdir(), 'validation-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const rep = new ValidationReporter();
      expect(rep).toBeDefined();
    });

    it('should create instance with custom values', () => {
      const rep = new ValidationReporter('Custom Project', '2.0.0');
      expect(rep).toBeDefined();
    });
  });

  describe('addCheck', () => {
    it('should add a single validation check', () => {
      const check = createCheck('Test Check', 'testing', 'pass');
      reporter.addCheck(check);

      const testStats: TestStats = {
        total: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
        duration: 100,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1000,
        memoryUsage: 1024 * 1024 * 100,
      };

      const report = reporter.generateReport(testStats, perfMetrics);
      expect(report.checks).toHaveLength(1);
      expect(report.checks[0].name).toBe('Test Check');
    });
  });

  describe('addChecks', () => {
    it('should add multiple validation checks', () => {
      const checks = [
        createCheck('Check 1', 'testing', 'pass'),
        createCheck('Check 2', 'compilation', 'pass'),
        createCheck('Check 3', 'linting', 'fail', 'Linting failed'),
      ];
      reporter.addChecks(checks);

      const testStats: TestStats = {
        total: 3,
        passed: 2,
        failed: 1,
        skipped: 0,
        duration: 300,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 2000,
        memoryUsage: 1024 * 1024 * 150,
      };

      const report = reporter.generateReport(testStats, perfMetrics);
      expect(report.checks).toHaveLength(3);
    });
  });

  describe('generateReport', () => {
    it('should generate report with pass status', () => {
      reporter.addCheck(createCheck('Test 1', 'testing', 'pass'));
      reporter.addCheck(createCheck('Test 2', 'compilation', 'pass'));

      const testStats: TestStats = {
        total: 2,
        passed: 2,
        failed: 0,
        skipped: 0,
        duration: 200,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1500,
        memoryUsage: 1024 * 1024 * 120,
      };

      const report = reporter.generateReport(testStats, perfMetrics);

      expect(report.status).toBe('pass');
      expect(report.summary).toContain('Validation PASS');
      expect(report.summary).toContain('2 passed');
      expect(report.summary).toContain('0 failed');
    });

    it('should generate report with fail status', () => {
      reporter.addCheck(createCheck('Test 1', 'testing', 'pass'));
      reporter.addCheck(createCheck('Test 2', 'compilation', 'fail', 'Compilation error'));

      const testStats: TestStats = {
        total: 2,
        passed: 1,
        failed: 1,
        skipped: 0,
        duration: 200,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1500,
        memoryUsage: 1024 * 1024 * 120,
      };

      const report = reporter.generateReport(testStats, perfMetrics);

      expect(report.status).toBe('fail');
      expect(report.summary).toContain('Validation FAIL');
      expect(report.summary).toContain('1 failed');
    });

    it('should generate report with warn status', () => {
      reporter.addCheck(createCheck('Test 1', 'testing', 'pass'));
      reporter.addCheck(createCheck('Test 2', 'linting', 'warn', 'Minor linting issues'));

      const testStats: TestStats = {
        total: 2,
        passed: 1,
        failed: 0,
        skipped: 0,
        duration: 200,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1500,
        memoryUsage: 1024 * 1024 * 120,
      };

      const report = reporter.generateReport(testStats, perfMetrics);

      expect(report.status).toBe('warn');
      expect(report.summary).toContain('Validation WARN');
      expect(report.summary).toContain('1 warnings');
    });

    it('should include project information', () => {
      const testStats: TestStats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1000,
        memoryUsage: 1024 * 1024 * 100,
      };

      const report = reporter.generateReport(testStats, perfMetrics);

      expect(report.project.name).toBe('Test Project');
      expect(report.project.version).toBe('1.0.0');
      expect(report.version).toBe('1.0.0');
    });

    it('should include timestamp', () => {
      const testStats: TestStats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1000,
        memoryUsage: 1024 * 1024 * 100,
      };

      const report = reporter.generateReport(testStats, perfMetrics);

      expect(report.timestamp).toBeDefined();
      expect(new Date(report.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should include performance metrics', () => {
      const testStats: TestStats = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 2500,
        compilationTime: 3000,
        memoryUsage: 1024 * 1024 * 200,
        peakMemoryUsage: 1024 * 1024 * 250,
      };

      const report = reporter.generateReport(testStats, perfMetrics);

      expect(report.performance.generationTime).toBe(2500);
      expect(report.performance.compilationTime).toBe(3000);
      expect(report.performance.memoryUsage).toBe(1024 * 1024 * 200);
      expect(report.performance.peakMemoryUsage).toBe(1024 * 1024 * 250);
    });
  });

  describe('saveReport', () => {
    it('should save report to JSON file', async () => {
      reporter.addCheck(createCheck('Test', 'testing', 'pass'));

      const testStats: TestStats = {
        total: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
        duration: 100,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 1000,
        memoryUsage: 1024 * 1024 * 100,
      };

      const report = reporter.generateReport(testStats, perfMetrics);
      const outputPath = join(tempDir, 'test-results/report.json');

      await reporter.saveReport(report, outputPath);

      const savedContent = await readFile(outputPath, 'utf-8');
      const savedReport = JSON.parse(savedContent);

      expect(savedReport.project.name).toBe('Test Project');
      expect(savedReport.checks).toHaveLength(1);
    });

    it('should create directory if it does not exist', async () => {
      const report = reporter.generateReport(
        { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
        { generationTime: 1000, memoryUsage: 1024 * 1024 * 100 }
      );

      const outputPath = join(tempDir, 'nested/dir/report.json');
      await reporter.saveReport(report, outputPath);

      const savedContent = await readFile(outputPath, 'utf-8');
      expect(savedContent).toBeDefined();
    });
  });

  describe('generateHumanReadableSummary', () => {
    it('should generate readable summary', () => {
      reporter.addCheck(createCheck('Compilation', 'compilation', 'pass'));
      reporter.addCheck(createCheck('Linting', 'linting', 'pass'));
      reporter.addCheck(createCheck('Tests', 'testing', 'fail', 'Some tests failed'));

      const testStats: TestStats = {
        total: 10,
        passed: 8,
        failed: 2,
        skipped: 0,
        duration: 1500,
      };
      const perfMetrics: PerformanceMetrics = {
        generationTime: 2500,
        memoryUsage: 1024 * 1024 * 180,
      };

      const report = reporter.generateReport(testStats, perfMetrics);
      const summary = reporter.generateHumanReadableSummary(report);

      expect(summary).toContain('VALIDATION REPORT');
      expect(summary).toContain('Test Project');
      expect(summary).toContain('TEST STATISTICS');
      expect(summary).toContain('PERFORMANCE METRICS');
      expect(summary).toContain('VALIDATION CHECKS');
      expect(summary).toContain('✅ Compilation');
      expect(summary).toContain('✅ Linting');
      expect(summary).toContain('❌ Tests');
    });

    it('should format memory usage in MB', () => {
      const report = reporter.generateReport(
        { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
        { generationTime: 1000, memoryUsage: 1024 * 1024 * 256 }
      );

      const summary = reporter.generateHumanReadableSummary(report);

      expect(summary).toContain('256.00MB');
    });

    it('should group checks by category', () => {
      reporter.addCheck(createCheck('TypeScript Check', 'compilation', 'pass'));
      reporter.addCheck(createCheck('ESLint Check', 'linting', 'pass'));
      reporter.addCheck(createCheck('Unit Tests', 'testing', 'pass'));
      reporter.addCheck(createCheck('Generation Speed', 'performance', 'pass'));
      reporter.addCheck(createCheck('Code Quality', 'quality', 'pass'));

      const report = reporter.generateReport(
        { total: 5, passed: 5, failed: 0, skipped: 0, duration: 500 },
        { generationTime: 1500, memoryUsage: 1024 * 1024 * 150 }
      );

      const summary = reporter.generateHumanReadableSummary(report);

      expect(summary).toContain('COMPILATION:');
      expect(summary).toContain('LINTING:');
      expect(summary).toContain('TESTING:');
      expect(summary).toContain('PERFORMANCE:');
      expect(summary).toContain('QUALITY:');
    });
  });

  describe('saveSummary', () => {
    it('should save human-readable summary to file', async () => {
      reporter.addCheck(createCheck('Test', 'testing', 'pass'));

      const report = reporter.generateReport(
        { total: 1, passed: 1, failed: 0, skipped: 0, duration: 100 },
        { generationTime: 1000, memoryUsage: 1024 * 1024 * 100 }
      );

      const outputPath = join(tempDir, 'test-results/summary.txt');
      await reporter.saveSummary(report, outputPath);

      const savedContent = await readFile(outputPath, 'utf-8');

      expect(savedContent).toContain('VALIDATION REPORT');
      expect(savedContent).toContain('Test Project');
    });
  });

  describe('createCheck helper', () => {
    it('should create validation check', () => {
      const check = createCheck('Test Check', 'testing', 'pass', 'All tests passed');

      expect(check.name).toBe('Test Check');
      expect(check.category).toBe('testing');
      expect(check.status).toBe('pass');
      expect(check.message).toBe('All tests passed');
    });

    it('should create check without message', () => {
      const check = createCheck('Simple Check', 'linting', 'skip');

      expect(check.name).toBe('Simple Check');
      expect(check.message).toBeUndefined();
    });

    it('should create check with details', () => {
      const details = { errors: ['Error 1', 'Error 2'] };
      const check = createCheck('Detailed Check', 'compilation', 'fail', 'Failed', details);

      expect(check.details).toEqual(details);
    });
  });
});
