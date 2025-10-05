/**
 * Server Extractor Tests
 * Story 2.8: Server URL Extraction and Base Path Handling
 */

import { describe, it, expect } from 'vitest';
import {
  extractServers,
  extractBasePath,
  resolveServerUrl,
  inferServerEnvironment,
  generateEnvVarSuggestions,
} from '../src/server-extractor.js';
import type { OpenAPI } from 'openapi-types';

describe('Server Extractor', () => {
  describe('extractBasePath', () => {
    it('should extract base path from URL with path', () => {
      expect(extractBasePath('https://api.example.com/v1')).toBe('/v1');
    });

    it('should handle URL without path', () => {
      expect(extractBasePath('https://api.example.com')).toBe('/');
    });

    it('should remove trailing slash', () => {
      expect(extractBasePath('https://api.example.com/v1/')).toBe('/v1');
    });

    it('should preserve root path', () => {
      expect(extractBasePath('https://api.example.com/')).toBe('/');
    });

    it('should handle localhost URLs', () => {
      expect(extractBasePath('http://localhost:8080/api')).toBe('/api');
    });

    it('should handle IP address URLs', () => {
      expect(extractBasePath('http://127.0.0.1:3000/v1')).toBe('/v1');
    });

    it('should handle empty URL', () => {
      expect(extractBasePath('')).toBe('/');
    });

    it('should handle nested paths', () => {
      expect(extractBasePath('https://api.example.com/v1/api')).toBe('/v1/api');
    });

    it('should handle custom ports', () => {
      expect(extractBasePath('https://api.example.com:8443/v1')).toBe('/v1');
    });
  });

  describe('resolveServerUrl', () => {
    it('should resolve variables with defaults', () => {
      const result = resolveServerUrl('{protocol}://api.example.com/{version}', {
        protocol: { default: 'https' },
        version: { default: 'v1' },
      });

      expect(result).toBe('https://api.example.com/v1');
    });

    it('should handle URL without variables', () => {
      const result = resolveServerUrl('https://api.example.com');

      expect(result).toBe('https://api.example.com');
    });

    it('should handle URL without variables object', () => {
      const result = resolveServerUrl('https://api.example.com', undefined);

      expect(result).toBe('https://api.example.com');
    });

    it('should handle multiple instances of same variable', () => {
      const result = resolveServerUrl('{env}.api.example.com/{env}', {
        env: { default: 'prod' },
      });

      expect(result).toBe('prod.api.example.com/prod');
    });

    it('should handle multiple different variables', () => {
      const result = resolveServerUrl('{protocol}://{subdomain}.example.com/{version}', {
        protocol: { default: 'https' },
        subdomain: { default: 'api' },
        version: { default: 'v2' },
      });

      expect(result).toBe('https://api.example.com/v2');
    });

    it('should handle variables with enum values', () => {
      const result = resolveServerUrl('{protocol}://api.example.com', {
        protocol: {
          default: 'https',
          enum: ['https', 'http'],
        },
      });

      expect(result).toBe('https://api.example.com');
    });

    it('should use default when variable has no value', () => {
      const result = resolveServerUrl('{version}/api', {
        version: { default: 'v1' },
      });

      expect(result).toBe('v1/api');
    });
  });

  describe('inferServerEnvironment', () => {
    it('should detect production from URL', () => {
      expect(inferServerEnvironment('https://api.example.com', 'Production server')).toBe(
        'production'
      );
    });

    it('should detect production from prod keyword', () => {
      expect(inferServerEnvironment('https://prod-api.example.com')).toBe('production');
    });

    it('should detect staging from URL', () => {
      expect(inferServerEnvironment('https://staging-api.example.com')).toBe('staging');
    });

    it('should detect staging from stg keyword', () => {
      expect(inferServerEnvironment('https://stg.api.example.com')).toBe('staging');
    });

    it('should detect development from URL', () => {
      expect(inferServerEnvironment('https://dev-api.example.com')).toBe('development');
    });

    it('should detect development from description', () => {
      expect(inferServerEnvironment('https://api.example.com', 'Development environment')).toBe(
        'development'
      );
    });

    it('should detect local from localhost', () => {
      expect(inferServerEnvironment('http://localhost:8080')).toBe('local');
    });

    it('should detect local from 127.0.0.1', () => {
      expect(inferServerEnvironment('http://127.0.0.1:8080')).toBe('local');
    });

    it('should detect local from description', () => {
      expect(inferServerEnvironment('http://192.168.1.1', 'Local development')).toBe('local');
    });

    it('should default to unknown', () => {
      expect(inferServerEnvironment('https://api.example.com')).toBe('unknown');
    });

    it('should be case insensitive', () => {
      expect(inferServerEnvironment('https://PROD-api.example.com')).toBe('production');
      expect(inferServerEnvironment('https://api.example.com', 'STAGING server')).toBe('staging');
    });
  });

  describe('generateEnvVarSuggestions', () => {
    it('should generate env var names', () => {
      const result = generateEnvVarSuggestions({
        environment: { default: 'prod' },
        version: { default: 'v1' },
      });

      expect(result).toEqual({
        environment: 'API_ENVIRONMENT',
        version: 'API_VERSION',
      });
    });

    it('should handle special characters', () => {
      const result = generateEnvVarSuggestions({
        'api-region': { default: 'us-east-1' },
      });

      expect(result['api-region']).toBe('API_API_REGION');
    });

    it('should handle underscores', () => {
      const result = generateEnvVarSuggestions({
        base_url: { default: 'https://api.example.com' },
      });

      expect(result.base_url).toBe('API_BASE_URL');
    });

    it('should handle camelCase', () => {
      const result = generateEnvVarSuggestions({
        apiVersion: { default: 'v1' },
      });

      expect(result.apiVersion).toBe('API_APIVERSION');
    });

    it('should handle empty variables', () => {
      const result = generateEnvVarSuggestions(undefined);

      expect(result).toEqual({});
    });

    it('should handle empty variables object', () => {
      const result = generateEnvVarSuggestions({});

      expect(result).toEqual({});
    });
  });

  describe('extractServers', () => {
    it('should extract simple server', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          {
            url: 'https://api.example.com/v1',
            description: 'Production server',
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].url).toBe('https://api.example.com/v1');
      expect(result.servers[0].baseURL).toBe('https://api.example.com/v1');
      expect(result.servers[0].basePath).toBe('/v1');
      expect(result.servers[0].description).toBe('Production server');
      expect(result.servers[0].priority).toBe(0);
      expect(result.servers[0].environment).toBe('production');
      expect(result.hasMultipleServers).toBe(false);
      expect(result.defaultServer).toBe(result.servers[0]);
    });

    it('should handle missing servers array', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].url).toBe('');
      expect(result.servers[0].baseURL).toBe('');
      expect(result.servers[0].basePath).toBe('/');
      expect(result.servers[0].environment).toBe('unknown');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('No servers defined');
      expect(result.hasMultipleServers).toBe(false);
    });

    it('should handle empty servers array', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].url).toBe('');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('No servers defined');
    });

    it('should extract server with variables', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          {
            url: '{protocol}://api.example.com/{version}',
            variables: {
              protocol: {
                default: 'https',
                enum: ['https', 'http'],
              },
              version: {
                default: 'v1',
                enum: ['v1', 'v2'],
                description: 'API version',
              },
            },
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers[0].url).toBe('{protocol}://api.example.com/{version}');
      expect(result.servers[0].baseURL).toBe('https://api.example.com/v1');
      expect(result.servers[0].basePath).toBe('/v1');
      expect(result.servers[0].variables).toBeDefined();
      expect(result.servers[0].variables?.protocol.default).toBe('https');
      expect(result.servers[0].variables?.version.default).toBe('v1');
      expect(result.servers[0].envVarSuggestions).toEqual({
        protocol: 'API_PROTOCOL',
        version: 'API_VERSION',
      });
    });

    it('should extract multiple servers with priorities', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          {
            url: 'https://api.example.com',
            description: 'Production server',
          },
          {
            url: 'https://staging-api.example.com',
            description: 'Staging server',
          },
          {
            url: 'http://localhost:8080',
            description: 'Local development',
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers).toHaveLength(3);
      expect(result.hasMultipleServers).toBe(true);
      expect(result.defaultServer).toBe(result.servers[0]);

      expect(result.servers[0].priority).toBe(0);
      expect(result.servers[0].environment).toBe('production');
      expect(result.servers[0].baseURL).toBe('https://api.example.com');

      expect(result.servers[1].priority).toBe(1);
      expect(result.servers[1].environment).toBe('staging');
      expect(result.servers[1].baseURL).toBe('https://staging-api.example.com');

      expect(result.servers[2].priority).toBe(2);
      expect(result.servers[2].environment).toBe('local');
      expect(result.servers[2].baseURL).toBe('http://localhost:8080');
    });

    it('should preserve server order', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          { url: 'https://api1.example.com' },
          { url: 'https://api2.example.com' },
          { url: 'https://api3.example.com' },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers[0].baseURL).toBe('https://api1.example.com');
      expect(result.servers[1].baseURL).toBe('https://api2.example.com');
      expect(result.servers[2].baseURL).toBe('https://api3.example.com');
      expect(result.defaultServer.baseURL).toBe('https://api1.example.com');
    });

    it('should handle server without description', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          {
            url: 'https://api.example.com',
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers[0].description).toBeUndefined();
      expect(result.servers[0].baseURL).toBe('https://api.example.com');
    });

    it('should validate invalid server URLs', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          {
            url: 'not-a-valid-url',
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.includes('not a valid URL'))).toBe(true);
    });

    it('should warn about variables without defaults', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [
          {
            url: '{protocol}://api.example.com',
            variables: {
              protocol: {
                default: '',
                enum: ['https', 'http'],
              },
            },
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.warnings.some((w) => w.includes('no default value'))).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should extract servers from complete OpenAPI document', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Test API', version: '1.0.0' },
        servers: [
          {
            url: 'https://api.example.com/v1',
            description: 'Production server',
          },
          {
            url: 'https://staging-api.example.com/v1',
            description: 'Staging server',
          },
        ],
        paths: {
          '/users': {
            get: {
              operationId: 'getUsers',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers).toHaveLength(2);
      expect(result.hasMultipleServers).toBe(true);
      expect(result.defaultServer.baseURL).toBe('https://api.example.com/v1');
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle complex server configuration', () => {
      const document = {
        openapi: '3.0.0',
        info: { title: 'Complex API', version: '2.0.0' },
        servers: [
          {
            url: '{protocol}://{environment}.api.example.com/{version}',
            description: 'Configurable server',
            variables: {
              protocol: {
                default: 'https',
                enum: ['https', 'http'],
                description: 'Protocol scheme',
              },
              environment: {
                default: 'prod',
                enum: ['prod', 'staging', 'dev'],
                description: 'Environment name',
              },
              version: {
                default: 'v2',
                enum: ['v1', 'v2'],
                description: 'API version',
              },
            },
          },
        ],
        paths: {},
      } as OpenAPI.Document;

      const result = extractServers(document);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].baseURL).toBe('https://prod.api.example.com/v2');
      expect(result.servers[0].basePath).toBe('/v2');
      expect(result.servers[0].envVarSuggestions).toEqual({
        protocol: 'API_PROTOCOL',
        environment: 'API_ENVIRONMENT',
        version: 'API_VERSION',
      });
      expect(result.servers[0].environment).toBe('production');
    });
  });
});
