/**
 * Tag Extraction and Categorization
 * @module tag-extractor
 */

import type { OperationMetadata } from './operation-types.js';

/**
 * Tag metadata for semantic categorization
 */
export interface TagMetadata {
  /** Normalized name (PascalCase) */
  name: string;
  /** Original name for display */
  displayName: string;
  /** Tag description */
  description: string;
  /** External documentation */
  externalDocs?: ExternalDocs;
  /** Number of operations in this tag */
  operationCount: number;
  /** Operation IDs belonging to this tag */
  operationIds: string[];
  /** Priority for sorting (1=root, 2=operation, 3=generated) */
  priority: number;
  /** Source of the tag */
  source: 'root' | 'operation' | 'generated';
  /** Is tag auto-generated? */
  generated: boolean;
  /** Complexity metrics */
  complexity?: TagComplexity;
  /** HTTP method distribution */
  methodDistribution?: MethodDistribution;
}

/**
 * External documentation reference
 */
export interface ExternalDocs {
  /** Documentation URL */
  url: string;
  /** Documentation description */
  description?: string;
}

/**
 * Tag complexity metrics
 */
export interface TagComplexity {
  /** Average parameters per operation */
  averageParameters: number;
  /** Maximum parameters across operations */
  maxParameters: number;
  /** Has operations with request bodies */
  hasRequestBodies: boolean;
  /** Has operations with complex schemas (>5 params) */
  hasComplexSchemas: boolean;
}

/**
 * HTTP method distribution for a tag
 */
export interface MethodDistribution {
  GET?: number;
  POST?: number;
  PUT?: number;
  PATCH?: number;
  DELETE?: number;
  HEAD?: number;
  OPTIONS?: number;
}

/**
 * Complete tag extraction result
 */
export interface TagExtractionResult {
  /** Array of tag metadata */
  tags: TagMetadata[];
  /** Map from normalized name to metadata */
  tagMap: Map<string, TagMetadata>;
  /** Map from operation ID to tag names */
  operationTagMap: Map<string, string[]>;
  /** Warnings and notices */
  warnings: string[];
}

/**
 * OpenAPI document structure (minimal interface for tag extraction)
 */
interface OpenAPIDocument {
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      url: string;
      description?: string;
    };
  }>;
}

/**
 * Extract and organize tags from OpenAPI document
 *
 * @param document - Fully resolved OpenAPI document
 * @param operations - Extracted operations metadata
 * @returns Complete tag extraction result
 */
export function extractTags(
  document: OpenAPIDocument,
  operations: OperationMetadata[]
): TagExtractionResult {
  const warnings: string[] = [];
  const tagMap = new Map<string, TagMetadata>();
  const operationTagMap = new Map<string, string[]>();

  // Step 1: Extract root-level tags
  if (document.tags) {
    for (const tag of document.tags) {
      const normalizedName = normalizeTagName(tag.name);
      tagMap.set(normalizedName, {
        name: normalizedName,
        displayName: tag.name,
        description: tag.description || `${tag.name} operations`,
        externalDocs: tag.externalDocs,
        operationCount: 0,
        operationIds: [],
        priority: 1,
        source: 'root',
        generated: false
      });
    }
  }

  // Step 2: Collect tags from operations and assign operations to tags
  for (const operation of operations) {
    const operationTags: string[] = [];

    if (operation.tags && operation.tags.length > 0) {
      // Use operation's tags
      for (const tagName of operation.tags) {
        const normalizedName = normalizeTagName(tagName);
        operationTags.push(normalizedName);

        // Create tag if not exists (operation-derived tag)
        if (!tagMap.has(normalizedName)) {
          tagMap.set(normalizedName, {
            name: normalizedName,
            displayName: tagName,
            description: `${tagName} operations`,
            operationCount: 0,
            operationIds: [],
            priority: 2,
            source: 'operation',
            generated: false
          });
        }

        // Assign operation to tag
        const tag = tagMap.get(normalizedName);
        if (tag) {
          tag.operationIds.push(operation.operationId);
          tag.operationCount++;
        }
      }
    } else {
      // Auto-generate tag from path
      const generatedTagName = generateTagFromPath(operation.path);
      operationTags.push(generatedTagName);

      if (!tagMap.has(generatedTagName)) {
        tagMap.set(generatedTagName, {
          name: generatedTagName,
          displayName: generatedTagName,
          description: `${generatedTagName} operations`,
          operationCount: 0,
          operationIds: [],
          priority: 3,
          source: 'generated',
          generated: true
        });
      }

      // Assign operation to auto-generated tag
      const tag = tagMap.get(generatedTagName);
      if (tag) {
        tag.operationIds.push(operation.operationId);
        tag.operationCount++;
      }
    }

    operationTagMap.set(operation.operationId, operationTags);
  }

  // Step 3: Enrich tag metadata
  for (const tag of tagMap.values()) {
    enrichTagMetadata(tag, operations);
  }

  // Step 4: Detect empty tags
  const emptyTags = Array.from(tagMap.values()).filter(tag => tag.operationCount === 0);
  if (emptyTags.length > 0) {
    warnings.push(
      `Found ${emptyTags.length} empty tags (defined but not used): ${emptyTags.map(t => t.name).join(', ')}`
    );
  }

  // Step 5: Order tags by priority
  const tags = Array.from(tagMap.values()).sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.name.localeCompare(b.name);
  });

  // Step 6: Validate output
  validateTagOutput(tags, operations, operationTagMap, warnings);

  return {
    tags,
    tagMap,
    operationTagMap,
    warnings
  };
}

