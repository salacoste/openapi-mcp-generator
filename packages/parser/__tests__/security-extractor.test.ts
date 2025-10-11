/**
 * Tests for Security Extractor
 */

import { describe, it, expect } from 'vitest';
import {
  extractSecuritySchemes,
  classifySecurityScheme,
  extractSecurityRequirements,
  isApiKeyScheme,
  isHttpBearerScheme,
  isHttpBasicScheme,
  isOAuth2Scheme,
  isOpenIdConnectScheme,
} from '../src/security-extractor.js';
import type { OperationMetadata } from '../src/operation-types.js';

describe('Security Extractor', () => {
  describe('API Key Schemes', () => {
    it('should extract API Key in header', () => {
      const scheme = {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header'
      };

      const result = classifySecurityScheme('apiKey', scheme);

      expect(result.classification).toBe('api-key-header');
      expect(result.metadata).toEqual({
        name: 'X-API-Key',
        in: 'header'
      });
      expect(result.supported).toBe(true);
      expect(result.warnings).toBeUndefined();
    });

    it('should extract API Key in query', () => {
      const scheme = {
        type: 'apiKey',
        name: 'api_key',
        in: 'query'
      };

      const result = classifySecurityScheme('apiKeyQuery', scheme);

      expect(result.classification).toBe('api-key-query');
      expect(result.metadata).toEqual({
        name: 'api_key',
        in: 'query'
      });
      expect(result.supported).toBe(true);
    });

    it('should extract API Key in cookie', () => {
      const scheme = {
        type: 'apiKey',
        name: 'session',
        in: 'cookie'
      };

      const result = classifySecurityScheme('apiKeyCookie', scheme);

      expect(result.classification).toBe('api-key-cookie');
      expect(result.metadata).toEqual({
        name: 'session',
        in: 'cookie'
      });
      expect(result.supported).toBe(true);
    });
  });

  describe('HTTP Bearer Schemes', () => {
    it('should identify HTTP Bearer scheme', () => {
      const scheme = {
        type: 'http',
        scheme: 'bearer'
      };

      const result = classifySecurityScheme('bearerAuth', scheme);

      expect(result.classification).toBe('http-bearer');
      expect(result.metadata).toEqual({
        scheme: 'bearer',
        bearerFormat: undefined
      });
      expect(result.supported).toBe(true);
    });

    it('should extract bearer format (JWT)', () => {
      const scheme = {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      };

      const result = classifySecurityScheme('bearerAuth', scheme);

      expect(result.metadata).toEqual({
        scheme: 'bearer',
        bearerFormat: 'JWT'
      });
    });
  });

  describe('HTTP Basic Schemes', () => {
    it('should identify HTTP Basic scheme', () => {
      const scheme = {
        type: 'http',
        scheme: 'basic'
      };

      const result = classifySecurityScheme('basicAuth', scheme);

      expect(result.classification).toBe('http-basic');
      expect(result.metadata).toEqual({
        scheme: 'basic'
      });
      expect(result.supported).toBe(true);
    });
  });

  describe('OAuth2 Schemes', () => {
    it('should extract OAuth2 Authorization Code flow with PKCE recommendation', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {
              'read:users': 'Read user data',
              'write:users': 'Write user data'
            }
          }
        }
      };

      const result = classifySecurityScheme('oauth2', scheme);

      expect(result.classification).toBe('oauth2');
      expect(result.type).toBe('oauth2');
      expect(result.supported).toBe(true); // Epic 8: OAuth now supported
      expect(result.metadata).toHaveProperty('flows');
      expect(result.metadata).toHaveProperty('primaryFlow');

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.type).toBe('authorizationCode');
      expect(metadata.primaryFlow?.tokenUrl).toBe('https://example.com/oauth/token');
      expect(metadata.primaryFlow?.authorizationUrl).toBe('https://example.com/oauth/authorize');
      expect(metadata.primaryFlow?.scopes).toEqual({
        'read:users': 'Read user data',
        'write:users': 'Write user data'
      });

      // Should recommend PKCE
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('PKCE'))).toBe(true);
    });

    it('should extract OAuth2 Client Credentials flow', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          clientCredentials: {
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {
              'api:access': 'API access'
            }
          }
        }
      };

      const result = classifySecurityScheme('oauth2ClientCreds', scheme);

      expect(result.classification).toBe('oauth2');
      expect(result.supported).toBe(true);
      expect(result.metadata).toHaveProperty('flows');

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.type).toBe('clientCredentials');
      expect(metadata.primaryFlow?.tokenUrl).toBe('https://example.com/oauth/token');
      expect(metadata.primaryFlow?.scopes).toEqual({ 'api:access': 'API access' });
    });

    it('should extract OAuth2 with explicit PKCE requirement', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: { profile: 'User profile' },
            'x-pkce-required': true
          }
        }
      };

      const result = classifySecurityScheme('oauth2Pkce', scheme);

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.pkce).toBe(true);
    });

    it('should detect PKCE from description', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {},
            description: 'Authorization Code flow with PKCE required'
          }
        }
      };

      const result = classifySecurityScheme('oauth2PkceDesc', scheme);

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.pkce).toBe(true);
    });

    it('should handle multiple OAuth2 flows', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          clientCredentials: {
            tokenUrl: 'https://example.com/oauth/token',
            scopes: { 'api:access': 'API access' }
          },
          authorizationCode: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            tokenUrl: 'https://example.com/oauth/token',
            scopes: { profile: 'User profile' }
          }
        }
      };

      const result = classifySecurityScheme('oauth2Multi', scheme);

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.type).toBe('clientCredentials'); // Highest priority
      expect(metadata.additionalFlows).toBeDefined();
      expect(metadata.additionalFlows).toHaveLength(1);
      expect(metadata.additionalFlows?.[0].type).toBe('authorizationCode');
    });

    it('should warn about deprecated Implicit flow', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          implicit: {
            authorizationUrl: 'https://example.com/oauth/authorize',
            scopes: { profile: 'User profile' }
          }
        }
      };

      const result = classifySecurityScheme('oauth2Implicit', scheme);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('deprecated'))).toBe(true);

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.type).toBe('implicit');
    });

    it('should warn about discouraged Password flow', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {}
          }
        }
      };

      const result = classifySecurityScheme('oauth2Password', scheme);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('discouraged'))).toBe(true);

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.type).toBe('password');
    });

    it('should extract real Ozon Performance API OAuth scheme', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          clientCredentials: {
            tokenUrl: 'https://performance.ozon.ru/api/client/token',
            scopes: {}
          }
        }
      };

      const result = classifySecurityScheme('oauth2ClientCredentials', scheme);

      expect(result.classification).toBe('oauth2');
      expect(result.supported).toBe(true);

      const metadata = result.metadata as any;
      expect(metadata.primaryFlow?.type).toBe('clientCredentials');
      expect(metadata.primaryFlow?.tokenUrl).toBe('https://performance.ozon.ru/api/client/token');
      expect(metadata.primaryFlow?.scopes).toEqual({});
    });

    it('should throw error if no flows defined', () => {
      const scheme = {
        type: 'oauth2',
        flows: {}
      };

      expect(() => classifySecurityScheme('oauth2NoFlows', scheme)).toThrow('no valid flows defined');
    });

    it('should warn about missing tokenUrl', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          clientCredentials: {
            scopes: {}
          }
        }
      };

      const result = classifySecurityScheme('oauth2NoToken', scheme);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('missing tokenUrl'))).toBe(true);
    });

    it('should warn about missing authorizationUrl for Authorization Code flow', () => {
      const scheme = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            tokenUrl: 'https://example.com/oauth/token',
            scopes: {}
          }
        }
      };

      const result = classifySecurityScheme('oauth2NoAuthUrl', scheme);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('missing authorizationUrl'))).toBe(true);
    });
  });

  describe('OpenID Connect Schemes', () => {
    it('should extract OpenID Connect scheme', () => {
      const scheme = {
        type: 'openIdConnect',
        openIdConnectUrl: 'https://example.com/.well-known/openid-configuration'
      };

      const result = classifySecurityScheme('oidc', scheme);

      expect(result.classification).toBe('openid-connect');
      expect(result.metadata).toEqual({
        openIdConnectUrl: 'https://example.com/.well-known/openid-configuration'
      });
      expect(result.supported).toBe(false);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain('OpenID Connect scheme \'oidc\' requires manual implementation');
    });
  });

  describe('Security Requirements', () => {
    it('should extract global security requirements', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' }
          }
        },
        security: [{ apiKey: [] }]
      };

      const result = extractSecuritySchemes(document, []);

      expect(result.globalRequirements).toHaveLength(1);
      expect(result.globalRequirements[0].schemes).toEqual(['apiKey']);
      expect(result.globalRequirements[0].logic).toBe('OR');
    });

    it('should detect AND logic for multi-scheme requirements', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            bearerAuth: { type: 'http', scheme: 'bearer' }
          }
        },
        security: [{ apiKey: [], bearerAuth: [] }]
      };

      const result = extractSecuritySchemes(document, []);

      expect(result.globalRequirements[0].schemes).toEqual(['apiKey', 'bearerAuth']);
      expect(result.globalRequirements[0].logic).toBe('AND');
    });

    it('should detect OR logic for alternative schemes', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            bearerAuth: { type: 'http', scheme: 'bearer' }
          }
        },
        security: [{ apiKey: [] }, { bearerAuth: [] }]
      };

      const result = extractSecuritySchemes(document, []);

      expect(result.globalRequirements).toHaveLength(2);
      expect(result.globalRequirements[0].schemes).toEqual(['apiKey']);
      expect(result.globalRequirements[0].logic).toBe('OR');
      expect(result.globalRequirements[1].schemes).toEqual(['bearerAuth']);
      expect(result.globalRequirements[1].logic).toBe('OR');
    });

    it('should handle operation-level security override', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            bearerAuth: { type: 'http', scheme: 'bearer' }
          }
        },
        security: [{ apiKey: [] }]
      };

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false,
          security: [{ bearerAuth: [] }]
        }
      ];

      const result = extractSecuritySchemes(document, operations);

      expect(result.globalRequirements[0].schemes).toEqual(['apiKey']);
      expect(result.operationRequirements.get('getUsers')?.[0].schemes).toEqual(['bearerAuth']);
    });

    it('should handle empty security array (no auth required)', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' }
          }
        },
        security: [{ apiKey: [] }]
      };

      const operations: OperationMetadata[] = [
        {
          operationId: 'publicEndpoint',
          method: 'get',
          path: '/public',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false,
          security: []
        }
      ];

      const result = extractSecuritySchemes(document, operations);

      expect(result.operationRequirements.has('publicEndpoint')).toBe(false);
    });

    it('should inherit global security when operation security is undefined', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' }
          }
        },
        security: [{ apiKey: [] }]
      };

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractSecuritySchemes(document, operations);

      expect(result.operationRequirements.get('getUsers')).toEqual(result.globalRequirements);
    });
  });

  describe('Validation', () => {
    it('should warn about unknown security scheme references', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' }
          }
        },
        security: [{ unknownScheme: [] }]
      };

      const result = extractSecuritySchemes(document, []);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('unknownScheme'))).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify API Key scheme', () => {
      const scheme = { type: 'apiKey', name: 'X-API-Key', in: 'header' };
      expect(isApiKeyScheme(scheme)).toBe(true);
    });

    it('should correctly identify HTTP Bearer scheme', () => {
      const scheme = { type: 'http', scheme: 'bearer' };
      expect(isHttpBearerScheme(scheme)).toBe(true);
    });

    it('should correctly identify HTTP Basic scheme', () => {
      const scheme = { type: 'http', scheme: 'basic' };
      expect(isHttpBasicScheme(scheme)).toBe(true);
    });

    it('should correctly identify OAuth2 scheme', () => {
      const scheme = { type: 'oauth2', flows: {} };
      expect(isOAuth2Scheme(scheme)).toBe(true);
    });

    it('should correctly identify OpenID Connect scheme', () => {
      const scheme = { type: 'openIdConnect', openIdConnectUrl: 'https://example.com' };
      expect(isOpenIdConnectScheme(scheme)).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should extract security from complete OpenAPI document', () => {
      const document = {
        components: {
          securitySchemes: {
            apiKey: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
          }
        },
        security: [{ apiKey: [] }]
      };

      const operations: OperationMetadata[] = [
        {
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
          tags: [],
          pathParameters: [],
          queryParameters: [],
          headerParameters: [],
          responses: [],
          deprecated: false
        }
      ];

      const result = extractSecuritySchemes(document, operations);

      expect(Object.keys(result.schemes)).toHaveLength(2);
      expect(result.schemes.apiKey.classification).toBe('api-key-header');
      expect(result.schemes.bearerAuth.classification).toBe('http-bearer');
      expect(result.globalRequirements).toHaveLength(1);
      expect(result.operationRequirements.get('getUsers')).toEqual(result.globalRequirements);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle document with no security schemes', () => {
      const document = {
        components: {}
      };

      const result = extractSecuritySchemes(document, []);

      expect(Object.keys(result.schemes)).toHaveLength(0);
      expect(result.globalRequirements).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('extractSecurityRequirements', () => {
    it('should extract scopes for OAuth2 requirements', () => {
      const securityArray = [
        {
          oauth2: ['read:users', 'write:users']
        }
      ];

      const result = extractSecurityRequirements(securityArray);

      expect(result).toHaveLength(1);
      expect(result[0].schemes).toEqual(['oauth2']);
      expect(result[0].scopes.oauth2).toEqual(['read:users', 'write:users']);
      expect(result[0].logic).toBe('OR');
    });
  });
});
