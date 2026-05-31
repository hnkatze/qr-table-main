---
description: >
  Modern TypeScript best practices for frontend projects. Use when writing any TypeScript code,
  defining types, interfaces, or working with type safety. Framework-agnostic patterns.
---

# TypeScript Best Practices

## Core Principles

Write type-safe, maintainable TypeScript. Let the compiler work for you.

## Configuration

### tsconfig.json — Strict Baseline

```json
{
  "compilerOptions": {
    "strict": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- **`strict: true`**: Enables all strict checks (nullChecks, functionTypes, etc.)
- **`isolatedModules: true`**: Required for modern bundlers (Vite, esbuild, SWC)
- **`noUncheckedIndexedAccess`**: Array/object index returns `T | undefined`
- **`exactOptionalPropertyTypes`**: `prop?: string` means `string | undefined`, not `string | undefined | missing`

## Type Inference — Let It Work

```typescript
// ✅ Let inference do its job
const count = 0;                  // number
const name = 'John';              // string
const items = [1, 2, 3];         // number[]
const user = { id: 1, name: 'John' }; // { id: number; name: string }

// ✅ Be explicit when inference can't help
function getUser(id: string): Promise<User | null> { ... }
const state: AsyncState<User[]> = { status: 'loading' };

// ❌ Don't annotate the obvious
const count: number = 0;          // redundant
const name: string = 'John';      // redundant
```

## Never Use `any`

```typescript
// ❌ any — defeats all type safety
function process(data: any) { return data.something; }

// ✅ unknown + type guard
function process(data: unknown) {
  if (isUser(data)) return data.name;
  throw new Error('Invalid data');
}

// ✅ Custom type guard
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data && 'name' in data;
}
```

## `as const` — Create Types from Values

```typescript
// Create union types from arrays
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

// Create types from objects
const ROUTES = {
  home: '/',
  users: '/users',
  settings: '/settings',
} as const;
type Route = (typeof ROUTES)[keyof typeof ROUTES]; // '/' | '/users' | '/settings'

// Narrow object literals
const config = {
  maxRetries: 3,
  timeout: 5000,
} as const;
// config.maxRetries is 3, not number
```

## `satisfies` — Validate Without Widening

```typescript
// ✅ satisfies preserves the narrow type
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} satisfies Record<string, string | number>;
// config.apiUrl is still string (not string | number)
// config.timeout is still number

// ✅ Validate route config while keeping literal types
const routes = {
  home: { path: '/', exact: true },
  users: { path: '/users', exact: false },
} satisfies Record<string, { path: string; exact: boolean }>;
// routes.home.path is still '/'

// ❌ Without satisfies — type widens
const config: Record<string, string | number> = {
  apiUrl: 'https://api.example.com',  // now string | number, not string
};
```

## Interfaces vs Types

```typescript
// ✅ interface — for object shapes (extendable)
interface User {
  readonly id: string;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: readonly string[];
}

// ✅ type — for unions, intersections, mapped, tuples
type Status = 'pending' | 'approved' | 'rejected';
type Nullable<T> = T | null;
type Point = [x: number, y: number];
type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;
```

## Discriminated Unions

```typescript
// State management
interface IdleState { status: 'idle' }
interface LoadingState { status: 'loading' }
interface SuccessState<T> { status: 'success'; data: T }
interface ErrorState { status: 'error'; message: string }
type AsyncState<T> = IdleState | LoadingState | SuccessState<T> | ErrorState;

// Exhaustive switch
function render(state: AsyncState<User[]>) {
  switch (state.status) {
    case 'idle': return null;
    case 'loading': return <Skeleton />;
    case 'success': return <UserList data={state.data} />;
    case 'error': return <ErrorMessage message={state.message} />;
  }
  // TypeScript ensures all cases are handled
}
```

## Branded Types

```typescript
// Prevent mixing similar primitives across domain boundaries
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(id: string): UserId { return id as UserId; }
function createOrderId(id: string): OrderId { return id as OrderId; }

function getUser(id: UserId): Promise<User> { ... }
function getOrder(id: OrderId): Promise<Order> { ... }

// Compile-time error: can't pass OrderId where UserId expected
const orderId = createOrderId('ord-123');
getUser(orderId); // ❌ Type error!
```

## Template Literal Types

```typescript
// Type-safe event names
type EventName = `on${Capitalize<'click' | 'hover' | 'focus'>}`;
// 'onClick' | 'onHover' | 'onFocus'

// Type-safe CSS values
type CssUnit = `${number}${'px' | 'rem' | 'em' | '%'}`;

// Type-safe API routes
type ApiRoute = `/api/${string}`;
```

## Generics — With Constraints

```typescript
// ✅ Constrained generics
function getProperty<TObj, TKey extends keyof TObj>(obj: TObj, key: TKey): TObj[TKey] {
  return obj[key];
}

// ✅ Descriptive generic names
interface ApiResponse<TData> {
  data: TData;
  status: number;
  message: string;
}

// ✅ Default generic
type Nullable<T = string> = T | null;
```

## Result Pattern

```typescript
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.get<User>(`/users/${id}`);
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Usage
const result = await fetchUser('123');
if (result.ok) {
  renderUser(result.data); // type-safe access
} else {
  showError(result.error);
}
```

## Imports

```typescript
// ✅ import type for type-only imports (tree-shaking)
import type { User, ApiResponse } from '../models';

// ✅ Grouped: external → internal → types
import { inject } from '@angular/core';
import { UserService } from '../services/user-data';
import type { User } from '../models';

// ✅ Barrel exports
// models/index.ts
export type { User } from './user.model';
export type { Product } from './product.model';
```

## Async Best Practices

```typescript
// ✅ async/await over .then() chains
const user = await getUser(id);
const orders = await getOrders(user.id);

// ✅ Parallel when independent
const [users, products] = await Promise.all([getUsers(), getProducts()]);

// ✅ Promise.allSettled when some can fail
const results = await Promise.allSettled([taskA(), taskB()]);
const successes = results.filter((r): r is PromiseFulfilledResult<Data> => r.status === 'fulfilled');

// ❌ Never leave promises floating
asyncFunction(); // BAD — no await
await asyncFunction(); // GOOD
```

## Error Handling

```typescript
// ✅ Always handle errors with context
try {
  await saveUser(data);
} catch (error) {
  console.error('Failed to save user:', error);
  // Re-throw or return Result
}

// ❌ Never empty catch
try { ... } catch (e) { } // BAD

// ✅ Use @ts-expect-error with reason (never @ts-ignore)
// @ts-expect-error — library types wrong for this overload
someCall(arg);
```

## Null Safety

```typescript
// ✅ Optional chaining + nullish coalescing
const name = user?.profile?.name ?? 'Anonymous';

// ✅ Type narrowing
if (user !== null && user !== undefined) {
  renderUser(user);
}

// ❌ Non-null assertion (unsafe)
user!.name; // BAD — could crash

// ✅ Readonly for immutability
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

## Quick Reference

| Pattern | When |
|---------|------|
| `interface` | Object shapes, extendable contracts |
| `type` | Unions, intersections, mapped, tuples |
| `as const` | Create types from values, literal narrowing |
| `satisfies` | Validate types without widening |
| `unknown` + guard | Replace `any` with safe narrowing |
| Branded types | Prevent mixing similar primitives |
| Result pattern | Typed error handling for fallible ops |
| `import type` | Type-only imports for tree-shaking |
| Discriminated unions | State machines, multi-variant data |
| Template literals | Type-safe strings (events, routes, CSS) |