/**
 * Normalize tag name to PascalCase identifier
 *
 * @param tagName - Original tag name
 * @returns Normalized PascalCase name
 *
 * @example
 * normalizeTagName('user-management') → 'UserManagement'
 * normalizeTagName('user_management') → 'UserManagement'
 * normalizeTagName('User Management') → 'UserManagement'
 */
export function normalizeTagName(tagName: string): string {
  return tagName
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Generate tag name from operation path
 *
 * @param path - Operation path
 * @returns Generated PascalCase tag name
 *
 * @example
 * generateTagFromPath('/users') → 'Users'
 * generateTagFromPath('/users/{id}') → 'Users'
 * generateTagFromPath('/api/v1/products') → 'Products'
 * generateTagFromPath('/user-profiles/{id}') → 'UserProfiles'
 */
export function generateTagFromPath(path: string): string {
  const segments = path
    .split('/')
    .filter(s => s && !s.startsWith('{') && !s.match(/^(api|v\d+)$/i));

  if (segments.length === 0 || !segments[0]) {
    return 'General';
  }

  return normalizeTagName(segments[0]);
}

/**
 * Enrich tag metadata with complexity and method distribution
 *
 * @param tag - Tag metadata to enrich
 * @param operations - All operations
 */
function enrichTagMetadata(tag: TagMetadata, operations: OperationMetadata[]): void {
  const tagOperations = operations.filter(op => tag.operationIds.includes(op.operationId));

  if (tagOperations.length === 0) {
    return;
  }

  // Calculate complexity metrics
  const paramCounts = tagOperations.map(op => {
    return (
      op.pathParameters.length +
      op.queryParameters.length +
      op.headerParameters.length
    );
  });
  const totalParams = paramCounts.reduce((a, b) => a + b, 0);

  tag.complexity = {
    averageParameters: paramCounts.length > 0 ? totalParams / paramCounts.length : 0,
    maxParameters: Math.max(...paramCounts, 0),
    hasRequestBodies: tagOperations.some(op => op.requestBody !== undefined),
    hasComplexSchemas: tagOperations.some(op => {
      return (
        op.pathParameters.length +
        op.queryParameters.length +
        op.headerParameters.length
      ) > 5;
    })
  };

  // Calculate method distribution
  const methodDist: MethodDistribution = {};
  for (const op of tagOperations) {
    const method = op.method.toUpperCase();
    const key = method as keyof MethodDistribution;
    methodDist[key] = ((methodDist[key] || 0) as number) + 1;
  }
  tag.methodDistribution = methodDist;
}

/**
 * Validate tag extraction output
 *
 * @param tags - Extracted tags
 * @param operations - All operations
 * @param operationTagMap - Operation to tag mapping
 * @param warnings - Array to append warnings to
 */
function validateTagOutput(
  tags: TagMetadata[],
  operations: OperationMetadata[],
  operationTagMap: Map<string, string[]>,
  warnings: string[]
): void {
  // Validate all tag names are valid identifiers
  for (const tag of tags) {
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(tag.name)) {
      warnings.push(`Tag name '${tag.name}' is not a valid PascalCase identifier`);
    }
  }

  // Validate all operations have at least one tag
  for (const operation of operations) {
    const tags = operationTagMap.get(operation.operationId);
    if (!tags || tags.length === 0) {
      warnings.push(`Operation '${operation.operationId}' has no tags`);
    }
  }

  // Validate operation counts match
  for (const tag of tags) {
    if (tag.operationCount !== tag.operationIds.length) {
      warnings.push(
        `Tag '${tag.name}' has inconsistent operation count: ` +
        `count=${tag.operationCount}, ids=${tag.operationIds.length}`
      );
    }
  }
}
