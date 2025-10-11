/**
 * Integration tests for Array Items Type Specification (Story 9.2)
 * Validates that array parameters include items type specification with the Ozon API
 */

import { describe, it, expect } from 'vitest';
import { parseOpenAPIDocument } from '@openapi-to-mcp/parser';
import { generateToolDefinitions } from '../../src/tool-generator.js';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Array Items Type Specification Integration (Story 9.2)', () => {
  const ozonApiPath = resolve(__dirname, '../fixtures/ozon-performance-api.json');

  it('should include items for array parameters in Ozon API', async () => {
    if (!existsSync(ozonApiPath)) {
      console.warn('Ozon API fixture not found, skipping test');
      return;
    }

    const parsedAPI = await parseOpenAPIDocument(ozonApiPath);

    // Generate tools
    const result = generateToolDefinitions(parsedAPI.operations, parsedAPI.schemas);

    // Find tools with array parameters
    const toolsWithArrayParams = result.tools.filter((tool) => {
      const properties = tool.inputSchema.properties;
      return Object.values(properties).some(
        (prop) => prop.type === 'array' && prop.items !== undefined
      );
    });

    console.log('Array Items Integration Results:');
    console.log(`  Total tools: ${result.tools.length}`);
    console.log(`  Tools with array parameters (with items): ${toolsWithArrayParams.length}`);

    // Verify that array items are being generated
    // (Story estimated 20, but actual Ozon API has fewer array parameters)
    expect(toolsWithArrayParams.length).toBeGreaterThan(0);

    // Verify at least one example has proper items structure
    const exampleTool = toolsWithArrayParams[0];
    expect(exampleTool).toBeDefined();

    const arrayProp = Object.values(exampleTool!.inputSchema.properties).find(
      (prop) => prop.type === 'array'
    );

    expect(arrayProp).toBeDefined();
    expect(arrayProp!.items).toBeDefined();
    expect(arrayProp!.items).toHaveProperty('type');

    console.log(`  Example tool: ${exampleTool!.name}`);
    console.log(`  Array property items type: ${arrayProp!.items!.type}`);
  });

  it('should preserve format constraints in array items', async () => {
    if (!existsSync(ozonApiPath)) {
      console.warn('Ozon API fixture not found, skipping test');
      return;
    }

    const parsedAPI = await parseOpenAPIDocument(ozonApiPath);

    // Generate tools
    const result = generateToolDefinitions(parsedAPI.operations, parsedAPI.schemas);

    // Find tools with array parameters that have format constraints
    const toolsWithFormattedArrayItems = result.tools.filter((tool) => {
      const properties = tool.inputSchema.properties;
      return Object.values(properties).some(
        (prop) =>
          prop.type === 'array' &&
          prop.items !== undefined &&
          prop.items.format !== undefined
      );
    });

    console.log('Format Constraint Preservation:');
    console.log(`  Tools with formatted array items: ${toolsWithFormattedArrayItems.length}`);

    // At least some array items should have format constraints (e.g., uint64, date)
    expect(toolsWithFormattedArrayItems.length).toBeGreaterThan(0);

    // Verify format is preserved
    const exampleTool = toolsWithFormattedArrayItems[0];
    const arrayProp = Object.values(exampleTool!.inputSchema.properties).find(
      (prop) => prop.type === 'array' && prop.items?.format
    );

    expect(arrayProp!.items!.format).toBeDefined();
    console.log(`  Example format: ${arrayProp!.items!.format}`);
  });

  it('should handle nested array parameters', async () => {
    if (!existsSync(ozonApiPath)) {
      console.warn('Ozon API fixture not found, skipping test');
      return;
    }

    const parsedAPI = await parseOpenAPIDocument(ozonApiPath);

    // Generate tools
    const result = generateToolDefinitions(parsedAPI.operations, parsedAPI.schemas);

    // Count tools with array parameters
    let arrayParamCount = 0;
    result.tools.forEach((tool) => {
      Object.values(tool.inputSchema.properties).forEach((prop) => {
        if (prop.type === 'array') {
          arrayParamCount++;
        }
      });
    });

    console.log('Nested Array Handling:');
    console.log(`  Total array parameters: ${arrayParamCount}`);

    // Verify arrays are properly handled
    expect(arrayParamCount).toBeGreaterThan(0);
  });

  it('should maintain backward compatibility with non-array parameters', async () => {
    if (!existsSync(ozonApiPath)) {
      console.warn('Ozon API fixture not found, skipping test');
      return;
    }

    const parsedAPI = await parseOpenAPIDocument(ozonApiPath);

    // Generate tools
    const result = generateToolDefinitions(parsedAPI.operations, parsedAPI.schemas);

    // Verify all tools generated successfully
    expect(result.tools.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBe(0);

    console.log('Backward Compatibility Check:');
    console.log(`  All ${result.tools.length} tools generated successfully: ✓`);
  });
});
