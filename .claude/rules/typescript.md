# TypeScript Standards

## Strict Configuration

Always enable in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Strict Typing

- **NEVER** use `any` — use `unknown` if type is truly unknown
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, mapped types, and tuples
- Use `readonly` for properties that shouldn't change
- Use `as const` for literal types and creating unions from arrays
- Use `satisfies` to validate a value matches a type without widening
- Use `import type` for type-only imports (tree-shaking)
- Let TypeScript infer when obvious — don't annotate redundantly

## Naming Conventions

| Kind | Convention | Example |
|------|------------|---------|
| Interfaces | PascalCase (no `I` prefix) | `UserProfile` |
| Types | PascalCase | `ApiResponse` |
| Enums | Avoid (use string unions) | `type Status = 'active' \| 'inactive'` |
| Variables | camelCase | `userName` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Functions | camelCase | `getUserById` |
| Boolean vars | is/has/can/should prefix | `isActive`, `hasPermission` |
| Files | kebab-case | `user-profile.ts` |
| Generic params | Descriptive when possible | `<TData>`, `<TError>`, `<TItem>` |

## Patterns

### Prefer

```typescript
// Discriminated unions for state
interface LoadingState { status: 'loading' }
interface SuccessState<T> { status: 'success'; data: T }
interface ErrorState { status: 'error'; error: string }
type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

// as const for creating unions from arrays/objects
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

const STATUS_MAP = {
  active: 'Active',
  inactive: 'Inactive',
} as const;
type StatusKey = keyof typeof STATUS_MAP;

// satisfies — validate without widening
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
} satisfies Record<string, string | number>;
// config.apiUrl is still string (not string | number)

// Utility types
Partial<T>, Required<T>, Pick<T, K>, Omit<T, K>, Record<K, V>

// Optional chaining and nullish coalescing
const name = user?.profile?.name ?? 'Anonymous';

// Readonly arrays and objects
readonly items: readonly Item[];
```

### Type Guards

```typescript
// Custom type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}

// Discriminated union narrowing
function handleState(state: AsyncState<User[]>) {
  switch (state.status) {
    case 'loading': return showSkeleton();
    case 'success': return renderUsers(state.data);
    case 'error': return showError(state.error);
  }
}

// typeof guard
function processInput(input: string | number) {
  if (typeof input === 'string') {
    return input.toUpperCase();
  }
  return input.toFixed(2);
}
```

### Branded Types

```typescript
// Prevent mixing similar primitives
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function getUser(id: UserId): Promise<User> { ... }
function getOrder(id: OrderId): Promise<Order> { ... }

// Can't accidentally pass OrderId where UserId expected
```

### Template Literal Types

```typescript
// Type-safe event names, routes, etc.
type EventName = `on${Capitalize<string>}`;
type ApiEndpoint = `/api/${string}`;
type CssColor = `#${string}` | `rgb(${string})`;
```

### Avoid

```typescript
// Don't use any
const data: any = fetchData(); // BAD
const data: unknown = fetchData(); // GOOD

// Don't use non-null assertion unless certain
user!.name // BAD - could be null
user?.name ?? 'default' // GOOD

// Don't use enum for simple values (runtime cost)
enum Direction { Up, Down } // BAD
type Direction = 'up' | 'down'; // GOOD - no runtime cost

// Don't use Function, Object, {}
fn: Function // BAD → fn: () => void
obj: Object // BAD → obj: Record<string, unknown>
val: {} // BAD → val: Record<string, unknown>

// Don't annotate when inference is sufficient
const count: number = 0; // BAD - redundant
const count = 0; // GOOD - inferred
```

## Functions

```typescript
// Explicit return types on public/exported functions
function getUser(id: string): Promise<User | null> { ... }

// Let inference work for private/internal functions
const double = (n: number) => n * 2;

// Use generics with constraints for reusable logic
function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

// Generic constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Default parameters over optional + fallback
function greet(name: string = 'World'): string { ... }

// Object params when 3+ parameters
function createUser(options: {
  name: string;
  email: string;
  role?: string;
}): User { ... }
```

## Error Handling

```typescript
// Result pattern for operations that can fail
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await api.get<User>(`/users/${id}`);
    return { ok: true, data: user };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Never catch and ignore silently
try { } catch (error) { } // BAD
try { } catch (error) { console.error('Context:', error); } // GOOD

// Use @ts-expect-error (NOT @ts-ignore) with explanation
// @ts-expect-error — library types are wrong for this overload
someLibraryCall(arg);
```

## Async / Await

```typescript
// Always prefer async/await over .then() chains
const user = await getUser(id);
const orders = await getOrders(user.id);

// Parallel execution when independent
const [users, products] = await Promise.all([getUsers(), getProducts()]);

// Use Promise.allSettled when some failures are acceptable
const results = await Promise.allSettled([taskA(), taskB(), taskC()]);

// Never leave promises floating — always await or handle
await asyncFunction(); // GOOD
asyncFunction(); // BAD — floating promise
```

## Imports

```typescript
// Use import type for type-only imports (better tree-shaking)
import type { User, ApiResponse } from '../models';

// Group imports: external → internal → types
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user-data';
import type { User } from '../models';

// Barrel exports for clean public APIs
// models/index.ts
export type { User } from './user.model';
export type { Product } from './product.model';
export { OrderStatus } from './order.model';
```
