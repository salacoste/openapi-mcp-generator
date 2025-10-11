# Epic 9: Universal OpenAPI Schema Coverage - Brownfield Enhancement

**Epic ID:** Epic 9
**Epic Type:** Brownfield Enhancement
**Priority:** P0 CRITICAL - Blocks production deployment
**Status:** ✅ Ready for Story Creation
**Created:** 2025-10-09
**Target Release:** v0.2.0

---

## 📋 Epic Goal

Ensure the OpenAPI-to-MCP Generator correctly handles **all possible OpenAPI 3.0 schema constructs** without data loss or type degradation, transforming it from a 77% accuracy tool to a production-ready universal generator with ≥95% schema fidelity.

---

## 📊 Epic Overview

### Current State (Epic 8 Validation Results)

Epic 8 comprehensive validation of the generated Ozon Performance API MCP server revealed **critical universal coverage gaps**:

| Problem | Severity | Impact | Affected Methods |
|---------|----------|--------|------------------|
| Request Body Schema Loss | P0 CRITICAL | 37% methods lose structure | 15/40 endpoints |
| Array Items Missing | P1 MEDIUM | 50% methods lack array validation | 20/40 endpoints |
| CSV Response Handling | P1 MEDIUM | 7% methods break CSV formatting | 3/40 endpoints |
| Integer Type Mapping | P2 LOW | 62% methods use `number` vs `integer` | 25/40 endpoints |
| Missing Descriptions | P2 LOW | 90% methods lack parameter docs | 36/40 endpoints |

**Overall Accuracy:** 77% ⚠️ (not production-ready)

### Target State

- **P0:** 100% of complex request body schemas fully expanded (0% data loss)
- **P1:** 100% of array parameters include `items` type specification
- **P1:** 100% of CSV responses return as raw strings (no JSON wrapper)
- **P2:** 100% of integer types preserved as `integer` (not `number`)
- **P2:** ≥95% of parameters include descriptions from OpenAPI schema
- **Overall:** ≥95% accuracy on re-validation (up from 77%)

---

## 🔧 Existing System Context

### Technology Stack

- **Language:** TypeScript 5.3.3 (strict mode)
- **Runtime:** Node.js ≥18.0.0
- **Package Manager:** pnpm 8.15.1 workspaces
- **Module System:** ESM (ECMAScript Modules)
- **Testing:** Vitest 1.2.0
- **Type Coverage:** ≥95% (CI enforced)

### Architecture

```
OpenAPI Spec → Parser → Generator → MCP Server
                 ↓         ↓
               $refs    Types
             Resolved   Tools
                       Client
```

### Integration Points

1. **Parser Package** (`packages/parser`)
   - Exports: `OperationMetadata`, `ParameterMetadata`, `SchemaMetadata`
   - Status: **Read-only** - No changes needed
   - Data flow: Provides full OpenAPI schemas to generator

2. **Generator Package** (`packages/generator`)
   - **Files to Modify:**
     - `src/tool-generator.ts` - Stories 9.1, 9.2, 9.4, 9.5
     - `src/parameter-mapper.ts` - Story 9.2 (validation)
     - `src/response-processor.ts` - Story 9.3
   - Data flow: Transforms OpenAPI operations → MCP tool definitions

3. **Generated MCP Servers**
   - Impact: Generated code changes, runtime behavior validated
   - Backward compatibility: Existing servers must still work

---

## 🎯 Enhancement Details

### What's Being Added/Changed

Epic 8 validation revealed that the generator doesn't handle **fundamental OpenAPI constructs** that are used across **any** API specification. These are not edge cases—they are universal patterns.

#### Critical Insight

The generator currently:
- ❌ Loses request body structure for 37% of methods
- ❌ Loses array type information for 50% of methods
- ❌ Breaks CSV formatting for 7% of methods
- ❌ Degrades type strictness for 62% of methods
- ❌ Loses documentation for 90% of methods

**Root Cause:** Generator doesn't fully expand OpenAPI schemas—it creates simplified JSON Schema that loses critical information.

### How It Integrates

