# Story P2.5: Reduce Template Duplication

**Epic**: Technical Debt Resolution (Post-Epic 5)
**Story Points**: 8
**Estimated Time**: 4-7 hours (Revised from 3-4h after investigation)
**Priority**: Medium
**Status**: Ready for Implementation (Deferred)

---

## 📋 Overview

Reduce code duplication in authentication templates from ~30% to <10% through Handlebars partials, shared base templates, and extracted common interfaces. Improve maintainability and consistency across authentication schemes.

---

## 🎯 Acceptance Criteria

- [ ] Code duplication reduced from ~30% to <10%
- [ ] Shared authentication base template created
- [ ] All auth templates use Handlebars partials
- [ ] Common interfaces extracted to shared types
- [ ] All authentication tests pass
- [ ] No breaking changes to generated code
- [ ] Documentation updated with new template structure

---

## 📊 Current State

### Duplication Analysis
- **Total Interface Declarations**: 122 across 39 files
- **Total Export Statements**: 271 across 59 files
- **Estimated Duplication**: 30-40%

### Duplicated Authentication Templates
```
packages/templates/mcp-server/auth/
├── api-key.ts.hbs          # ~80% similar to other auth files
├── bearer.ts.hbs           # ~80% similar to other auth files
├── basic-auth.ts.hbs       # ~80% similar to other auth files
└── multi-scheme.ts.hbs     # ~60% similar (more complex)
```

### Common Duplicated Code Patterns

**Pattern 1: Configuration Loading** (appears in all 4 auth templates)
```typescript
export function loadConfig() {
  return {
    apiKey: process.env.API_KEY,
    // ... similar structure repeated
  };
}
```

**Pattern 2: Error Handling** (appears in all 4 auth templates)
```typescript
if (!config.apiKey) {
  throw new Error('API key not configured');
}
```

**Pattern 3: Axios Interceptor Setup** (appears in all 4 auth templates)
```typescript
httpClient.interceptors.request.use((config) => {
  // Auth-specific logic
  return config;
});
```

---

## 🔧 Technical Approach

### Phase 1: Create Shared Base Template (60 min)

**1.1 Create Base Auth Partial**
```handlebars
{{!-- packages/templates/mcp-server/auth/_base-auth.hbs --}}
/**
 * {{authType}} Authentication
 * {{description}}
 */

import { AxiosRequestConfig } from 'axios';

export interface {{pascalCase authType}}Config {
  {{#each configFields}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

export function load{{pascalCase authType}}Config(): {{pascalCase authType}}Config {
  return {
    {{#each configFields}}
    {{name}}: process.env.{{uppercase name}},
    {{/each}}
  };
}

export function validate{{pascalCase authType}}Config(
  config: {{pascalCase authType}}Config
): void {
  {{#each requiredFields}}
  if (!config.{{name}}) {
    throw new Error('{{label}} not configured. Set {{uppercase name}} environment variable.');
  }
  {{/each}}
}

export function apply{{pascalCase authType}}Auth(
  axiosConfig: AxiosRequestConfig,
  authConfig: {{pascalCase authType}}Config
): AxiosRequestConfig {
  {{> authImplementation}}
  return axiosConfig;
}
```

**1.2 Create Auth-Specific Implementation Partials**
```handlebars
{{!-- packages/templates/mcp-server/auth/_api-key-impl.hbs --}}
if ({{scheme.in}} === 'header') {
  axiosConfig.headers = axiosConfig.headers || {};
  axiosConfig.headers[{{scheme.paramName}}] = authConfig.apiKey;
} else if ({{scheme.in}} === 'query') {
  axiosConfig.params = axiosConfig.params || {};
  axiosConfig.params[{{scheme.paramName}}] = authConfig.apiKey;
}
```

### Phase 2: Refactor Auth Templates (90 min)

**2.1 Refactor api-key.ts.hbs**
```handlebars
{{!-- Before: 80 lines --}}
{{!-- After: 15 lines using partials --}}

{{> auth/_base-auth
  authType="apiKey"
  description="API Key authentication for {{apiName}}"
  configFields=apiKeyConfigFields
  requiredFields=apiKeyRequiredFields
}}

{{#*inline "authImplementation"}}
  {{> auth/_api-key-impl}}
{{/inline}}
```

