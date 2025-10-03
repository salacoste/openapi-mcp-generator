# Callback Object (Webhooks)

[◀ Back to Index](./README.md) | [◀ Prev: Responses](./09-responses-object.md)

---

## Overview

Callback Object describes **out-of-band callbacks** (webhooks) related to an operation. Used when the API provider initiates requests back to the API consumer.

**Use Cases:**
- Webhooks
- Event notifications
- Async operation completion
- Real-time updates

---

## Specification

### Patterned Fields

| Pattern | Type | Description |
|---------|------|-------------|
| `{expression}` | Path Item Object | Callback request and expected responses (runtime expression) |

**Extension Support:** May contain `x-*` fields

---

## Key Expression (Runtime)

The key is a **runtime expression** evaluated during HTTP request/response to identify the callback URL.

### Expression Syntax

| Expression | Description | Example Value |
|------------|-------------|---------------|
| `$url` | Full request URL | `http://example.org/subscribe/myevent?queryUrl=...` |
| `$method` | HTTP method | `POST` |
| `$request.path.{param}` | Path parameter | `myevent` |
| `$request.query.{param}` | Query parameter | `http://clientdomain.com/stillrunning` |
| `$request.header.{name}` | Request header | `application/json` |
| `$request.body#{pointer}` | Request body field (JSON Pointer) | `http://clientdomain.com/failed` |
| `$response.header.{name}` | Response header | `http://example.org/subscription/1` |

**JSON Pointer:** RFC6901 syntax for accessing nested fields (`#/path/to/field`)

---

## Example Request/Response

### Original Request

```http
POST /subscribe/myevent?queryUrl=http://clientdomain.com/stillrunning HTTP/1.1
Host: example.org
Content-Type: application/json
Content-Length: 187

{
  "failedUrl": "http://clientdomain.com/failed",
  "successUrls": [
    "http://clientdomain.com/fast",
    "http://clientdomain.com/medium",
    "http://clientdomain.com/slow"
  ]
}
```

### Response

```http
201 Created
Location: http://example.org/subscription/1
```

### Expression Evaluation

| Expression | Evaluates To |
|------------|--------------|
| `$url` | `http://example.org/subscribe/myevent?queryUrl=http://clientdomain.com/stillrunning` |
| `$method` | `POST` |
| `$request.path.eventType` | `myevent` |
| `$request.query.queryUrl` | `http://clientdomain.com/stillrunning` |
| `$request.header.content-Type` | `application/json` |
| `$request.body#/failedUrl` | `http://clientdomain.com/failed` |
| `$request.body#/successUrls/2` | `http://clientdomain.com/medium` |
| `$response.header.Location` | `http://example.org/subscription/1` |

---

## Callback Object Examples

### Example 1: Query Parameter URL

Callback URL from query string parameter.

```yaml
callbacks:
  myCallback:
    '{$request.query.queryUrl}':
      post:
        requestBody:
          description: Callback payload
          content:
            'application/json':
              schema:
                $ref: '#/components/schemas/SomePayload'
        responses:
          '200':
            description: callback successfully processed
```

**Flow:**
1. Client subscribes: `POST /subscribe?queryUrl=http://client.com/webhook`
2. Server later calls back: `POST http://client.com/webhook` with payload
3. Client responds: `200 OK`

---

### Example 2: Request Body URL

Callback URL from request body fields.

```yaml
callbacks:
  transactionCallback:
    'http://notificationServer.com?transactionId={$request.body#/id}&email={$request.body#/email}':
      post:
        requestBody:
          description: Callback payload
          content:
            'application/json':
              schema:
                $ref: '#/components/schemas/SomePayload'
        responses:
          '200':
            description: callback successfully processed
```

**Flow:**
1. Client submits: `POST /transaction { "id": "123", "email": "user@example.com" }`
2. Server calls back: `POST http://notificationServer.com?transactionId=123&email=user@example.com`
3. Callback server responds: `200 OK`

---

### Example 3: Webhook Subscription

Complete webhook pattern with multiple callbacks.

```yaml
/webhooks/subscribe:
  post:
    summary: Subscribe to webhook notifications
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              callbackUrl:
                type: string
                format: uri
                description: URL to receive webhook notifications
              events:
                type: array
                items:
                  type: string
                  enum: [order.created, order.updated, order.completed]
    responses:
      '201':
        description: Subscription created
        content:
          application/json:
            schema:
              type: object
              properties:
                subscriptionId:
                  type: string
    callbacks:
      orderEvent:
        '{$request.body#/callbackUrl}':
          post:
            summary: Order event notification
            requestBody:
              required: true
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      event:
                        type: string
                      orderId:
                        type: string
                      timestamp:
                        type: string
                        format: date-time
                      data:
                        type: object
            responses:
              '200':
                description: Webhook received successfully
              '401':
                description: Invalid signature
```

