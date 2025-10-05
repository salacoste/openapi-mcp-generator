# Ozon Performance SDK Documentation

Comprehensive documentation for the Ozon Performance SDK project.

USE CONTEXT7 MCP SERVER for any code related operations. Always check the best practice when you either implement or evaluate code related activity.

---

## 📚 Documentation Index

### Core Documentation

- **[Project Brief](./brief.md)** - Project overview, goals, and requirements
- **[Product Requirements](./prd/)** - Comprehensive PRD with functional/non-functional requirements (sharded)
- **[Epic Details](./prd/6-epic-details.md)** - Detailed user stories and acceptance criteria
- **[API Reference](./api-reference.md)** - API methods and interfaces
- **[Examples](./examples.md)** - Usage examples and patterns
- **[Testing](./testing.md)** - Testing strategies and test cases

### Architecture Documentation

**Comprehensive Structure:** [architecture/](./architecture/)

The architecture documentation is organized in a dedicated directory with cross-referenced documents:

- **[Architecture Index](./architecture/README.md)** - Navigation hub for all architecture docs
- **[Main Architecture](./architecture/architecture.md)** - Complete system architecture (706 lines)
- **[Data Models](./architecture/architecture-data-models.md)** - Data transformation specifications
- **[Workflows](./architecture/architecture-workflows.md)** - Sequence diagrams and interaction patterns
- **[Validation Report](./architecture/architecture-validation.md)** - Quality assessment (92% pass rate)

**Status:** ✅ Ready for Development | **AI Readiness:** 95/100 (Excellent)

### OpenAPI Research

**New Modular Structure:** [openapi/](./openapi/)

The OpenAPI research documentation has been restructured into focused, context-efficient documents:

- **[OpenAPI Index](./openapi/README.md)** - Navigation hub for all OpenAPI docs
- **[Root Level](./openapi/01-root-level.md)** - OpenAPI document structure
- **[Info Object](./openapi/02-info-object.md)** - Metadata and API information
- **[Server Object](./openapi/03-server-object.md)** - Server configuration
- **[Components](./openapi/04-components-object.md)** - Schemas and type generation
- **[Paths & Operations](./openapi/05-paths-operations.md)** - Endpoint parsing
- **[Security](./openapi/06-security.md)** - Authentication and authorization
- **[Tags](./openapi/07-tags-organization.md)** - Organization and smart filtering
- **[Implementation Summary](./openapi/implementation-summary.md)** - MVP scope and phases

**Note:** Original monolithic `openapi-research.md` has been deleted (October 3, 2024) - content fully migrated to modular structure above.

---

## 🎯 Quick Navigation

### "I want to understand the project"
→ Start with [Project Brief](./brief.md) → [Architecture Index](./architecture/README.md)

### "I'm implementing OpenAPI parsing"
→ See [OpenAPI Index](./openapi/README.md) → Choose specific topic

### "I need to generate TypeScript types"
→ Read [Components Object](./openapi/04-components-object.md)

### "I'm working on MCP tool generation"
→ Check [Paths & Operations](./openapi/05-paths-operations.md)

### "I want to see code examples"
→ Browse [Examples](./examples.md) → [API Reference](./api-reference.md)

---

## 📊 Documentation Statistics

| Section | Files | Total Size | Status |
|---------|-------|------------|--------|
| Core Docs | 6 | ~100KB | ✅ Current |
| PRD (sharded) | 9 | ~70KB | ✅ Current |
| Architecture | 5 | ~140KB | ✅ Ready for Dev |
| OpenAPI (sharded) | 12 | ~220KB | ✅ Current |

**Total:** 32 documents (100% modular, optimized for AI context loading)

---

## 🤖 AI Agent Guidelines

### Context Loading Strategy

1. **Project Overview:**
   ```
   Load: brief.md → prd.md → architecture/README.md
   Tokens: ~20K
   ```

2. **Architecture Deep Dive:**
   ```
   Load: architecture/architecture.md → Specific supplement
   Tokens: ~10-15K per document
   ```

3. **OpenAPI Implementation:**
   ```
   Load: openapi/README.md → Specific topic
   Tokens: ~2-4K per topic
   ```

4. **Code Examples:**
   ```
   Load: examples.md → api-reference.md
   Tokens: ~12K
   ```

### Best Practices

- ✅ Load README/index files first for context map
- ✅ Load specific documents based on task
- ✅ Follow cross-references when needed
- ✅ Use sharded directories (prd/, openapi/, architecture/) for efficient loading
- ❌ Avoid loading all documents simultaneously

---

## 🔄 Recent Updates

**October 3, 2024:**
- ✅ Sharded PRD documentation (30KB → 9 files in `prd/`)
- ✅ Deleted legacy `openapi-research.md` (replaced by `openapi/` - 57% more content)
- ✅ Fixed all broken links in OpenAPI documentation
- ✅ Updated documentation structure (100% modular)

**January 3, 2025:**
- ✅ Created comprehensive architecture documentation (5 documents, 140KB)
- ✅ Completed architecture validation (92% pass rate, AI readiness 95/100)
- ✅ Organized architecture docs in dedicated `/docs/architecture/` directory
- ✅ Added architecture navigation index and cross-references

**October 2, 2024:**
- ✅ Restructured OpenAPI documentation (5,050 lines → 12 focused documents)
- ✅ Created navigation index and cross-references
- ✅ Added implementation summary with MVP scope

**See:** [OpenAPI Restructuring Summary](./openapi-restructuring-summary.md)

---

## 📝 Contributing

When adding new documentation:

1. **Determine category** - Core vs OpenAPI-specific
2. **Check size** - Keep documents under 500 lines
3. **Add navigation** - Include cross-references
4. **Update indexes** - This README and relevant section indexes
5. **Follow templates** - Use consistent structure

---

## 🚀 Next Steps

### Immediate Actions
- [ ] Create initial project structure (monorepo with pnpm workspaces)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Begin Epic 1 implementation (Foundation & Core CLI Infrastructure)

### Documentation
- [ ] Create getting-started.md guide
- [ ] Generate API reference docs (TypeDoc)
- [ ] Create error code documentation

### Future Enhancements
- [ ] Add rate limiting to generated servers (post-MVP)
- [ ] Implement formal performance SLO tracking
- [ ] Add OpenAPI 3.1 support

---

**Project:** OpenAPI-to-MCP Generator
**Documentation Version:** 3.1
**Last Updated:** October 3, 2024
