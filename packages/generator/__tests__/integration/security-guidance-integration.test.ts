/**
 * Integration tests for Security Guidance (Story 4.6)
 * Tests end-to-end security detection and user guidance generation
 */

import { describe, it, expect } from 'vitest';
import { analyzeSecurityRequirements, formatSecurityGuidance } from '../../src/security-analyzer.js';
import type { SecuritySchemeTemplateData } from '../../src/types.js';

describe('Security Guidance Integration', () => {
  describe('Real-world API Scenarios', () => {
    it('should handle Ozon Performance API security (multi-scheme AND logic)', () => {
      // Ozon uses both Client-Id and Api-Key headers (AND logic)
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'ClientId',
          type: 'apiKey',
          in: 'header',
          paramName: 'Client-Id',
        },
        {
          name: 'ApiKey',
          type: 'apiKey',
          in: 'header',
          paramName: 'Api-Key',
        },
      ];

      const globalSecurity = [
        {
          ClientId: [],
          ApiKey: [],
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes, globalSecurity);

      // Should detect AND logic (both required simultaneously)
      expect(guidance.usesAndLogic).toBe(true);
      expect(guidance.required).toContain('ClientId');
      expect(guidance.required).toContain('ApiKey');
      expect(guidance.envVars).toHaveLength(2);

      // Should warn about multi-scheme requirement
      expect(guidance.warnings.some((w) => w.includes('simultaneously'))).toBe(true);
    });

    it('should handle GitHub API security (Bearer token)', () => {
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
      expect(guidance.envVars[0].name).toBe('BEARER_TOKEN');
      expect(guidance.warnings).toHaveLength(0);
    });

    it('should handle Stripe API security (Bearer + optional OAuth2)', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
        },
        {
          name: 'oauth2',
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://connect.stripe.com/oauth/authorize',
              tokenUrl: 'https://connect.stripe.com/oauth/token',
              scopes: {
                read_write: 'Read and write access',
              },
            },
          },
        },
      ];

      const globalSecurity = [
        { bearerAuth: [] },
        { oauth2: ['read_write'] },
      ];

      const guidance = analyzeSecurityRequirements(schemes, globalSecurity);

      // Bearer is supported, OAuth2 is unsupported
      expect(guidance.required).toContain('bearerAuth');
      expect(guidance.optional).toContain('oauth2');
      expect(guidance.unsupported).toHaveLength(1);
      expect(guidance.unsupported[0].type).toBe('oauth2');

      // Should detect OR logic (alternative authentication)
      expect(guidance.usesOrLogic).toBe(true);
    });

    it('should handle Basic Auth API', () => {
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
      expect(guidance.envVars.find((v) => v.name === 'BASIC_AUTH_USERNAME')).toBeDefined();
      expect(guidance.envVars.find((v) => v.name === 'BASIC_AUTH_PASSWORD')).toBeDefined();
    });
  });

  describe('Formatted Guidance Output', () => {
    it('should generate user-friendly guidance text', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          paramName: 'X-API-Key',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);
      const formatted = formatSecurityGuidance(guidance);

      expect(formatted).toContain('Security Requirements Summary');
      expect(formatted).toContain('Required Authentication');
      expect(formatted).toContain('apiKey');
      expect(formatted).toContain('Environment Variables to Configure');
      expect(formatted).toContain('API_KEY');
      expect(formatted).toContain('Next Steps');
      expect(formatted).toContain('.env.example');
    });

    it('should format unsupported schemes with workarounds', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'oauth2',
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: 'https://example.com/oauth/authorize',
              scopes: {},
            },
          },
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);
      const formatted = formatSecurityGuidance(guidance);

      expect(formatted).toContain('Unsupported Schemes');
      expect(formatted).toContain('oauth2');
      expect(formatted).toContain('Manual Implementation Required');
      expect(formatted).toContain('BEARER_TOKEN');
    });
  });

  describe('Edge Cases', () => {
    it('should handle API with no security schemes', () => {
      const guidance = analyzeSecurityRequirements([]);

      expect(guidance.required).toHaveLength(0);
      expect(guidance.optional).toHaveLength(0);
      expect(guidance.unsupported).toHaveLength(0);
      expect(guidance.warnings).toHaveLength(1);
      expect(guidance.warnings[0]).toContain('No authentication');
    });

    it('should handle operation-specific security override', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          paramName: 'X-API-Key',
        },
      ];

      const guidance = analyzeSecurityRequirements(
        schemes,
        [{ apiKey: [] }],
        true // hasOperationSecurity
      );

      expect(guidance.warnings.some((w) => w.includes('specific authentication requirements'))).toBe(
        true
      );
    });

    it('should handle complex multi-scheme scenarios', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'apiKey',
          type: 'apiKey',
          in: 'header',
          paramName: 'X-API-Key',
        },
        {
          name: 'bearerAuth',
          type: 'http',
          scheme: 'bearer',
        },
        {
          name: 'basicAuth',
          type: 'http',
          scheme: 'basic',
        },
      ];

      const globalSecurity = [
        { apiKey: [] },
        { bearerAuth: [] },
        { basicAuth: [] },
      ];

      const guidance = analyzeSecurityRequirements(schemes, globalSecurity);

      expect(guidance.hasMultipleSchemes).toBe(true);
      expect(guidance.usesOrLogic).toBe(true);
      expect(guidance.required).toHaveLength(3);
      expect(guidance.envVars.length).toBeGreaterThan(3); // API_KEY + BEARER_TOKEN + USERNAME + PASSWORD
    });
  });

  describe('Documentation Links', () => {
    it('should preserve OpenID Connect discovery URLs', () => {
      const schemes: SecuritySchemeTemplateData[] = [
        {
          name: 'oidc',
          type: 'openIdConnect',
          openIdConnectUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        },
      ];

      const guidance = analyzeSecurityRequirements(schemes);

      expect(guidance.docLinks).toHaveLength(1);
      expect(guidance.docLinks[0].url).toBe(
        'https://accounts.google.com/.well-known/openid-configuration'
      );
      expect(guidance.docLinks[0].description).toContain('OpenID Connect');
    });
  });
});
