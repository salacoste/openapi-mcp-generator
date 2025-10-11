/**
 * Auth Override Utilities Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseAuthOverride,
  loadAuthConfig,
  type AuthOverrideConfig,
  type ApiKeySecurityScheme,
  type HttpSecurityScheme,
  type OAuth2SecurityScheme,
} from '../../src/utils/auth-override.js';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('parseAuthOverride', () => {
  describe('API Key authentication', () => {
    it('should parse API Key in header', () => {
      const result = parseAuthOverride('apiKey:header:X-API-Key');

      expect(result.schemes).toHaveProperty('ApiKeyAuth');
      const scheme = result.schemes.ApiKeyAuth as ApiKeySecurityScheme;
      expect(scheme.type).toBe('apiKey');
      expect(scheme.in).toBe('header');
      expect(scheme.name).toBe('X-API-Key');
      expect(result.security).toEqual([{ ApiKeyAuth: [] }]);
    });

    it('should parse API Key in query', () => {
      const result = parseAuthOverride('apiKey:query:api_key');

      const scheme = result.schemes.ApiKeyAuth as ApiKeySecurityScheme;
      expect(scheme.type).toBe('apiKey');
      expect(scheme.in).toBe('query');
      expect(scheme.name).toBe('api_key');
    });

    it('should parse API Key in cookie', () => {
      const result = parseAuthOverride('apiKey:cookie:session_id');

      const scheme = result.schemes.ApiKeyAuth as ApiKeySecurityScheme;
      expect(scheme.type).toBe('apiKey');
      expect(scheme.in).toBe('cookie');
      expect(scheme.name).toBe('session_id');
    });

    it('should throw error for invalid API Key location', () => {
      expect(() => parseAuthOverride('apiKey:body:key')).toThrow(
        'Invalid API Key location'
      );
    });

    it('should throw error for missing API Key parameter name', () => {
      expect(() => parseAuthOverride('apiKey:header')).toThrow(
        'API Key parameter name is required'
      );
    });
  });

  describe('Bearer token authentication', () => {
    it('should parse Bearer token without format', () => {
      const result = parseAuthOverride('bearer');

      expect(result.schemes).toHaveProperty('BearerAuth');
      const scheme = result.schemes.BearerAuth as HttpSecurityScheme;
      expect(scheme.type).toBe('http');
      expect(scheme.scheme).toBe('bearer');
      expect(scheme.bearerFormat).toBe('JWT'); // Default format
      expect(result.security).toEqual([{ BearerAuth: [] }]);
    });

    it('should parse Bearer token with custom format', () => {
      const result = parseAuthOverride('bearer:CustomToken');

      const scheme = result.schemes.BearerAuth as HttpSecurityScheme;
      expect(scheme.type).toBe('http');
      expect(scheme.scheme).toBe('bearer');
      expect(scheme.bearerFormat).toBe('CustomToken');
    });
  });

  describe('Basic authentication', () => {
    it('should parse Basic authentication', () => {
      const result = parseAuthOverride('basic');

      expect(result.schemes).toHaveProperty('BasicAuth');
      const scheme = result.schemes.BasicAuth as HttpSecurityScheme;
      expect(scheme.type).toBe('http');
      expect(scheme.scheme).toBe('basic');
      expect(result.security).toEqual([{ BasicAuth: [] }]);
    });
  });

  describe('OAuth2 authentication', () => {
    it('should parse OAuth2 Client Credentials', () => {
      const result = parseAuthOverride(
        'oauth2-client-credentials:https://auth.example.com/token'
      );

      expect(result.schemes).toHaveProperty('OAuth2ClientCredentials');
      const scheme = result.schemes.OAuth2ClientCredentials as OAuth2SecurityScheme;
      expect(scheme.type).toBe('oauth2');
      expect(scheme.flows.clientCredentials).toBeDefined();
      expect(scheme.flows.clientCredentials?.tokenUrl).toBe(
        'https://auth.example.com/token'
      );
      expect(result.security).toEqual([{ OAuth2ClientCredentials: [] }]);
    });

    it('should parse OAuth2 Authorization Code', () => {
      const result = parseAuthOverride(
        'oauth2-authorization-code:https://auth.example.com/authorize:https://auth.example.com/token'
      );

      const scheme = result.schemes.OAuth2AuthorizationCode as OAuth2SecurityScheme;
      expect(scheme.type).toBe('oauth2');
      expect(scheme.flows.authorizationCode).toBeDefined();
      expect(scheme.flows.authorizationCode?.authorizationUrl).toBe(
        'https://auth.example.com/authorize'
      );
      expect(scheme.flows.authorizationCode?.tokenUrl).toBe(
        'https://auth.example.com/token'
      );
    });

    it('should parse OAuth2 Password', () => {
      const result = parseAuthOverride('oauth2-password:https://auth.example.com/token');

      const scheme = result.schemes.OAuth2Password as OAuth2SecurityScheme;
      expect(scheme.type).toBe('oauth2');
      expect(scheme.flows.password).toBeDefined();
      expect(scheme.flows.password?.tokenUrl).toBe('https://auth.example.com/token');
    });

    it('should parse OAuth2 Implicit', () => {
      const result = parseAuthOverride(
        'oauth2-implicit:https://auth.example.com/authorize'
      );

      const scheme = result.schemes.OAuth2Implicit as OAuth2SecurityScheme;
      expect(scheme.type).toBe('oauth2');
      expect(scheme.flows.implicit).toBeDefined();
      expect(scheme.flows.implicit?.authorizationUrl).toBe(
        'https://auth.example.com/authorize'
      );
    });

    it('should throw error for OAuth2 Client Credentials without token URL', () => {
      expect(() => parseAuthOverride('oauth2-client-credentials')).toThrow(
        'OAuth2 token URL is required'
      );
    });

    it('should throw error for OAuth2 Authorization Code without URLs', () => {
      expect(() => parseAuthOverride('oauth2-authorization-code:https://auth.example.com')).toThrow(
        'OAuth2 authorization and token URLs are required'
      );
    });
  });

  describe('Multi-scheme authentication (AND logic)', () => {
    it('should parse bearer + apiKey combination', () => {
      const result = parseAuthOverride('bearer+apiKey:header:X-API-Key');

      expect(result.schemes).toHaveProperty('BearerAuth');
      expect(result.schemes).toHaveProperty('ApiKeyAuth');

      const bearerScheme = result.schemes.BearerAuth as HttpSecurityScheme;
      expect(bearerScheme.type).toBe('http');
      expect(bearerScheme.scheme).toBe('bearer');

      const apiKeyScheme = result.schemes.ApiKeyAuth as ApiKeySecurityScheme;
      expect(apiKeyScheme.type).toBe('apiKey');
      expect(apiKeyScheme.in).toBe('header');
      expect(apiKeyScheme.name).toBe('X-API-Key');

      // Check AND logic in security requirement
      expect(result.security).toEqual([
        { BearerAuth: [], ApiKeyAuth: [] },
      ]);
    });

    it('should parse triple scheme combination', () => {
      const result = parseAuthOverride('bearer+basic+apiKey:query:key');

      expect(result.schemes).toHaveProperty('BearerAuth');
      expect(result.schemes).toHaveProperty('BasicAuth');
      expect(result.schemes).toHaveProperty('ApiKeyAuth');

      expect(result.security).toEqual([
        { BearerAuth: [], BasicAuth: [], ApiKeyAuth: [] },
      ]);
    });
  });

  describe('Error handling', () => {
    it('should throw error for empty string', () => {
      expect(() => parseAuthOverride('')).toThrow('Invalid auth override format: empty string');
    });

    it('should throw error for unsupported auth type', () => {
      expect(() => parseAuthOverride('unsupported:auth')).toThrow(
        'Unsupported auth type: unsupported'
      );
    });
  });
});

describe('loadAuthConfig', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'auth-config-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should load valid API Key config', () => {
    const configPath = join(tempDir, 'auth.json');
    const config: AuthOverrideConfig = {
      schemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key authentication',
        },
      },
      security: [{ ApiKeyAuth: [] }],
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));

    const result = loadAuthConfig(configPath);

    expect(result.schemes).toHaveProperty('ApiKeyAuth');
    const scheme = result.schemes.ApiKeyAuth as ApiKeySecurityScheme;
    expect(scheme.type).toBe('apiKey');
    expect(scheme.in).toBe('header');
    expect(scheme.name).toBe('X-API-Key');
  });

  it('should load valid Bearer config', () => {
    const configPath = join(tempDir, 'auth.json');
    const config: AuthOverrideConfig = {
      schemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));

    const result = loadAuthConfig(configPath);

    const scheme = result.schemes.BearerAuth as HttpSecurityScheme;
    expect(scheme.type).toBe('http');
    expect(scheme.scheme).toBe('bearer');
    expect(scheme.bearerFormat).toBe('JWT');
  });

  it('should load valid OAuth2 config', () => {
    const configPath = join(tempDir, 'auth.json');
    const config: AuthOverrideConfig = {
      schemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            clientCredentials: {
              tokenUrl: 'https://auth.example.com/token',
              scopes: {
                'read:data': 'Read data',
                'write:data': 'Write data',
              },
            },
          },
        },
      },
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));

    const result = loadAuthConfig(configPath);

    const scheme = result.schemes.OAuth2 as OAuth2SecurityScheme;
    expect(scheme.type).toBe('oauth2');
    expect(scheme.flows.clientCredentials).toBeDefined();
    expect(scheme.flows.clientCredentials?.tokenUrl).toBe(
      'https://auth.example.com/token'
    );
    expect(scheme.flows.clientCredentials?.scopes).toEqual({
      'read:data': 'Read data',
      'write:data': 'Write data',
    });
  });

  it('should load multi-scheme config', () => {
    const configPath = join(tempDir, 'auth.json');
    const config: AuthOverrideConfig = {
      schemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      security: [{ BearerAuth: [], ApiKeyAuth: [] }],
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));

    const result = loadAuthConfig(configPath);

    expect(result.schemes).toHaveProperty('BearerAuth');
    expect(result.schemes).toHaveProperty('ApiKeyAuth');
    expect(result.security).toEqual([{ BearerAuth: [], ApiKeyAuth: [] }]);
  });

  it('should throw error for invalid JSON', () => {
    const configPath = join(tempDir, 'invalid.json');
    writeFileSync(configPath, '{invalid json}');

    expect(() => loadAuthConfig(configPath)).toThrow('Invalid JSON in auth config file');
  });

  it('should throw error for missing schemes field', () => {
    const configPath = join(tempDir, 'no-schemes.json');
    writeFileSync(configPath, JSON.stringify({ security: [] }));

    expect(() => loadAuthConfig(configPath)).toThrow(
      'Invalid auth config: missing or invalid "schemes" field'
    );
  });

  it('should throw error for invalid API Key scheme', () => {
    const configPath = join(tempDir, 'invalid-apikey.json');
    const config = {
      schemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'invalid-location',
          name: 'X-API-Key',
        },
      },
    };

    writeFileSync(configPath, JSON.stringify(config));

    expect(() => loadAuthConfig(configPath)).toThrow(
      'Invalid API Key scheme "ApiKeyAuth": "in" must be one of: header, query, cookie'
    );
  });

  it('should throw error for invalid OAuth2 scheme without flows', () => {
    const configPath = join(tempDir, 'invalid-oauth2.json');
    const config = {
      schemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {},
        },
      },
    };

    writeFileSync(configPath, JSON.stringify(config));

    expect(() => loadAuthConfig(configPath)).toThrow(
      'Invalid OAuth2 scheme "OAuth2": at least one flow is required'
    );
  });

  it('should throw error for OAuth2 clientCredentials without tokenUrl', () => {
    const configPath = join(tempDir, 'no-token-url.json');
    const config = {
      schemes: {
        OAuth2: {
          type: 'oauth2',
          flows: {
            clientCredentials: {
              scopes: {},
            },
          },
        },
      },
    };

    writeFileSync(configPath, JSON.stringify(config));

    expect(() => loadAuthConfig(configPath)).toThrow(
      'Invalid OAuth2 scheme "OAuth2": "clientCredentials" flow requires "tokenUrl"'
    );
  });
});
