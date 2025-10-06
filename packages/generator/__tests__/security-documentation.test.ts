import { describe, it, expect, beforeEach } from 'vitest';
import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Security Documentation', () => {
  let securityTemplate: HandlebarsTemplateDelegate;
  let readmeTemplate: HandlebarsTemplateDelegate;
  let envExampleTemplate: HandlebarsTemplateDelegate;
  let gitignoreTemplate: HandlebarsTemplateDelegate;

  beforeEach(() => {
    // Register Handlebars helper
    Handlebars.registerHelper('or', function (...args) {
      args.pop();
      return args.some((arg) => !!arg);
    });

    Handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    // Load templates
    const securitySource = readFileSync(
      resolve(__dirname, '../../templates/mcp-server/SECURITY.md.hbs'),
      'utf-8'
    );
    const readmeSource = readFileSync(
      resolve(__dirname, '../../templates/mcp-server/README.md.hbs'),
      'utf-8'
    );
    const envSource = readFileSync(
      resolve(__dirname, '../../templates/mcp-server/env.example.hbs'),
      'utf-8'
    );
    const gitignoreSource = readFileSync(
      resolve(__dirname, '../../templates/mcp-server/gitignore.hbs'),
      'utf-8'
    );

    securityTemplate = Handlebars.compile(securitySource);
    readmeTemplate = Handlebars.compile(readmeSource);
    envExampleTemplate = Handlebars.compile(envSource);
    gitignoreTemplate = Handlebars.compile(gitignoreSource);
  });

  describe('SECURITY.md Template', () => {
    it('should include credential management section', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('# Security Best Practices');
      expect(result).toContain('## Credential Management');
      expect(result).toContain('Never Commit Credentials');
      expect(result).toContain('.env');
    });

    it('should include environment variable security', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('### Environment Variables');
      expect(result).toContain('API_KEY=');
      expect(result).toContain('✅ GOOD: Environment variable');
      expect(result).toContain('❌ BAD: Hardcoded in source code');
    });

    it('should include credential rotation guide', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('### Credential Rotation');
      expect(result).toContain('Generate New Credentials');
      expect(result).toContain('Update Environment');
      expect(result).toContain('Restart Server');
      expect(result).toContain('Revoke Old Credentials');
    });

    it('should include production deployment guide', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## Production Deployment');
      expect(result).toContain('AWS Secrets Manager');
      expect(result).toContain('HashiCorp Vault');
      expect(result).toContain('Docker Secrets');
      expect(result).toContain('Kubernetes Secrets');
    });

    it('should include security checklist', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## Security Checklist');
      expect(result).toContain('- [ ] `.env` file is **NOT** committed to git');
      expect(result).toContain('- [ ] `.gitignore` includes `.env`');
      expect(result).toContain('- [ ] **HTTPS** is used');
      expect(result).toContain('- [ ] Debug logging is **disabled**');
    });

    it('should include logging security', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## Logging Security');
      expect(result).toContain('### Safe Logging Practices');
      expect(result).toContain('masks credentials in logs');
      expect(result).toContain('### Error Messages');
    });

    it('should emphasize HTTPS requirement', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## HTTPS Requirement');
      expect(result).toContain('CRITICAL: Always use HTTPS');
      expect(result).toContain('https://');
      expect(result).toContain('man-in-the-middle attacks');
    });

    it('should include least privilege section', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## Least Privilege Principle');
      expect(result).toContain('minimal required permissions');
      expect(result).toContain('Multiple Environments');
    });

    it('should include security incident response', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## Security Incident Response');
      expect(result).toContain('Immediate Actions');
      expect(result).toContain('Revoke Compromised Credentials');
      expect(result).toContain('Audit Access Logs');
    });

    it('should include external resources', () => {
      const context = {
        apiName: 'Test API',
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
      };

      const result = securityTemplate(context);

      expect(result).toContain('## External Resources');
      expect(result).toContain('OWASP API Security');
      expect(result).toContain('NIST Password Guidelines');
      expect(result).toContain('12-Factor App');
    });

    it('should adapt to different auth types', () => {
      const contexts = [
        { hasApiKey: true },
        { hasBearerToken: true },
        { hasBasicAuth: true },
        { hasApiKey: true, hasBearerToken: true, hasBasicAuth: true },
      ];

      for (const extraContext of contexts) {
        const context = {
          apiName: 'Test API',
          primaryServer: { url: 'https://api.example.com' },
          generatedAt: new Date().toISOString(),
          ...extraContext,
        };

        const result = securityTemplate(context);

        if (context.hasApiKey) {
          expect(result).toContain('API_KEY=');
        }
        if (context.hasBearerToken) {
          expect(result).toContain('BEARER_TOKEN=');
        }
        if (context.hasBasicAuth) {
          expect(result).toContain('BASIC_AUTH_USERNAME=');
          expect(result).toContain('BASIC_AUTH_PASSWORD=');
        }
      }
    });
  });

  describe('README.md Security Section', () => {
    it('should include security section', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
      };

      const result = readmeTemplate(context);

      expect(result).toContain('## Security');
      expect(result).toContain('⚠️ IMPORTANT: Read this section before deploying to production');
    });

    it('should warn against committing .env', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
      };

      const result = readmeTemplate(context);

      expect(result).toContain('NEVER commit your `.env` file');
      expect(result).toContain('❌ NEVER DO THIS');
      expect(result).toContain('git add .env');
    });

    it('should include security best practices', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
      };

      const result = readmeTemplate(context);

      expect(result).toContain('### Security Best Practices');
      expect(result).toContain('Environment Variables');
      expect(result).toContain('HTTPS Requirement');
      expect(result).toContain('Credential Rotation');
      expect(result).toContain('Least Privilege');
      expect(result).toContain('Debug Mode');
    });

    it('should include security checklist', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
      };

      const result = readmeTemplate(context);

      expect(result).toContain('### Security Checklist');
      expect(result).toContain('- [ ] `.env` file is NOT committed to git');
      expect(result).toContain('- [ ] API endpoints use HTTPS');
      expect(result).toContain('- [ ] Debug mode is disabled');
    });

    it('should link to SECURITY.md', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
      };

      const result = readmeTemplate(context);

      expect(result).toContain('[SECURITY.md](./SECURITY.md)');
    });

    it('should include auth-specific security tips', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        hasBearerToken: true,
        hasBasicAuth: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
      };

      const result = readmeTemplate(context);

      expect(result).toContain('### Quick Security Tips');
      expect(result).toContain('**API Key Security:**');
      expect(result).toContain('**Bearer Token Security:**');
      expect(result).toContain('**Basic Auth Security:**');
    });
  });

  describe('.env.example Template', () => {
    it('should include security warning header', () => {
      const context = {
        primaryServer: { url: 'https://api.example.com' },
      };

      const result = envExampleTemplate(context);

      expect(result).toContain('⚠️ SECURITY WARNING ⚠️');
      expect(result).toContain('NEVER commit your actual .env file');
      expect(result).toContain('See SECURITY.md for detailed security best practices');
    });

    it('should warn about HTTPS requirement', () => {
      const context = {
        primaryServer: { url: 'https://api.example.com' },
      };

      const result = envExampleTemplate(context);

      expect(result).toContain('⚠️ Always use HTTPS in production!');
    });

    it('should warn about debug mode', () => {
      const context = {
        primaryServer: { url: 'https://api.example.com' },
      };

      const result = envExampleTemplate(context);

      expect(result).toContain('⚠️ Debug mode may expose sensitive information in logs');
      expect(result).toContain('DEBUG=false');
    });

    it('should include credential rotation warnings', () => {
      const context = {
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        apiKeySchemes: [{ name: 'X-API-Key', in: 'header' }],
      };

      const result = envExampleTemplate(context);

      expect(result).toContain('⚠️ NEVER commit your real API key!');
      expect(result).toContain('⚠️ Rotate this key every 30-90 days');
    });

    it('should include security checklist', () => {
      const context = {
        primaryServer: { url: 'https://api.example.com' },
      };

      const result = envExampleTemplate(context);

      expect(result).toContain('# Security Checklist');
      expect(result).toContain('[ ] All placeholder values replaced');
      expect(result).toContain('[ ] .env file is NOT committed to git');
      expect(result).toContain('[ ] HTTPS is used');
    });
  });

  describe('.gitignore Template', () => {
    it('should include .env in gitignore', () => {
      const result = gitignoreTemplate({});

      expect(result).toContain('.env');
      expect(result).toContain('# Local environment file with real credentials');
    });

    it('should include security warning', () => {
      const result = gitignoreTemplate({});

      expect(result).toContain('⚠️ SECURITY: Never commit credentials!');
    });

    it('should ignore environment file variations', () => {
      const result = gitignoreTemplate({});

      expect(result).toContain('.env');
      expect(result).toContain('.env.local');
      expect(result).toContain('.env.*.local');
      expect(result).toContain('.env.backup');
    });

    it('should be comprehensive', () => {
      const result = gitignoreTemplate({});

      expect(result).toContain('node_modules/');
      expect(result).toContain('dist/');
      expect(result).toContain('logs/');
      expect(result).toContain('.DS_Store');
    });
  });

  describe('Security Integration', () => {
    it('should have consistent security messaging across all templates', () => {
      const context = {
        apiName: 'Test API',
        hasApiKey: true,
        primaryServer: { url: 'https://api.example.com' },
        generatedAt: new Date().toISOString(),
        operations: [],
        apiKeySchemes: [{ name: 'X-API-Key', in: 'header' }],
      };

      const security = securityTemplate(context);
      const readme = readmeTemplate(context);
      const env = envExampleTemplate(context);

      // All should mention never committing .env
      expect(security).toContain('.env');
      expect(readme).toContain('.env');
      expect(env).toContain('.env');

      // All should mention HTTPS
      expect(security).toContain('HTTPS');
      expect(readme).toContain('HTTPS');
      expect(env).toContain('HTTPS');

      // All should warn about credentials
      expect(security).toContain('credentials');
      expect(readme).toContain('credentials');
      expect(env).toContain('credentials');
    });
  });
});
