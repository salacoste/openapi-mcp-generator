# Tags & Organization

[◀ Back to Index](./README.md) | [◀ Prev: Security](./06-security.md) | [Next: Implementation Summary ▶](./implementation-summary.md)

---

## Tag Object Specification

Adds metadata to a single tag that is used by the Operation Object. **It is not mandatory to have a Tag Object per tag defined in the Operation Object instances.**

Tags группируют operations для лучшей организации и discovery.

### Fixed Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ REQUIRED | The name of the tag |
| `description` | string | Optional | A short description for the tag (CommonMark syntax MAY be used for rich text representation) |
| `externalDocs` | External Documentation Object | Optional | Additional external documentation for this tag |

**Extension Support:** May contain `x-*` fields

**Important Notes:**
- Tag Objects are optional - operations can reference tags that don't have Tag Objects
- Tag Objects provide metadata and documentation for tags
- Tag names referenced in operations don't require corresponding Tag Objects

### Tag Object Example

**Simple tag:**
```json
{
  "name": "pet",
  "description": "Pets operations"
}
```

```yaml
name: pet
description: Pets operations
```

---

## Ozon API Tags

```json
{
  "tags": [
    {
      "name": "Intro",
      "x-displayName": "Введение",
      "description": "Общая информация об API"
    },
    {
      "name": "Campaign",
      "description": "Управление рекламными кампаниями"
    },
    {
      "name": "Statistics",
      "description": "Получение статистики по кампаниям"
    },
    {
      "name": "Ad",
      "description": "Управление объявлениями"
    },
    {
      "name": "Product",
      "description": "Управление товарами в кампаниях"
    }
  ]
}
```

**Observations:**
- Логическая группировка по доменам
- `x-displayName` для локализации (игнорируем в MVP)
- Описания полезны для AI discovery

---

## Tags in Operations

Operations ссылаются на tags по имени:

```json
{
  "paths": {
    "/api/client/campaign": {
      "get": {
        "tags": ["Campaign"],
        "summary": "Список кампаний",
        "operationId": "ListCampaigns"
      }
    },
    "/api/client/campaign/{campaignId}/objects": {
      "get": {
        "tags": ["Campaign", "Product"],
        "summary": "Объекты кампании",
        "operationId": "GetCampaignObjects"
      }
    }
  }
}
```

**Multiple Tags:** Operation может иметь несколько тегов.

---

## Smart Method Filtering

### MCP Tool for Discovery

```typescript
{
  name: 'listMethods',
  description: 'Discover available API methods by category',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['Campaign', 'Statistics', 'Ad', 'Product'],
        description: 'Filter methods by category'
      },
      search: {
        type: 'string',
        description: 'Search by keyword in method name or description'
      }
    }
  }
}
```

### Implementation

```typescript
interface TaggedTool {
  tool: MCPTool;
  tags: string[];
}

class MethodDiscovery {
  private toolsByTag: Map<string, MCPTool[]>;
  private allTools: TaggedTool[];

  constructor(tools: TaggedTool[]) {
    this.allTools = tools;
    this.toolsByTag = this.groupByTags(tools);
  }

  private groupByTags(tools: TaggedTool[]): Map<string, MCPTool[]> {
    const grouped = new Map();

    for (const { tool, tags } of tools) {
      for (const tag of tags) {
        if (!grouped.has(tag)) {
          grouped.set(tag, []);
        }
        grouped.get(tag).push(tool);
      }
    }

    return grouped;
  }

  listByCategory(category: string): MCPTool[] {
    return this.toolsByTag.get(category) || [];
  }

  search(keyword: string): MCPTool[] {
    const lowerKeyword = keyword.toLowerCase();

    return this.allTools
      .filter(({ tool }) => {
        const inName = tool.name.toLowerCase().includes(lowerKeyword);
        const inDesc = tool.description?.toLowerCase().includes(lowerKeyword);
        return inName || inDesc;
      })
      .map(({ tool }) => tool);
  }

  listCategories(): Array<{ name: string; count: number; description?: string }> {
    return Array.from(this.toolsByTag.entries()).map(([name, tools]) => ({
      name,
      count: tools.length,
      description: this.getTagDescription(name)
    }));
  }

  private getTagDescription(tagName: string): string | undefined {
    // From spec.tags
    return this.tagDescriptions.get(tagName);
  }
}
```