---

## Implementation

### Parser Interface

```typescript
interface CallbackObject {
  [expression: string]: PathItemObject;
}

interface CallbackConfig {
  name: string;
  urlExpression: string;
  method: string;
  requestBody?: RequestBodyObject;
  responses: Map<string, ResponseObject>;
}
```

### Expression Evaluator

```typescript
class RuntimeExpressionEvaluator {
  evaluate(
    expression: string,
    context: {
      request: Request;
      response?: Response;
    }
  ): string {
    // Parse expression type
    if (expression === '$url') {
      return context.request.url;
    }

    if (expression === '$method') {
      return context.request.method;
    }

    // $request.path.{param}
    if (expression.startsWith('$request.path.')) {
      const param = expression.substring('$request.path.'.length);
      return context.request.params[param];
    }

    // $request.query.{param}
    if (expression.startsWith('$request.query.')) {
      const param = expression.substring('$request.query.'.length);
      return context.request.query[param];
    }

    // $request.header.{name}
    if (expression.startsWith('$request.header.')) {
      const header = expression.substring('$request.header.'.length);
      return context.request.headers[header.toLowerCase()];
    }

    // $request.body#{pointer}
    if (expression.startsWith('$request.body#')) {
      const pointer = expression.substring('$request.body#'.length);
      return this.resolveJsonPointer(context.request.body, pointer);
    }

    // $response.header.{name}
    if (expression.startsWith('$response.header.')) {
      if (!context.response) {
        throw new Error('Response not available for expression evaluation');
      }
      const header = expression.substring('$response.header.'.length);
      return context.response.headers[header.toLowerCase()];
    }

    throw new Error(`Unknown expression: ${expression}`);
  }

  private resolveJsonPointer(obj: any, pointer: string): any {
    // JSON Pointer RFC6901 implementation
    const parts = pointer.split('/').filter(p => p);
    let current = obj;

    for (const part of parts) {
      // Unescape special characters
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');

      if (Array.isArray(current)) {
        const index = parseInt(key, 10);
        current = current[index];
      } else {
        current = current[key];
      }

      if (current === undefined) {
        throw new Error(`JSON Pointer not found: ${pointer}`);
      }
    }

    return current;
  }
}
```

### URL Builder

```typescript
class CallbackURLBuilder {
  private evaluator: RuntimeExpressionEvaluator;

  constructor() {
    this.evaluator = new RuntimeExpressionEvaluator();
  }

  buildURL(
    urlTemplate: string,
    context: { request: Request; response?: Response }
  ): string {
    // Find all expressions in template: {$expression}
    const expressionRegex = /\{([^}]+)\}/g;
    let url = urlTemplate;

    const matches = [...urlTemplate.matchAll(expressionRegex)];

    for (const match of matches) {
      const fullMatch = match[0];
      const expression = match[1];

      const value = this.evaluator.evaluate(expression, context);
      url = url.replace(fullMatch, encodeURIComponent(value));
    }

    return url;
  }
}
```

### Callback Handler

```typescript
class CallbackHandler {
  private urlBuilder: CallbackURLBuilder;

  constructor() {
    this.urlBuilder = new CallbackURLBuilder();
  }

  async executeCallback(
    callback: CallbackConfig,
    context: { request: Request; response: Response }
  ): Promise<void> {
    // Build callback URL from expression
    const callbackUrl = this.urlBuilder.buildURL(
      callback.urlExpression,
      context
    );

    // Prepare callback request
    const callbackRequest: Request = {
      method: callback.method,
      url: callbackUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenAPI-Callback/1.0'
      },
      body: this.buildCallbackPayload(callback, context)
    };

    // Execute callback
    try {
      const response = await fetch(callbackUrl, {
        method: callbackRequest.method,
        headers: callbackRequest.headers,
        body: JSON.stringify(callbackRequest.body)
      });

      if (!response.ok) {
        console.error(`Callback failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Callback error:`, error);
    }
  }

  private buildCallbackPayload(
    callback: CallbackConfig,
    context: { request: Request; response: Response }
  ): any {
    // Build payload based on callback.requestBody schema
    // This would use the schema to construct the payload
    return {
      event: context.request.body.event,
      data: context.request.body,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## Real-World Patterns

### Pattern 1: Payment Gateway

```yaml
/payments:
  post:
    summary: Create payment
    requestBody:
      content:
        application/json:
          schema:
            properties:
              amount:
                type: number
              webhookUrl:
                type: string
                format: uri
    callbacks:
      paymentComplete:
        '{$request.body#/webhookUrl}':
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    properties:
                      paymentId:
                        type: string
                      status:
                        type: string
                        enum: [completed, failed]
                      amount:
                        type: number
            responses:
              '200':
                description: Webhook acknowledged