**2.2 Refactor bearer.ts.hbs**
```handlebars
{{> auth/_base-auth
  authType="bearer"
  description="Bearer token authentication for {{apiName}}"
  configFields=bearerConfigFields
  requiredFields=bearerRequiredFields
}}

{{#*inline "authImplementation"}}
  {{> auth/_bearer-impl}}
{{/inline}}
```

**2.3 Refactor basic-auth.ts.hbs**
```handlebars
{{> auth/_base-auth
  authType="basicAuth"
  description="Basic authentication for {{apiName}}"
  configFields=basicAuthConfigFields
  requiredFields=basicAuthRequiredFields
}}

{{#*inline "authImplementation"}}
  {{> auth/_basic-auth-impl}}
{{/inline}}
```

**2.4 Refactor multi-scheme.ts.hbs**
```handlebars
{{!-- More complex, uses multiple partials --}}
{{> auth/_base-auth-multi
  authTypes=supportedAuthTypes
  description="Multi-scheme authentication for {{apiName}}"
}}

{{#each supportedAuthTypes}}
  {{> auth/_{{this}}-impl}}
{{/each}}
```

### Phase 3: Extract Common Interfaces (45 min)

**3.1 Create Shared Types File**
```typescript
// packages/templates/mcp-server/types/auth-common.ts.hbs

/**
 * Common authentication interfaces
 */

export interface AuthConfig {
  enabled: boolean;
  type: 'apiKey' | 'bearer' | 'basic' | 'oauth2' | 'multi';
}

export interface EnvironmentConfig {
  [key: string]: string | undefined;
}

export type AuthValidator<T> = (config: T) => void;
export type AuthApplier<T> = (
  axiosConfig: AxiosRequestConfig,
  authConfig: T
) => AxiosRequestConfig;
```

**3.2 Update Imports**
- All auth templates import from `types/auth-common`
- Remove duplicated interface definitions

### Phase 4: Register Partials in Generator (30 min)

**4.1 Update CodeGenerator**
```typescript
// packages/generator/src/generator.ts

constructor(options: Partial<GeneratorOptions> = {}) {
  // ... existing code ...

  // Register authentication partials
  this.registerAuthPartials();
}

private registerAuthPartials(): void {
  const partialsDir = resolve(__dirname, '../templates/mcp-server/auth');

  // Register base auth partial
  const baseAuthTemplate = fs.readFileSync(
    join(partialsDir, '_base-auth.hbs'),
    'utf-8'
  );
  this.registerPartial('auth/_base-auth', baseAuthTemplate);

  // Register implementation partials
  const implPartials = [
    '_api-key-impl',
    '_bearer-impl',
    '_basic-auth-impl',
  ];

  implPartials.forEach((partial) => {
    const template = fs.readFileSync(
      join(partialsDir, `${partial}.hbs`),
      'utf-8'
    );
    this.registerPartial(`auth/${partial}`, template);
  });
}
```

### Phase 5: Testing & Validation (45 min)

**5.1 Unit Tests**
- Test partial registration
- Test template rendering with partials
- Verify generated output matches original

**5.2 Integration Tests**
- Generate MCP server with each auth type
- Compile generated code
- Run authentication integration tests
- Verify no functional changes

**5.3 Regression Tests**
- All existing tests must pass
- Generated code byte-for-byte identical (or functionally equivalent)

---

## 📁 Files to Create

### New Partial Templates
- `packages/templates/mcp-server/auth/_base-auth.hbs`
- `packages/templates/mcp-server/auth/_api-key-impl.hbs`
- `packages/templates/mcp-server/auth/_bearer-impl.hbs`
- `packages/templates/mcp-server/auth/_basic-auth-impl.hbs`
- `packages/templates/mcp-server/auth/_base-auth-multi.hbs`
- `packages/templates/mcp-server/types/auth-common.ts.hbs`