```
┌─────────────────────────────────────────────────────────────┐
│ Parser Package (No Changes)                                  │
│ ✅ Provides: operation.requestBody.content.schema            │
│ ✅ Provides: param.schema.type, param.schema.items           │
│ ✅ Provides: response.content['text/csv']                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Generator Package (3 Files Modified)                         │
│                                                              │
│ tool-generator.ts (Stories 9.1, 9.2, 9.4, 9.5)              │
│ ├─ generateInputSchema() → Story 9.1 (P0)                   │
│ ├─ parameterToJsonSchemaProperty() → Story 9.2 (P1)         │
│ ├─ mapTypeToJsonSchema() → Story 9.4 (P2)                   │
│ └─ parameterToJsonSchemaProperty() → Story 9.5 (P2)         │
│                                                              │
│ response-processor.ts (Story 9.3)                            │
│ └─ generateMCPFormatting() → Story 9.3 (P1)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Generated MCP Server (Validated)                             │
│ ✅ Full request body schemas                                 │
│ ✅ Array items type validation                               │
│ ✅ CSV response preservation                                 │
│ ✅ Integer type strictness                                   │
│ ✅ Parameter documentation                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Stories

### Story 9.1 (P0 - CRITICAL): Request Body Schema Expansion

**📄 Story Document:** [`docs/stories/story-9.1-request-body-schema-expansion.md`](../../stories/story-9.1-request-body-schema-expansion.md)

**Priority:** P0 - CRITICAL
**Complexity:** HIGH
**Estimated Effort:** 2-3 days
**Files:** `packages/generator/src/tool-generator.ts`

#### Description

Implement full $ref schema resolution and expansion for `requestBody` in tool generation. Currently, complex request bodies become `{ body: object }` losing 9+ properties, required fields, enums, and type safety.

#### Current Behavior (BROKEN)

**OpenAPI Spec:**
```json
{
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/CreateCampaignRequest"
        }
      }
    }
  }
}
```

**Component Schema:**
```json
{
  "CreateCampaignRequest": {
    "type": "object",
    "required": ["placement"],
    "properties": {
      "placement": { "type": "string", "enum": ["PDP", "SEARCH"] },
      "dailyBudget": { "type": "string", "format": "uint64" },
      "title": { "type": "string" },
      // ... 6 more properties
    }
  }
}
```

**Generated (WRONG):**
```json
{
  "body": {
    "type": "object",
    "description": "Request body"
  }
}
```

❌ **Lost:** 9 properties, required field, enum constraint, type validation

#### Target Behavior (CORRECT)

**Generated (CORRECT):**
```json
{
  "body": {
    "type": "object",
    "required": ["placement"],
    "properties": {
      "placement": {
        "type": "string",
        "enum": ["PDP", "SEARCH"],
        "description": "Advertising placement"
      },
      "dailyBudget": {
        "type": "string",
        "format": "uint64",
        "description": "Daily budget in kopeks"
      },
      "title": { "type": "string" },
      // ... 6 more properties with full schemas
    }
  }
}
```

#### Technical Approach

1. **Detect $ref in requestBody:**
   ```typescript
   if (operation.requestBody?.content?.['application/json']?.schema?.$ref) {
     // Resolve reference via parser
   }
   ```

2. **Resolve $ref to full schema:**
   ```typescript
   const resolvedSchema = resolveSchemaRef(
     operation.requestBody.content['application/json'].schema.$ref,
     openApiDocument
   );
   ```

3. **Expand schema recursively:**
   ```typescript
   function expandSchema(schema: SchemaObject): JSONSchemaProperty {
     if (schema.$ref) {
       return expandSchema(resolveRef(schema.$ref));
     }

     const expanded: JSONSchemaProperty = { type: schema.type };

     if (schema.properties) {
       expanded.properties = {};
       for (const [key, value] of Object.entries(schema.properties)) {
         expanded.properties[key] = expandSchema(value);
       }
     }

     if (schema.required) {
       expanded.required = schema.required;
     }

     // Handle enum, format, description, etc.

     return expanded;
   }
   ```

4. **Handle nested $refs:**
   - Schema → properties → $ref → schema
   - Circular reference detection (visited set)
   - Max depth limit (10 levels)

#### Acceptance Criteria

- [ ] CreateProductCampaignCPCV2 method (9 properties) fully expands
- [ ] All 15 affected methods (37%) generate complete schemas
- [ ] Required fields marked in inputSchema.body.required
- [ ] Enum constraints preserved in properties
- [ ] No `body: object` generic types remain in generated tools
- [ ] Nested objects expanded (e.g., properties.address.properties.street)
- [ ] Circular references handled without infinite loops
- [ ] Type coverage remains ≥95%

#### Test Cases

1. Simple request body (no $ref, inline schema)
2. Complex request body with $ref resolution
3. Nested properties with multiple $ref levels
4. Request body with required fields
5. Request body with enum constraints
6. Circular reference detection
7. Missing schema (graceful fallback)

---

### Story 9.2 (P1 - HIGH): Array Items Type Specification

**📄 Story Document:** [`docs/stories/story-9.2-array-items-type-specification.md`](../../stories/story-9.2-array-items-type-specification.md)

**Priority:** P1 - HIGH
**Complexity:** LOW
**Estimated Effort:** 0.5 day
**Files:** `packages/generator/src/tool-generator.ts`

#### Description

Ensure all array parameters include `items` property with type specification. Currently, array parameters lose element type information (`{ type: 'array' }` without `items`).

#### Current Behavior (BROKEN)

**OpenAPI Spec:**
```json
{
  "name": "campaignIds",
  "in": "query",
  "schema": {
    "type": "array",
    "items": {
      "type": "string",
      "format": "uint64"
    }
  }
}
```

**Generated (WRONG):**
```json
{
  "campaignIds": {
    "type": "array"
  }
}
```

❌ **Lost:** items type, format validation

#### Target Behavior (CORRECT)

**Generated (CORRECT):**
```json
{
  "campaignIds": {
    "type": "array",
    "items": {
      "type": "string",
      "format": "uint64"
    }
  }
}
```

#### Technical Approach

Modify `parameterToJsonSchemaProperty()` in `tool-generator.ts`:

```typescript
function parameterToJsonSchemaProperty(param: ParameterMetadata): JSONSchemaProperty {
  const schema = param.schema || {};
  const schemaType = typeof schema.type === 'string' ? schema.type : 'string';

  const property: JSONSchemaProperty = {
    type: mapTypeToJsonSchema(schemaType),
  };

  // Add description, format, enum, default (existing code)...

  // ✅ NEW: Handle array items
  if (schemaType === 'array' && schema.items) {
    property.items = expandArrayItems(schema.items);
  }

  return property;
}