```

### Pattern 2: Async Job Processing

```yaml
/jobs:
  post:
    summary: Start async job
    requestBody:
      content:
        application/json:
          schema:
            properties:
              task:
                type: string
              notificationUrl:
                type: string
    callbacks:
      jobComplete:
        '{$request.body#/notificationUrl}':
          post:
            requestBody:
              content:
                application/json:
                  schema:
                    properties:
                      jobId:
                        type: string
                      status:
                        type: string
                      result:
                        type: object
            responses:
              '200':
                description: Notification received
```

---

## MVP Scope

| Feature | MVP | Post-MVP |
|---------|-----|----------|
| Parse callback objects | ❌ | ✅ |
| Runtime expression evaluation | ❌ | ✅ |
| JSON Pointer resolution | ❌ | ✅ |
| Callback execution | ❌ | ✅ |
| Callback documentation | ⚠️ | ✅ |

**Reasoning:**
- ❌ **Callbacks** - Advanced feature, not in Ozon API
- **Complexity** - Runtime expressions require dynamic evaluation
- **Use case** - Primarily webhooks/async APIs
- **Priority** - Focus on synchronous request/response first

**Post-MVP Implementation:**
- Full expression evaluator
- JSON Pointer support
- Callback execution engine
- Webhook validation
- Signature verification

---

## Documentation Notes

### For MCP Tools

Even though not implemented in MVP, document callbacks in tool descriptions:

```typescript
{
  name: 'subscribeWebhook',
  description: `
    Subscribe to webhook notifications.

    **Callback:** The API will POST to your callbackUrl when events occur.
    Expected callback format:
    - POST {callbackUrl}
    - Body: { "event": string, "data": object }
    - Response: 200 OK to acknowledge
  `,
  inputSchema: {
    type: 'object',
    properties: {
      callbackUrl: {
        type: 'string',
        format: 'uri',
        description: 'URL to receive webhook notifications'
      }
    }
  }
}
```

---

## Test Cases

```typescript
// Test 1: Simple query parameter expression
expression = '{$request.query.webhookUrl}'
context = { request: { query: { webhookUrl: 'http://client.com/hook' } } }
// ✅ Should evaluate to: http://client.com/hook

// Test 2: Body JSON Pointer
expression = '{$request.body#/settings/notificationUrl}'
context = {
  request: {
    body: {
      settings: {
        notificationUrl: 'http://client.com/notify'
      }
    }
  }
}
// ✅ Should evaluate to: http://client.com/notify

// Test 3: Array JSON Pointer
expression = '{$request.body#/urls/1}'
context = {
  request: {
    body: {
      urls: ['http://url1.com', 'http://url2.com', 'http://url3.com']
    }
  }
}
// ✅ Should evaluate to: http://url2.com

// Test 4: Complex URL template
expression = 'http://server.com?id={$request.body#/id}&status={$response.header.Status}'
// ✅ Should build complete URL with substitutions

// Test 5: Invalid JSON Pointer
expression = '{$request.body#/invalid/path}'
// ❌ Should throw error
```

---

## Summary

✅ **Analyzed:** Callback Object, runtime expressions, webhooks
✅ **Validated:** Official OpenAPI examples
✅ **Decided:** Post-MVP (advanced feature)
✅ **Documented:** For future implementation

**Status:** Documented for post-MVP implementation

**Note:** While callbacks are powerful for webhooks and async APIs, they add significant complexity and are not present in the Ozon API. Focus on core synchronous request/response patterns for MVP.

---

## Navigation

- [◀ Back to Index](./README.md)
- [◀ Prev: Responses](./09-responses-object.md)
- [See also: Paths & Operations](./05-paths-operations.md)
- [See also: Request Body](./08-request-body-media-type.md)