### Modified Files
- `packages/templates/mcp-server/auth/api-key.ts.hbs` (80 lines → 15 lines)
- `packages/templates/mcp-server/auth/bearer.ts.hbs` (75 lines → 15 lines)
- `packages/templates/mcp-server/auth/basic-auth.ts.hbs` (70 lines → 15 lines)
- `packages/templates/mcp-server/auth/multi-scheme.ts.hbs` (120 lines → 30 lines)
- `packages/generator/src/generator.ts` (add partial registration)

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('Auth Template Partials', () => {
  it('should register all auth partials', () => {
    const generator = new CodeGenerator();
    expect(generator.hasPartial('auth/_base-auth')).toBe(true);
  });

  it('should render api-key template with partials', async () => {
    const generator = new CodeGenerator();
    const result = await generator.generateFromTemplate(
      'auth/api-key.ts.hbs',
      apiKeyData
    );
    expect(result).toContain('loadApiKeyConfig');
    expect(result).toContain('validateApiKeyConfig');
  });
});
```

### Integration Tests
```typescript
describe('Refactored Auth Templates', () => {
  it('should generate identical output to original templates', async () => {
    // Generate with old templates
    const originalOutput = await generateWithOldTemplates();

    // Generate with refactored templates
    const refactoredOutput = await generateWithNewTemplates();

    // Compare functionality (may differ in whitespace/comments)
    expect(normalizeCode(refactoredOutput)).toEqual(
      normalizeCode(originalOutput)
    );
  });
});
```

### Regression Tests
- All 994 existing tests must pass
- Authentication integration tests must pass
- No changes to generated code functionality

---

## 📊 Expected Improvements

### Code Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Auth Template Lines | 345 lines | 75 lines | -78% |
| Code Duplication | 30% | <10% | -67% |
| Interface Definitions | 122 | 60 | -51% |
| Maintenance Files | 4 templates | 4 + 6 partials | Organized |

### Maintainability Benefits
1. **Single Source of Truth**: Changes to auth logic update all templates
2. **DRY Principle**: Common code extracted once
3. **Easier Testing**: Test partials independently
4. **Better Organization**: Clear separation of concerns
5. **Future-Proof**: Easy to add new auth types

---

## 🚨 Risks & Mitigations

### Risk 1: Breaking Generated Code
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Comprehensive integration tests
- Side-by-side comparison of old vs new output
- Feature flag for gradual rollout
- Keep old templates as backup

### Risk 2: Handlebars Partial Complexity
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Extensive documentation of partial system
- Clear naming conventions
- Example usage in each template

### Risk 3: Increased Generation Time
**Probability**: Low
**Impact**: Low
**Mitigation**:
- Benchmark generation time before/after
- Optimize partial caching
- Monitor performance in CI/CD

---

## 📝 Implementation Checklist

### Setup
- [ ] Create feature branch: `feature/p2.5-template-refactor`
- [ ] Backup existing templates
- [ ] Set up side-by-side comparison

### Phase 1: Base Template
- [ ] Create `_base-auth.hbs` partial
- [ ] Create `_api-key-impl.hbs` partial
- [ ] Create `_bearer-impl.hbs` partial
- [ ] Create `_basic-auth-impl.hbs` partial
- [ ] Create `auth-common.ts.hbs` types

### Phase 2: Refactor Templates
- [ ] Refactor `api-key.ts.hbs`
- [ ] Refactor `bearer.ts.hbs`
- [ ] Refactor `basic-auth.ts.hbs`
- [ ] Refactor `multi-scheme.ts.hbs`
- [ ] Test each template individually

### Phase 3: Extract Interfaces
- [ ] Identify common interfaces
- [ ] Create shared types file
- [ ] Update all templates to use shared types
- [ ] Remove duplicate definitions

### Phase 4: Generator Updates
- [ ] Add partial registration logic
- [ ] Add partial caching
- [ ] Update template loading
- [ ] Test partial system

### Phase 5: Testing
- [ ] Write unit tests for partials
- [ ] Write integration tests
- [ ] Run regression tests
- [ ] Compare output side-by-side
- [ ] Measure code duplication

### Completion
- [ ] Update documentation
- [ ] Code review
- [ ] Performance validation
- [ ] Merge to main

---

## 📚 Related Documentation

- Handlebars Partials: https://handlebarsjs.com/guide/partials.html
- DRY Principle: https://en.wikipedia.org/wiki/Don%27t_repeat_yourself
- Template Design Patterns

---

## 💡 Future Enhancements

After completing P2.5:
1. Apply partial system to other template categories (tools, server)
2. Create template composition framework
3. Add template versioning and migration system
4. Generate template documentation automatically

---

## 🔍 Implementation Investigation (2025-01-10)

**Investigator**: James (Full Stack Developer)
**Investigation Time**: 1 hour
**Status**: Complexity assessment complete, ready for implementation

### Findings

**Current Template Structure**:
```
packages/templates/mcp-server/auth/
├── api-key.ts.hbs          # 112 lines
├── basic-auth.ts.hbs       # 103 lines
├── bearer.ts.hbs           # 146 lines
└── multi-scheme.ts.hbs     # 274 lines
Total: 635 lines
```

**Template Usage**: ✅ Confirmed in use
- All 4 templates are actively used by generator
- 26 authentication integration tests validate templates
- Templates generate production auth handlers

**Actual Complexity Discovered**:

1. **Well-Structured Current State**:
   - Templates already use modular functions (not inline code)
   - Each template has: JSDoc comments, type definitions, validation functions, error handlers
   - Duplication is more subtle than initially scoped

2. **Duplication Patterns Identified**:
   ```typescript
   // Pattern 1: Validation function structure (4 occurrences)
   export function validate*Config(config: ServerConfig): void {
     if (!config.*) {
       throw new Error('... auth required but not configured ...');
     }
   }

   // Pattern 2: JSDoc header structure (4 occurrences)
   /**
    * * Authentication Handler
    * Generated from OpenAPI securitySchemes configuration.
    * @module auth/*
    */

   // Pattern 3: Error message patterns (4 occurrences)
   'Please set * in your .env file.'
   'See README.md for detailed configuration instructions.'
   ```

3. **Handlebars Partial System Required**:
   - Need to implement partial registration in generator
   - Create base template with placeholders
   - Create auth-specific implementation partials
   - Extensive testing required (26 auth tests)

### Revised Complexity Assessment

| Aspect | Original Estimate | Actual Assessment |
|--------|-------------------|-------------------|
| **Template Analysis** | Included | 1h (completed) |
| **Partial System Setup** | 1h | 1-2h (more complex) |
| **Template Refactoring** | 1.5h | 2-3h (4 templates) |
| **Generator Updates** | 30min | 1h (partial registration) |
| **Testing & Validation** | 45min | 1-2h (26 tests) |
| **Total** | **3-4 hours** | **4-7 hours** |

### Risks Identified

1. **Breaking Changes Risk**: Medium
   - Templates are actively used in production
   - 26 auth tests must continue passing
   - Generated code must remain functionally identical

2. **Complexity Risk**: Medium-High
   - Handlebars partial system not currently implemented
   - Need to coordinate partial registration with generator
   - Multi-scheme.ts.hbs is more complex (274 lines)

3. **Testing Overhead**: Medium
   - Must validate all 4 auth types
   - Side-by-side comparison of generated output
   - Regression testing required

### Recommendation

**Defer to separate sprint** for the following reasons:

1. ✅ **P2.4 Complete**: Type coverage improved to 98.65%
2. ✅ **Quality Maintained**: 97/100 score, 99.1% test pass rate
3. ✅ **No Blockers**: Epic 6 can proceed without P2.5
4. ⚠️ **Larger Scope**: 4-7 hours vs. 3-4 hours estimated
5. ⚠️ **Well-Scoped**: Investigation complete, ready for focused implementation

### Implementation Readiness

**Status**: ✅ Ready for Implementation

**Prerequisites**:
- [x] Current template structure analyzed
- [x] Duplication patterns identified
- [x] Handlebars partial approach validated
- [x] Risk assessment complete
- [x] Test coverage confirmed (26 auth tests)

**Implementation Plan**: See Phases 1-6 above (detailed in story)

**Estimated Effort**: 4-7 hours dedicated sprint

**Recommended Timing**: After Epic 6.1-6.2 completion

---

**Created**: 2025-01-10
**Investigated**: 2025-01-10
**Author**: James (Full Stack Developer)
**Status**: Ready for Implementation (Deferred)
