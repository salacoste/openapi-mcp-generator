# 8. Next Steps

## 8.1 UX Expert Prompt

**Task:** Design the command-line interface experience and generated output UX for OpenAPI-to-MCP Generator.

**Context:**
You have the complete PRD (see [index](./index.md)) and Project Brief (`docs/brief.md`) for the OpenAPI-to-MCP Generator - a CLI tool that transforms OpenAPI 3.0 documents into MCP servers.

**Your Responsibilities:**

1. **CLI Interaction Design:**
   - Design the command structure, flag naming, and argument patterns
   - Create error message templates (what failed → why → how to fix)
   - Design progress indicators and status feedback
   - Plan help text, examples, and onboarding guidance

2. **Generated Output UX:**
   - Design the structure and content of generated `README.md` files
   - Create templates for `.env.example` with clear credential guidance
   - Design inline code comments explaining key sections
   - Plan the generated project structure for clarity

3. **User Flows:**
   - Map the complete user journey: discovery → installation → first generation → success
   - Design error recovery flows (validation failures, network errors, auth issues)
   - Create onboarding experience for first-time users
   - Plan iterative workflows (regeneration, updates)

4. **Accessibility & Inclusivity:**
   - Design for terminal readers and screen readers
   - Plan color scheme with `--no-color` fallback
   - Ensure international audience support (clear English, avoid idioms)

**Key Constraints:**
- CLI-only (no GUI in MVP)
- Target: ≥70% self-service onboarding (users succeed without support)
- Performance: Feedback must feel responsive (<100ms for acknowledgments)
- Error messages are the primary UX differentiator

**Deliverables:**
- CLI command reference with examples
- Error message catalog with templates
- Generated file templates (`README.md`, `.env.example`)
- User journey maps for primary flows
- Accessibility guidelines for terminal UI

**Start by reviewing `docs/brief.md` and the [PRD index](./index.md), then propose your UX design approach.**

---

## 8.2 Architect Prompt

**Task:** Design the system architecture and implementation plan for OpenAPI-to-MCP Generator.

**Context:**
You have the complete PRD (see [index](./index.md)) and Project Brief (`docs/brief.md`) for the OpenAPI-to-MCP Generator. The PM has defined 8 epics with 72 user stories covering all MVP requirements.

**Your Responsibilities:**

1. **System Architecture:**
   - Design the monorepo structure (`packages/cli`, `parser`, `generator`, `templates`)
   - Define module boundaries and interfaces
   - Plan data flow: OpenAPI → Parser → Generator → MCP Server Files
   - Design the code generation pipeline (templates vs AST manipulation)

2. **Technology Selection:**
   - Evaluate and select template engine (Handlebars vs EJS)
   - Evaluate OpenAPI parsing libraries (`@apidevtools/swagger-parser`)
   - Plan TypeScript code generation strategy (`ts-morph` for complex types)
   - Define testing framework and tooling (Jest/Vitest, ESLint, Prettier)

3. **Technical Specifications:**
   - Design the parser output format (normalized AST)
   - Design the generator template system (boilerplate, types, tools, auth)
   - Plan authentication interceptor architecture
   - Design the tool registry and filtering system (Epic 6)

4. **Implementation Guidance:**
   - Break down Epic 1 stories into tasks
   - Identify technical risks and mitigation strategies
   - Plan integration points (MCP SDK, Claude Desktop)
   - Define testing strategy (unit, integration, E2E)

5. **Performance & Scalability:**
   - Design for NFR1-2: <30s for 50 methods, <2min for 300+ methods
   - Plan lazy loading strategy for large APIs (Epic 6)
   - Optimize memory usage (<512MB during generation)

**Key Requirements:**
- TypeScript 5.x, Node.js ≥18.0.0, strict mode
- 100% TypeScript compilation success rate (NFR6)
- Support OpenAPI 3.0 only (MVP scope)
- Generate type-safe, compilable MCP servers
- Test with Ozon Performance API (300+ methods, Bearer auth)

**Key Constraints:**
- Monorepo with npm/pnpm workspaces
- CLI-first distribution (npm registry)
- No hardcoded credentials (environment variables only)
- Support macOS, Linux, Windows (WSL)

**Deliverables:**
- Architecture diagram (system components, data flow)
- Technology selection justification (with trade-offs)
- Module API specifications (parser output, generator input)
- Implementation plan for Epic 1 (with task breakdown)
- Testing strategy and quality gates
- Architecture Decision Records (ADRs) for key choices

**Start by reviewing the [PRD](./index.md) (especially [4. Technical Assumptions](./4-technical-assumptions.md) and [6. Epic Details](./6-epic-details.md)), then propose your architectural approach.**

---

**End of PRD**

---

**Document Information:**

- **Version:** v0.1
- **Status:** ✅ READY FOR ARCHITECTURE PHASE
- **Created:** 2025-01-XX by John (Product Manager)
- **Checklist Validation:** 95% Complete (9/9 categories PASS)
- **Related Documents:**
  - [Project Brief](../brief.md) - Problem statement and business context
  - [Epic List](./5-epic-list.md) - High-level epic and story overview
  - [Epic Details](./6-epic-details.md) - Full user stories with acceptance criteria