function expandArrayItems(items: SchemaObject): JSONSchemaProperty {
  // Handle $ref in items
  if (items.$ref) {
    const resolved = resolveSchemaRef(items.$ref);
    return expandArrayItems(resolved);
  }

  const itemSchema: JSONSchemaProperty = {
    type: items.type || 'string',
  };

  if (items.format) itemSchema.format = items.format;
  if (items.enum) itemSchema.enum = items.enum;
  if (items.description) itemSchema.description = items.description;

  // Handle nested arrays
  if (items.type === 'array' && items.items) {
    itemSchema.items = expandArrayItems(items.items);
  }

  return itemSchema;
}
```

#### Acceptance Criteria

- [ ] `campaignIds` (ListCampaigns) includes `items: { type: 'string', format: 'uint64' }`
- [ ] All 20 affected methods (50%) include array items specification
- [ ] Nested arrays handled correctly (array of arrays)
- [ ] Items with $refs resolved to full schema
- [ ] Items with enums preserved
- [ ] Type coverage remains ≥95%

#### Test Cases

1. Simple array with primitive items (string, number, boolean)
2. Array with format (e.g., int64, uuid)
3. Array with enum items
4. Nested arrays (array of arrays)
5. Array with object items (items.$ref)
6. Missing items (graceful fallback)

---

### Story 9.3 (P1 - HIGH): CSV Response Handling

**📄 Story Document:** [`docs/stories/story-9.3-csv-response-handling.md`](../../stories/story-9.3-csv-response-handling.md)

**Priority:** P1 - HIGH
**Complexity:** LOW
**Estimated Effort:** 0.5 day
**Files:** `packages/generator/src/response-processor.ts`

#### Description

Fix response handling to preserve CSV formatting for `text/csv` content types. Currently, CSV responses are wrapped in JSON.stringify, breaking formatting.

#### Current Behavior (BROKEN)

**OpenAPI Response:**
```json
{
  "200": {
    "description": "Statistics report",
    "content": {
      "text/csv": {
        "schema": { "type": "string" }
      }
    }
  }
}
```

**Generated Code (WRONG):**
```typescript
return {
  content: [
    {
      type: 'text',
      text: JSON.stringify(response, null, 2)  // ❌ Wraps CSV in JSON
    }
  ]
};
```

**Result:**
```
"campaign_id,impressions,clicks\n12345,1000,50\n67890,2000,100"
```
❌ CSV wrapped in JSON string with escaped newlines

#### Target Behavior (CORRECT)

**Generated Code (CORRECT):**
```typescript
// Detect CSV content type
const isCSV = response.headers?.['content-type']?.includes('text/csv');

