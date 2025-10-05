/**
 * Tests for Tag Extractor
 */

import { describe, it, expect } from 'vitest';
import {
  extractTags,
  normalizeTagName,
  generateTagFromPath,
} from '../src/tag-extractor.js';
import type { OperationMetadata } from '../src/operation-types.js';

describe('Tag Extractor', () => {
  describe('Tag Normalization', () => {
    it('should normalize hyphenated tag names', () => {
      expect(normalizeTagName('user-management')).toBe('UserManagement');
    });

    it('should normalize underscored tag names', () => {
      expect(normalizeTagName('user_management')).toBe('UserManagement');
    });

    it('should normalize spaced tag names', () => {
      expect(normalizeTagName('User Management')).toBe('UserManagement');
    });

    it('should normalize simple tag names', () => {
      expect(normalizeTagName('users')).toBe('Users');
    });

    it('should remove special characters', () => {
      expect(normalizeTagName('user@management!')).toBe('Usermanagement');
    });
  });

  describe('Tag Generation from Path', () => {
    it('should generate tag from simple path', () => {
      expect(generateTagFromPath('/users')).toBe('Users');
    });

    it('should generate tag from path with parameter', () => {
      expect(generateTagFromPath('/users/{id}')).toBe('Users');
    });

    it('should skip API prefix', () => {
      expect(generateTagFromPath('/api/v1/products')).toBe('Products');
    });

    it('should normalize generated tag name', () => {
      expect(generateTagFromPath('/user-profiles/{id}')).toBe('UserProfiles');
    });

    it('should fallback to General for empty path', () => {
      expect(generateTagFromPath('/')).toBe('General');
      expect(generateTagFromPath('/api/v1')).toBe('General');
    });
  });

  describe('Root-Level Tags', () => {
    it('should extract root-level tags with descriptions', () => {
      const document = {
        tags: [
          {
            name: 'Users',
            description: 'User management operations'
          }
        ]
      };

      const result = extractTags(document, []);

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].name).toBe('Users');
      expect(result.tags[0].displayName).toBe('Users');
      expect(result.tags[0].description).toBe('User management operations');
      expect(result.tags[0].source).toBe('root');
      expect(result.tags[0].priority).toBe(1);
      expect(result.tags[0].generated).toBe(false);
    });

    it('should extract external documentation', () => {
      const document = {
        tags: [
          {
            name: 'Users',
            description: 'User operations',
            externalDocs: {
              url: 'https://docs.example.com/users',
              description: 'User API documentation'
            }
          }
        ]
      };

      const result = extractTags(document, []);

      expect(result.tags[0].externalDocs).toEqual({
        url: 'https://docs.example.com/users',
        description: 'User API documentation'
      });
    });

    it('should generate default description for tags without description', () => {
      const document = {
        tags: [
          {
            name: 'Products'
          }
        ]
      };

      const result = extractTags(document, []);

      expect(result.tags[0].description).toBe('Products operations');
    });
  });

  describe('Operation Tags', () => {
    it('should collect tags from operations', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUser',
          path: '/users/{id}',
          method: 'get',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].name).toBe('Users');
      expect(result.tags[0].source).toBe('operation');
      expect(result.tags[0].operationCount).toBe(1);
      expect(result.tags[0].operationIds).toEqual(['getUser']);
    });

    it('should handle multiple tags per operation', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUserPosts',
          path: '/users/{id}/posts',
          method: 'get',
          tags: ['Users', 'Posts'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags).toHaveLength(2);
      expect(result.tags.map(t => t.name)).toContain('Users');
      expect(result.tags.map(t => t.name)).toContain('Posts');

      const usersTag = result.tags.find(t => t.name === 'Users');
      expect(usersTag?.operationCount).toBe(1);
      expect(usersTag?.operationIds).toEqual(['getUserPosts']);
    });
  });

  describe('Auto-Generated Tags', () => {
    it('should auto-generate tag for untagged operation', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getProducts',
          path: '/products',
          method: 'get',
          tags: [],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].name).toBe('Products');
      expect(result.tags[0].source).toBe('generated');
      expect(result.tags[0].generated).toBe(true);
      expect(result.tags[0].description).toBe('Products operations');
    });
  });

  describe('Tag Priority Ordering', () => {
    it('should order tags by priority: root > operation > generated', () => {
      const document = {
        tags: [
          { name: 'RootTag', description: 'Root level tag' }
        ]
      };

      const operations: OperationMetadata[] = [
        {
          operationId: 'op1',
          path: '/operation-tag',
          method: 'get',
          tags: ['OperationTag'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'op2',
          path: '/generated',
          method: 'get',
          tags: [],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'op3',
          path: '/root-tag',
          method: 'get',
          tags: ['RootTag'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      // Priority order: root (1) > operation (2) > generated (3)
      // Within same priority: alphabetical
      expect(result.tags[0].source).toBe('root');      // RootTag (priority 1)
      expect(result.tags[1].source).toBe('operation'); // OperationTag (priority 2)
      expect(result.tags[2].source).toBe('generated'); // Generated (priority 3)
    });

    it('should sort alphabetically within same priority', () => {
      const document = {
        tags: [
          { name: 'Zebra' },
          { name: 'Alpha' }
        ]
      };

      const result = extractTags(document, []);

      expect(result.tags[0].name).toBe('Alpha');
      expect(result.tags[1].name).toBe('Zebra');
    });
  });

  describe('Tag Metadata Enrichment', () => {
    it('should calculate operation count', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUsers',
          path: '/users',
          method: 'get',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'createUser',
          path: '/users',
          method: 'post',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags[0].operationCount).toBe(2);
    });

    it('should calculate method distribution', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUsers',
          path: '/users',
          method: 'get',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'createUser',
          path: '/users',
          method: 'post',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'deleteUser',
          path: '/users/{id}',
          method: 'delete',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags[0].methodDistribution).toEqual({
        GET: 1,
        POST: 1,
        DELETE: 1
      });
    });

    it('should calculate complexity metrics', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUser',
          path: '/users/{id}',
          method: 'get',
          tags: ['Users'],
          summary: '',
          pathParameters: [{ name: 'id', in: 'path', required: true }],
          queryParameters: [{ name: 'filter', in: 'query', required: false }],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'createUser',
          path: '/users',
          method: 'post',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          requestBody: { required: true, mediaType: 'application/json' },
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags[0].complexity?.averageParameters).toBe(1);
      expect(result.tags[0].complexity?.maxParameters).toBe(2);
      expect(result.tags[0].complexity?.hasRequestBodies).toBe(true);
    });
  });

  describe('Empty Tags', () => {
    it('should detect tags with zero operations', () => {
      const document = {
        tags: [
          { name: 'UnusedTag', description: 'This tag is not used' }
        ]
      };

      const result = extractTags(document, []);

      expect(result.tags[0].operationCount).toBe(0);
      expect(result.warnings.some(w => w.includes('empty tags'))).toBe(true);
    });
  });

  describe('Bidirectional Mapping', () => {
    it('should create bidirectional mapping between tags and operations', () => {
      const document = {};

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUser',
          path: '/users/{id}',
          method: 'get',
          tags: ['Users', 'Public'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      // Tag -> Operations
      const usersTag = result.tags.find(t => t.name === 'Users');
      expect(usersTag?.operationIds).toEqual(['getUser']);

      const publicTag = result.tags.find(t => t.name === 'Public');
      expect(publicTag?.operationIds).toEqual(['getUser']);

      // Operation -> Tags
      expect(result.operationTagMap.get('getUser')).toEqual(['Users', 'Public']);
    });
  });

  describe('Integration', () => {
    it('should extract tags from complete OpenAPI document', () => {
      const document = {
        tags: [
          {
            name: 'Users',
            description: 'User management',
            externalDocs: {
              url: 'https://docs.example.com/users'
            }
          }
        ]
      };

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUsers',
          path: '/users',
          method: 'get',
          tags: ['Users'],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        },
        {
          operationId: 'getProducts',
          path: '/products',
          method: 'get',
          tags: [],
          summary: '',
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractTags(document, operations);

      expect(result.tags).toHaveLength(2);

      const usersTag = result.tags.find(t => t.name === 'Users');
      expect(usersTag?.source).toBe('root');
      expect(usersTag?.operationCount).toBe(1);
      expect(usersTag?.externalDocs?.url).toBe('https://docs.example.com/users');

      const productsTag = result.tags.find(t => t.name === 'Products');
      expect(productsTag?.source).toBe('generated');
      expect(productsTag?.operationCount).toBe(1);

      expect(result.operationTagMap.get('getUsers')).toEqual(['Users']);
      expect(result.operationTagMap.get('getProducts')).toEqual(['Products']);
    });
  });
});