---

## Generated listMethods Handler

```typescript
async function handleListMethods(args: {
  category?: string;
  search?: string;
}): Promise<MCPToolResult> {
  const discovery = new MethodDiscovery(taggedTools);

  // List by category
  if (args.category) {
    const methods = discovery.listByCategory(args.category);
    return {
      content: [
        {
          type: 'text',
          text: formatMethodList(methods, `Category: ${args.category}`)
        }
      ]
    };
  }

  // Search by keyword
  if (args.search) {
    const methods = discovery.search(args.search);
    return {
      content: [
        {
          type: 'text',
          text: formatMethodList(methods, `Search: ${args.search}`)
        }
      ]
    };
  }

  // List all categories
  const categories = discovery.listCategories();
  return {
    content: [
      {
        type: 'text',
        text: formatCategoryList(categories)
      }
    ]
  };
}

function formatMethodList(methods: MCPTool[], title: string): string {
  let output = `## ${title}\n\n`;
  output += `Found ${methods.length} methods:\n\n`;

  for (const method of methods) {
    output += `### ${method.name}\n`;
    output += `${method.description}\n\n`;
  }

  return output;
}

function formatCategoryList(
  categories: Array<{ name: string; count: number; description?: string }>
): string {
  let output = '## Available Categories\n\n';

  for (const cat of categories) {
    output += `### ${cat.name} (${cat.count} methods)\n`;
    if (cat.description) {
      output += `${cat.description}\n`;
    }
    output += '\n';
  }

  output += 'Use `category` parameter to list methods in a category.\n';
  output += 'Use `search` parameter to find methods by keyword.\n';

  return output;
}
```

---

## Example Usage Flow

```typescript
// AI Agent interaction

// 1. Discover categories
await callTool('listMethods', {});
// Returns: Campaign (15), Statistics (8), Ad (10), Product (6)

// 2. List methods in category
await callTool('listMethods', { category: 'Campaign' });
// Returns: listCampaigns, getCampaign, createCampaign, ...

// 3. Search by keyword
await callTool('listMethods', { search: 'statistics' });
// Returns: getStatistics, getCampaignStatistics, ...

// 4. Call specific method
await callTool('listCampaigns', { state: 'RUNNING' });
```

---

## Implementation Priority

### CRITICAL for MVP ✅

Tag-based organization enables:
1. **Method Discovery** - AI can explore API capabilities
2. **Context Reduction** - Filter irrelevant methods
3. **Semantic Grouping** - Logical organization
4. **Better UX** - Easier navigation for users

### Without Tags ❌

- AI overwhelmed with 300+ flat methods
- Poor discoverability
- Inefficient context usage
- Confusing for users

---

## Parser Implementation

```typescript
interface ParsedTag {
  name: string;           // REQUIRED
  description?: string;
  externalDocs?: {
    url: string;
    description?: string;
  };
}

function parseTags(spec: OpenAPISpec): Map<string, ParsedTag> {
  const tags = new Map();

  for (const tag of spec.tags || []) {
    if (!tag.name) {
      console.warn('Tag missing required name field');
      continue;
    }

    tags.set(tag.name, {
      name: tag.name,
      description: tag.description,
      externalDocs: tag.externalDocs
    });
  }

  return tags;
}

function extractOperationTags(operation: OperationObject): string[] {
  return operation.tags || ['Untagged'];
}
```

---

## Summary

✅ **Analyzed:** Tag object specification
✅ **Validated:** Ozon API uses 5 tags for organization
✅ **Decided:** CRITICAL for MVP - smart method filtering
✅ **Implemented:** Discovery system + listMethods tool

**Priority:** #2 (after path parsing)

**Impact:** Transforms 300+ flat methods into organized, discoverable API

---

[◀ Back to Index](./README.md) | [◀ Prev: Security](./06-security.md) | [Next: Implementation Summary ▶](./implementation-summary.md)