return {
  content: [
    {
      type: 'text',
      text: isCSV ? response.data : JSON.stringify(response, null, 2)
    }
  ]
};
```

**Result:**
```
campaign_id,impressions,clicks
12345,1000,50
67890,2000,100
```
✅ Raw CSV preserved

#### Technical Approach

Modify `generateMCPFormatting()` in `response-processor.ts`:

```typescript
function generateMCPFormatting(operation: OperationMetadata): string {
  const hasCSVResponse = checkCSVResponse(operation);

  if (hasCSVResponse) {
    return `      // Format CSV response for MCP protocol (preserve raw text)
      const isCSV = typeof response === 'string' ||
                    (response.headers?.['content-type']?.includes('text/csv'));

      return {
        content: [
          {
            type: 'text',
            text: isCSV ? String(response.data || response) : JSON.stringify(truncatedData, null, 2)
          }
        ]
      };`;
  }

  // Default JSON formatting (existing code)
  return `      // Format response for MCP protocol
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(truncatedData, null, 2)
          }
        ]
      };`;
}

function checkCSVResponse(operation: OperationMetadata): boolean {
  if (!operation.responses) return false;

  for (const response of operation.responses) {
    if (response.content?.['text/csv']) {
      return true;
    }
  }

  return false;
}
```

#### Acceptance Criteria

- [ ] DownloadStatistics (CSV) returns raw CSV string
- [ ] All 3 affected methods (7%) preserve CSV formatting
- [ ] JSON responses unchanged (backward compatibility)
- [ ] MCP protocol compliance maintained
- [ ] Other text formats (text/plain, text/html) also preserved
- [ ] Type coverage remains ≥95%

#### Test Cases

1. CSV response (text/csv content-type)
2. JSON response (application/json) - unchanged
3. Plain text response (text/plain)
4. HTML response (text/html)
5. Mixed responses (200: JSON, 400: text/plain)
6. Missing content-type header (fallback to JSON)

---

### Story 9.4 (P2 - MEDIUM): Integer Type Preservation

**📄 Story Document:** [`docs/stories/story-9.4-integer-type-preservation.md`](../../stories/story-9.4-integer-type-preservation.md)

**Priority:** P2 - MEDIUM
**Complexity:** TRIVIAL
**Estimated Effort:** 0.25 day
**Files:** `packages/generator/src/tool-generator.ts`

#### Description

Preserve `integer` type from OpenAPI schemas instead of converting to `number`. While runtime compatible (Number() handles both), JSON Schema should match OpenAPI for strict validation.

#### Current Behavior

**OpenAPI Spec:**
```json
{
  "name": "campaignId",
  "schema": {
    "type": "integer",
    "format": "int64"
  }
}
```

**Generated (WRONG):**
```json
{
  "campaignId": {
    "type": "number",
    "format": "int64"
  }
}
```

#### Target Behavior (CORRECT)

**Generated (CORRECT):**
```json
{
  "campaignId": {
    "type": "integer",
    "format": "int64"
  }
}
```

#### Technical Approach

Modify `mapTypeToJsonSchema()` in `tool-generator.ts`:

```typescript
function mapTypeToJsonSchema(openApiType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',  // ✅ Changed from 'number' to 'integer'
    boolean: 'boolean',
    array: 'array',
    object: 'object',
  };
  return typeMap[openApiType] || 'string';
}
```

**Note:** TypeScript interfaces will still use `number` type (TypeScript has no integer type).

#### Acceptance Criteria

- [ ] `campaignId` maps to `{ type: 'integer', format: 'int64' }`
- [ ] All 25 affected methods (62%) preserve integer types
- [ ] TypeScript interfaces still use `number` type (TS limitation)
- [ ] Runtime behavior unchanged (Number() coercion works)
- [ ] Type coverage remains ≥95%

#### Test Cases

1. Integer with int32 format
2. Integer with int64 format
3. Integer without format
4. Number type (unchanged)
5. Mixed integer and number parameters

---

### Story 9.5 (P2 - MEDIUM): Parameter Description Propagation

**📄 Story Document:** [`docs/stories/story-9.5-parameter-description-propagation.md`](../../stories/story-9.5-parameter-description-propagation.md)

**Priority:** P2 - MEDIUM
**Complexity:** TRIVIAL
**Estimated Effort:** 0.25 day
**Files:** `packages/generator/src/tool-generator.ts`

#### Description

Copy `description` fields from OpenAPI schema to generated parameter schemas for better developer experience and MCP client auto-completion.

#### Current Behavior

**OpenAPI Spec:**
```json
{
  "name": "campaignId",
  "in": "path",
  "required": true,
  "schema": {
    "type": "integer",
    "format": "int64",
    "description": "Идентификатор кампании"
  }
}
```

**Generated (MISSING DESCRIPTION):**
```json
{
  "campaignId": {
    "type": "integer",
    "format": "int64"
  }
}
```

#### Target Behavior (CORRECT)

**Generated (CORRECT):**
```json
{
  "campaignId": {
    "type": "integer",
    "format": "int64",
    "description": "Идентификатор кампании"
  }
}
```

#### Technical Approach

Modify `parameterToJsonSchemaProperty()` in `tool-generator.ts`:

```typescript
function parameterToJsonSchemaProperty(param: ParameterMetadata): JSONSchemaProperty {
  const schema = param.schema || {};
  const schemaType = typeof schema.type === 'string' ? schema.type : 'string';

  const property: JSONSchemaProperty = {
    type: mapTypeToJsonSchema(schemaType),
  };

  // ✅ IMPROVED: Add description with fallback
  if (param.description) {
    property.description = param.description;
  } else if (schema.description) {
    property.description = schema.description;  // ✅ NEW: Fallback to schema description
  }

  // ... rest of code
}
```

#### Acceptance Criteria

- [ ] `campaignId` includes "Идентификатор кампании" description
- [ ] `UUID` includes "Уникальный идентификатор запроса" description
- [ ] All 36 affected methods (90%) include available descriptions
- [ ] Missing descriptions don't cause errors (graceful handling)
- [ ] Priority: param.description > schema.description
- [ ] Type coverage remains ≥95%

#### Test Cases

1. Description at parameter level (param.description)
2. Description at schema level (param.schema.description)
3. Both descriptions present (param.description takes priority)
4. Missing descriptions (no error)
5. Empty string description (ignored)

---

## ✅ Compatibility Requirements

### API Compatibility
- [x] **Existing Parser APIs remain unchanged** - Parser package is read-only dependency
- [x] **Database schema changes:** N/A (no database)
- [x] **UI changes follow existing patterns:** N/A (CLI tool only)
- [x] **Performance impact is minimal:** <5% generation time increase (schema expansion overhead)

### Generated Code Compatibility
- [x] **Backward compatibility:** Existing generated MCP servers continue to work
- [x] **TypeScript compilation:** 100% success rate maintained
- [x] **Type coverage:** ≥95% maintained
- [x] **All existing tests pass:** No regressions allowed

### Integration Compatibility
- [x] **Parser → Generator interface:** Unchanged (read-only)
- [x] **Generator → MCP Server output:** Enhanced (backward compatible)
- [x] **MCP SDK compatibility:** No changes to MCP protocol usage

---

## ⚠️ Risk Mitigation

### Primary Risk
**Breaking existing generated MCP servers or introducing type safety regressions**

### Mitigation Strategies

1. **Comprehensive Test Suite**
   - Add tests for all 5 OpenAPI constructs BEFORE implementation
   - Test matrix: Simple/Complex/Nested/Missing scenarios
   - Regression test suite: 40 Ozon API endpoints
   - Real-world validation: GitHub API, Stripe API, Petstore

2. **Incremental Rollout**
   - Implement in priority order: P0 → P1 → P2
   - Each story isolated to 1-2 files max
   - Story gating: Must pass tests before next story starts

3. **Type Coverage Enforcement**
   - CI enforces ≥95% type coverage
   - Pre-commit hooks run TypeScript compilation
   - ESLint enforces no `any` types

4. **Code Review Quality Gates**
   - All PRs require passing CI checks
   - Manual code review by architect
   - Integration test results included in PR

5. **Real-World Validation**
   - Re-generate Ozon API MCP server after each story
   - Validate all 40 endpoints compile and execute
   - Compare before/after metrics (77% → ≥95%)

### Rollback Plan

1. **Story-Level Rollback**
   - Each story has isolated changes (1-2 files)
   - Git revert individual commits if issues arise
   - No cascading dependencies between stories

2. **Epic-Level Rollback**
   - If critical bug found after merge:
     1. Revert entire epic branch
     2. Add comprehensive test case for bug
     3. Re-implement with test-driven approach

3. **Validation-Driven Rollback**
   - If re-validation shows <90% accuracy:
     1. Identify failing story via bisect
     2. Revert that story only
     3. Fix and re-validate

---

## 📊 Definition of Done

### Story Completion Criteria (All 5 Stories)
- [ ] All acceptance criteria met for each story
- [ ] Unit tests added with ≥80% coverage
- [ ] Integration tests pass (40 Ozon API endpoints)
- [ ] Type coverage ≥95% maintained
- [ ] TypeScript compilation 100% success
- [ ] ESLint passes with 0 errors
- [ ] No `any` types introduced

### Epic Completion Criteria
- [ ] All 5 stories completed and merged
- [ ] Regression testing passes (existing tests + new tests)
- [ ] Re-validation report generated
- [ ] Overall accuracy ≥95% (up from 77%)
- [ ] Documentation updated:
  - [ ] CHANGELOG.md
  - [ ] docs/architecture/architecture.md (if needed)
  - [ ] Epic completion summary
- [ ] Real-world validation with 3+ OpenAPI specs:
  - [ ] Ozon Performance API (40 endpoints)
  - [ ] GitHub API (subset)
  - [ ] Stripe API (subset)

### Quality Gates (Must Pass)
- [ ] CI pipeline green (all checks pass)
- [ ] Type coverage report shows ≥95%
- [ ] Test coverage report shows ≥80% lines
- [ ] No regressions in existing functionality
- [ ] Performance benchmark: Generation time <30s for 260KB specs

---

## 📈 Success Metrics

### Quantitative Metrics

| Metric | Before (Epic 8) | Target (Epic 9) | Measurement |
|--------|-----------------|-----------------|-------------|
| Request Body Schema Loss | 37% (15/40) | 0% (0/40) | Re-validation report |
| Array Items Missing | 50% (20/40) | 0% (0/40) | Re-validation report |
| CSV Response Broken | 7% (3/40) | 0% (0/40) | Re-validation report |
| Integer Type Degradation | 62% (25/40) | 0% (0/40) | Re-validation report |
| Missing Descriptions | 90% (36/40) | ≤10% (≤4/40) | Re-validation report |
| **Overall Accuracy** | **77%** | **≥95%** | Re-validation report |

### Qualitative Metrics
- Production readiness: ⚠️ Not ready → ✅ Ready
- Developer experience: Poor (no auto-complete) → Excellent (full schema hints)
- Type safety: Low (generic objects) → High (full validation)
- API coverage: Partial (Ozon-specific) → Universal (any OpenAPI 3.0)

---

## 🔗 Related Documents

- **Epic 8 Validation:** `docs/epics/epic8/` - Comprehensive analysis and findings
- **Scope Validation:** `docs/epics/epic9/scope-validation.md` - Code-level validation
- **Architecture:** `docs/architecture/architecture.md` - System design
- **Coding Standards:** `docs/architecture/coding-standards.md` - TypeScript standards
- **Tech Stack:** `docs/architecture/tech-stack.md` - Technology decisions
- **Testing Guide:** `docs/testing.md` - Test strategy and standards

---

## 📅 Timeline

**Total Estimated Effort:** 3.5-4.5 days (development) + 1-2 days (testing/validation) = **5-6.5 days**

**Story Breakdown:**
- Story 9.1 (P0): 2-3 days (COMPLEX)
- Story 9.2 (P1): 0.5 day (SIMPLE)
- Story 9.3 (P1): 0.5 day (SIMPLE)
- Story 9.4 (P2): 0.25 day (TRIVIAL)
- Story 9.5 (P2): 0.25 day (TRIVIAL)

**Recommended Execution Order:**
1. Week 1: Story 9.1 (P0) - Request Body Schema Expansion
2. Week 2: Stories 9.2 + 9.3 (P1) - Array Items + CSV Response (parallel)
3. Week 2: Stories 9.4 + 9.5 (P2) - Integer Type + Descriptions (parallel)
4. Week 2: Epic validation, re-testing, documentation

---

## 👥 Story Manager Handoff

**Handoff Instructions:**

"Please develop detailed user stories for this brownfield epic. Key considerations:

### Project Context
- This is an enhancement to an existing **universal OpenAPI-to-MCP generator**
- Technology: TypeScript 5.3.3, Node.js ≥18, pnpm workspaces, Vitest, ESM modules
- Type coverage: ≥95% (CI enforced)
- All code follows strict coding standards (see `docs/architecture/coding-standards.md`)

### Integration Points
1. **Parser package** (read-only dependency)
   - No changes to parser
   - Provides: `OperationMetadata`, `ParameterMetadata`, `SchemaMetadata`
   - Data includes: Full OpenAPI schemas with $refs, types, descriptions

2. **Generator package** (modify 3 files)
   - `src/tool-generator.ts` - Stories 9.1, 9.2, 9.4, 9.5
   - `src/parameter-mapper.ts` - Story 9.2 (validation)
   - `src/response-processor.ts` - Story 9.3

3. **Generated MCP servers** (validate backward compatibility)
   - Execute function code must compile and run
   - Existing servers must continue working

### Critical Patterns to Follow
1. **Error Handling:** BaseError → ParserError/ValidationError/GeneratorError
2. **Testing:** AAA pattern (Arrange-Act-Assert) with Vitest
3. **Type Safety:** No `any` types, use `unknown` with type guards
4. **Module System:** ESM with absolute paths, `.js` extensions in imports
5. **Code Quality:** ESLint + Prettier, pre-commit hooks

### Compatibility Requirements
- **MUST:** Existing generated MCP servers continue to work
- **MUST:** Parser package exports unchanged (read-only)
- **MUST:** Type coverage ≥95% maintained
- **MUST:** All existing tests pass (no regressions)

### Priority Order
1. **P0 Story 9.1** - Request Body Schema Expansion (CRITICAL)
2. **P1 Stories 9.2, 9.3** - Array Items + CSV Response (HIGH)
3. **P2 Stories 9.4, 9.5** - Integer Type + Descriptions (MEDIUM)

### Each Story Must Include
1. **Validation:** Regression test on 40 Ozon API endpoints
2. **Test Cases:** Unit tests covering new OpenAPI construct handling
3. **Type Coverage:** Verification via `tsc --noEmit` and `type-coverage`
4. **Integration Test:** Real-world OpenAPI spec (GitHub/Stripe/Petstore)

### Epic Goal
Transform the generator from **77% accuracy to ≥95% accuracy** by handling all fundamental OpenAPI 3.0 schema constructs without data loss or type degradation.

**Deliver:** Production-ready universal generator that handles **any** OpenAPI 3.0 specification."

---

## 📝 Notes

### Why This Epic Is Brownfield Enhancement (Despite 5 Stories)

While this epic exceeds the typical 1-3 story recommendation for brownfield enhancements, it qualifies because:

1. **Isolated Scope:** All changes within single package (generator)
2. **Low Architectural Risk:** No system design changes, only implementation completeness
3. **Clear Integration:** Parser unchanged, MCP servers backward compatible
4. **Manageable Complexity:** 3 files modified across 5 stories
5. **Well-Defined Success:** Quantitative metrics (77% → ≥95%)

**Alternative considered:** Full brownfield PRD/Architecture process - rejected as overkill for generator bug fixes.

### Code Validation Findings

See `docs/epics/epic9/scope-validation.md` for detailed code-level validation:
- ✅ All 5 issues confirmed in codebase
- ✅ Exact line references documented
- ✅ Root causes identified
- ✅ Implementation paths validated
- ✅ 100% confidence in epic scope

---

**Epic Author:** John (PM Agent)
**Epic Date:** 2025-10-09
**Epic Status:** ✅ Ready for Story Creation
**Next Step:** Story Manager to create detailed user stories
