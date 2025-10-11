/**
 * Tests for Security Analyzer
 * Story 4.6: Security Detection and Guidance
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeSecurityRequirements,
  formatSecurityGuidance,
  type SecurityGuidance,
} from '../src/security-analyzer.js';
import type { SecuritySchemeTemplateData } from '../src/types.js';

describe('analyzeSecurityRequirements', () => {
  describe('No Security Schemes', () => {
    it('should handle empty security schemes array', () => {
      const guidance = analyzeSecurityRequirements([], []);

      expect(guidance.required).toEqual([]);
      expect(guidance.optional).toEqual([]);
      expect(guidance.unsupported).toEqual([]);
      expect(guidance.envVars).toEqual([]);
      expect(guidance.hasMultipleSchemes).toBe(false);
      expect(guidance.warnings).toHaveLength(1);
      expect(guidance.warnings[0]).toContain('No authentication schemes detected');
    });
  });

  describe('API Key Authentication', () => {
    it('should analyze header-based API key scheme', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          paramName: 'X-API-Key',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.required).toContain('apiKey');
      expect(guidance.envVars).toHaveLength(1);
      expect(guidance.envVars[0]).toMatchObject({
        name: 'API_KEY',
        required: true,
        example: 'your-api-key-here',
      });
      expect(guidance.envVars[0].description).toContain('header');
      expect(guidance.envVars[0].description).toContain('X-API-Key');
    });

    it('should analyze query-based API key scheme', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKeyQuery',
          type: 'apiKey',
          in: 'query',
          paramName: 'api_key',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.required).toContain('apiKeyQuery');
      expect(guidance.envVars[0].description).toContain('query');
      expect(guidance.envVars[0].description).toContain('api_key');
      expect(guidance.envVars[0].setupHint).toContain('query parameter');
    });

    it('should analyze cookie-based API key scheme', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKeyCookie',
          type: 'apiKey',
          in: 'cookie',
          paramName: 'session_id',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.required).toContain('apiKeyCookie');
      expect(guidance.envVars[0].description).toContain('cookie');
      expect(guidance.envVars[0].setupHint).toContain('cookie');
    });
  });

  describe('Bearer Token Authentication', () => {
    it('should analyze bearer token scheme without format', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.required).toContain('bearerAuth');
      expect(guidance.envVars).toHaveLength(1);
      expect(guidance.envVars[0]).toMatchObject({
        name: 'BEARER_TOKEN',
        required: true,
        example: 'your-bearer-token-here',
      });
    });

    it('should analyze JWT bearer token scheme', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'jwtAuth',
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.required).toContain('jwtAuth');
      expect(guidance.envVars[0].example).toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(guidance.envVars[0].description).toContain('JWT');
      expect(guidance.envVars[0].setupHint).toContain('JWT');
    });
  });

  describe('Basic Authentication', () => {
    it('should analyze basic auth scheme', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'basicAuth',
          type: 'http',
          scheme: 'basic',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.required).toContain('basicAuth');
      expect(guidance.envVars).toHaveLength(2);

      const usernameVar = guidance.envVars.find(v => v.name === 'BASIC_AUTH_USERNAME');
      const passwordVar = guidance.envVars.find(v => v.name === 'BASIC_AUTH_PASSWORD');

      expect(usernameVar).toBeDefined();
      expect(usernameVar?.required).toBe(true);
      expect(usernameVar?.example).toBe('your-username');

      expect(passwordVar).toBeDefined();
      expect(passwordVar?.required).toBe(true);
      expect(passwordVar?.example).toBe('your-password');
      expect(passwordVar?.setupHint).toContain('secure');
    });
  });

  describe('Unsupported Authentication Schemes', () => {
    it('should throw error for malformed OAuth2 scheme missing metadata', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'oauth2',
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://example.com/oauth/authorize',
              tokenUrl: 'https://example.com/oauth/token',
              scopes: {
                'read:users': 'Read user data',
              },
            },
          },
        },
      ];

      // Malformed OAuth2 scheme (missing metadata.primaryFlow) should throw validation error
      expect(() => analyzeSecurityRequirements(schemes)).toThrow('OAuth2 scheme missing flow type');
    });

    it('should flag OpenID Connect as unsupported', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'oidc',
          type: 'openIdConnect',
          openIdConnectUrl: 'https://example.com/.well-known/openid-configuration',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.optional).toContain('oidc');
      expect(guidance.unsupported).toHaveLength(1);
      expect(guidance.unsupported[0]).toMatchObject({
        name: 'oidc',
        type: 'openIdConnect',
      });
      expect(guidance.unsupported[0].workaround).toContain('OpenID Connect');
      expect(guidance.docLinks).toHaveLength(1);
      expect(guidance.docLinks[0].url).toBe('https://example.com/.well-known/openid-configuration');
    });

    it('should flag unknown HTTP schemes as unsupported', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'digestAuth',
          type: 'http',
          scheme: 'digest',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.unsupported).toHaveLength(1);
      expect(guidance.unsupported[0]).toMatchObject({
        name: 'digestAuth',
        type: 'http-digest',
      });
    });

    it('should flag completely unknown schemes', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'customAuth',
          type: 'custom' as unknown as 'apiKey',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.unsupported).toHaveLength(1);
      expect(guidance.unsupported[0].type).toBe('custom');
    });
  });

  describe('Multiple Security Schemes', () => {
    it('should handle multiple schemes (OR logic)', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          scheme: 'X-API-Key',
        },
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
        },
      ];

      const globalSecurity = [
        { apiKey: [] },
        { bearerAuth: [] },
      ];

      const guidance = analyzeSecurityRequirements(schemes, globalSecurity);

      expect(guidance.hasMultipleSchemes).toBe(true);
      expect(guidance.usesOrLogic).toBe(true);
      expect(guidance.usesAndLogic).toBe(false);
      expect(guidance.warnings.some(w => w.includes('alternative authentication'))).toBe(true);
    });

    it('should detect AND logic (multiple schemes required)', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          scheme: 'X-API-Key',
        },
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
        },
      ];

      const globalSecurity = [
        { apiKey: [], bearerAuth: [] }, // Both required
      ];

      const guidance = analyzeSecurityRequirements(schemes, globalSecurity);

      expect(guidance.hasMultipleSchemes).toBe(true);
      expect(guidance.usesAndLogic).toBe(true);
      expect(guidance.warnings.some(w => w.includes('multiple authentication schemes simultaneously'))).toBe(true);
    });

    it('should warn about operation-specific security', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          scheme: 'X-API-Key',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes, [{ apiKey: [] }], true);

      expect(guidance.warnings.some(w => w.includes('specific authentication requirements'))).toBe(true);
    });
  });

  describe('Documentation Links', () => {
    it('should extract documentation links from scheme descriptions', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          scheme: 'X-API-Key',
          description: 'API Key authentication - see docs for details',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.docLinks).toHaveLength(1);
      expect(guidance.docLinks[0].scheme).toBe('apiKey');
      expect(guidance.docLinks[0].description).toContain('API Key authentication');
    });
  });
});

describe('formatSecurityGuidance', () => {
  it('should format guidance with required schemes', () => {
    const guidance: SecurityGuidance = {
      required: ['apiKey'],
      optional: [],
      unsupported: [],
      envVars: [
        {
          name: 'API_KEY',
          description: 'API Key for authentication',
          example: 'test-key',
          required: true,
        },
      ],
      docLinks: [],
      hasMultipleSchemes: false,
      usesAndLogic: false,
      usesOrLogic: false,
      warnings: [],
    };

    const formatted = formatSecurityGuidance(guidance);

    expect(formatted).toContain('Security Requirements Summary');
    expect(formatted).toContain('Required Authentication');
    expect(formatted).toContain('apiKey');
    expect(formatted).toContain('Environment Variables to Configure');
    expect(formatted).toContain('API_KEY');
    expect(formatted).toContain('(REQUIRED)');
    expect(formatted).toContain('Next Steps');
    expect(formatted).toContain('.env.example');
  });

  it('should format guidance with optional schemes', () => {
    const guidance: SecurityGuidance = {
      required: [],
      optional: ['oauth2'],
      unsupported: [],
      envVars: [
        {
          name: 'BEARER_TOKEN',
          description: 'OAuth2 token',
          example: 'token',
          required: false,
        },
      ],
      docLinks: [],
      hasMultipleSchemes: false,
      usesAndLogic: false,
      usesOrLogic: false,
      warnings: [],
    };

    const formatted = formatSecurityGuidance(guidance);

    expect(formatted).toContain('Optional Authentication');
    expect(formatted).toContain('oauth2');
    expect(formatted).toContain('(optional)');
  });

  it('should format guidance with unsupported schemes', () => {
    const guidance: SecurityGuidance = {
      required: [],
      optional: [],
      unsupported: [
        {
          name: 'oauth2',
          type: 'oauth2',
          reason: 'Complex flow',
          workaround: 'Implement manually',
        },
      ],
      envVars: [],
      docLinks: [],
      hasMultipleSchemes: false,
      usesAndLogic: false,
      usesOrLogic: false,
      warnings: [],
    };

    const formatted = formatSecurityGuidance(guidance);

    expect(formatted).toContain('Unsupported Schemes');
    expect(formatted).toContain('oauth2');
    expect(formatted).toContain('Complex flow');
  });

  it('should format guidance with warnings', () => {
    const guidance: SecurityGuidance = {
      required: ['apiKey', 'bearerAuth'],
      optional: [],
      unsupported: [],
      envVars: [],
      docLinks: [],
      hasMultipleSchemes: true,
      usesAndLogic: true,
      usesOrLogic: false,
      warnings: ['Multiple schemes required simultaneously'],
    };

    const formatted = formatSecurityGuidance(guidance);

    expect(formatted).toContain('Important Notes');
    expect(formatted).toContain('Multiple schemes required simultaneously');
  });

  it('should format guidance with setup hints', () => {
    const guidance: SecurityGuidance = {
      required: ['basicAuth'],
      optional: [],
      unsupported: [],
      envVars: [
        {
          name: 'BASIC_AUTH_USERNAME',
          description: 'Username',
          example: 'user',
          required: true,
        },
        {
          name: 'BASIC_AUTH_PASSWORD',
          description: 'Password',
          example: 'pass',
          required: true,
          setupHint: 'Keep credentials secure',
        },
      ],
      docLinks: [],
      hasMultipleSchemes: false,
      usesAndLogic: false,
      usesOrLogic: false,
      warnings: [],
    };

    const formatted = formatSecurityGuidance(guidance);

    expect(formatted).toContain('Hint: Keep credentials secure');
  });
});
