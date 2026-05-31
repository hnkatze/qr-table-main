---
description: Validate code conventions, naming, structure, and imports. Use to enforce consistent coding standards across any web project.
---

# Code Conventions Validator

Validate and enforce consistent coding standards across web projects (Angular, Next.js, React, Astro). Detect the framework in use and apply the appropriate convention rules.

## Workflow

When invoked:

1. **Detect Framework** - Scan for `angular.json`, `next.config.*`, `astro.config.*`, or `package.json` dependencies to determine the project type
2. **Scan Files** - Walk through the project structure and collect file names, class names, imports, and folder layout
3. **Validate** - Check all rules against the codebase
4. **Report** - Output a structured report with violations, warnings, and passes

## 1. File Naming Conventions

### Agnostic Rules (All Frameworks)

- All source files use **kebab-case**: `user-profile.ts`, `data-table.tsx`
- Test files use `.spec.ts` or `.test.ts` suffix: `user-profile.spec.ts`
- Type/model files use `.model.ts` or `.types.ts` suffix: `user.model.ts`, `api.types.ts`
- No spaces, underscores, or uppercase in file names (except framework-specific exceptions below)

**Check pattern:**

```
# Valid
user-profile.ts
order-list.spec.ts
payment.model.ts
api-response.types.ts

# Invalid
userProfile.ts        # camelCase file name
UserProfile.ts        # PascalCase (unless React/Next component)
user_profile.ts       # snake_case
user-profile.service.ts  # legacy Angular suffix (see Angular rules)
```

### Angular-Specific

- Components: `name.ts` (NOT `name.component.ts`)
- Services: `name.ts` (NOT `name.service.ts`)
- Pipes: keep `.pipe.ts` suffix: `date-format.pipe.ts`
- Guards: keep `.guard.ts` suffix: `auth.guard.ts`
- Interceptors: keep `.interceptor.ts` suffix: `token.interceptor.ts`
- Modules: keep `.module.ts` suffix (legacy projects): `user.module.ts`
- Directives: keep `.directive.ts` suffix: `highlight.directive.ts`

```
# Valid Angular
user-card.ts              # component
user-data.ts              # service
date-format.pipe.ts       # pipe
auth.guard.ts             # guard

# Invalid Angular
user-card.component.ts    # legacy suffix
user-data.service.ts      # legacy suffix
```

### Next.js / React-Specific

- Components: PascalCase `.tsx` or kebab-case `.tsx`: `UserCard.tsx` or `user-card.tsx`
- Hooks: `use-*.ts` with `use` prefix in kebab-case: `use-auth.ts`, `use-media-query.ts`
- Pages follow App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- API routes: `route.ts`
- Server actions: `*-actions.ts`

```
# Valid Next.js/React
UserCard.tsx              # PascalCase component
user-card.tsx             # kebab-case component
use-auth.ts               # hook
page.tsx                  # App Router page
route.ts                  # API route

# Invalid Next.js/React
userCard.tsx              # camelCase component
useAuth.ts                # camelCase hook file (class can be camelCase, file should be kebab)
```

### Astro-Specific

- Pages: kebab-case `.astro`: `about-us.astro`
- Layouts: PascalCase `.astro`: `BaseLayout.astro`
- Components: PascalCase `.astro`: `BlogCard.astro`
- Content collections: kebab-case `.md` or `.mdx`
- Utilities: camelCase `.ts`: `formatDate.ts`

## 2. Class / Function Naming

### Components

- **PascalCase** descriptive names: `UserProfile`, `OrderList`, `PaymentForm`
- No generic names: avoid `Component1`, `MyComponent`, `Wrapper`
- Angular: no `Component` suffix in class name: `UserCard` (NOT `UserCardComponent`)

### Services

- **Descriptive behavior names** that convey purpose
- Angular: `UserDataClient`, `AuthManager`, `PaymentProcessor` (NOT `UserService`)
- React/Next: named exports with descriptive names

### Hooks (React/Next)

- **camelCase** with `use` prefix: `useAuth`, `useMediaQuery`, `useDebounce`
- Must start with `use` to follow React conventions

### Constants

- **UPPER_SNAKE_CASE**: `API_BASE_URL`, `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE`
- Group related constants in dedicated files

### Variables and Functions

- **camelCase**: `getUserById`, `isAuthenticated`, `formatCurrency`
- Use descriptive, intention-revealing names

### Interfaces

- **PascalCase** without `I` prefix: `User`, `OrderItem`, `PaymentRequest`
- NOT `IUser`, `IOrderItem`

### Types

- **PascalCase**: `UserRole`, `OrderStatus`, `ApiResponse<T>`

### Enums

- **PascalCase** for enum name, **PascalCase** for members: `UserRole.Admin`, `OrderStatus.Pending`

**Check pattern:**

```typescript
// Valid
interface User { }              // no I prefix
type OrderStatus = 'pending' | 'completed';
const MAX_RETRIES = 3;
function getUserById() { }
class AuthManager { }

// Invalid
interface IUser { }             // I prefix
type orderStatus = string;      // lowercase type
const maxRetries = 3;           // should be UPPER_SNAKE for constants
class UserService { }           // generic "Service" suffix in Angular
```

## 3. Folder Structure Validation

Detect the framework and validate against expected structure.

### Angular Expected Structure

```
src/app/
  core/           # Singleton services, guards, interceptors
  shared/         # Reusable components, pipes, directives
  features/       # Feature modules (lazy loaded)
  layouts/        # Layout components
  app.ts
  app.config.ts
  app.routes.ts
```

**Validate:**
- `core/` exists and contains guards, interceptors, singleton services
- `shared/` exists for reusable components
- `features/` contains feature folders with internal structure: `components/`, `pages/`, `services/`, `models/`
- Feature isolation: features should NOT import from other features
- No more than 3-4 levels of nesting

### Next.js Expected Structure

```
src/
  app/            # App Router routes
  components/     # Shared components
    ui/           # UI primitives
  lib/            # Utilities, configs
  hooks/          # Custom hooks
  services/       # API clients
  types/          # TypeScript types
```

**Validate:**
- `app/` uses proper App Router special files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Route groups use `(name)` convention
- Components are in `components/` not scattered in `app/`
- `'use client'` directive is present where needed (not on server components)

### Astro Expected Structure

```
src/
  pages/          # File-based routing (required)
  layouts/        # Page layouts
  components/     # Reusable components
  content/        # Content collections
  lib/            # Utilities
  styles/         # Global styles
```

**Validate:**
- `pages/` exists (required for Astro)
- Content collections have `config.ts` with schemas
- Island components are properly separated and use hydration directives

## 4. Import Order and Organization

Imports must follow this order, separated by blank lines between groups:

```typescript
// 1. Framework imports
import { Component, signal } from '@angular/core';
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { z } from 'zod';
import { clsx } from 'clsx';

// 3. Internal modules (path aliases like @/, ~/,  @app/, @core/)
import { UserDataClient } from '@core/services/user-data';
import { Button } from '@/components/ui/button';

// 4. Relative imports
import { UserCard } from './components/user-card';
import { User } from '../models/user.model';

// 5. Styles (last)
import './styles.css';
import styles from './component.module.css';
```

**Check for:**
- Correct grouping order (framework > third-party > aliases > relative > styles)
- Blank line separating each group
- No duplicate imports
- No unused imports
- Consistent use of path aliases vs deep relative paths (prefer aliases)

## 5. Barrel Exports

### Rules

- `index.ts` files should exist in `shared/`, `core/`, and feature public API folders
- Barrel files should re-export the public API of the folder
- Do NOT barrel-export everything; only intentional public API

**Check for:**
- Missing `index.ts` in `shared/` and `core/` directories
- Missing `index.ts` in shared component subdirectories
- Barrel files that export internal/private modules

```typescript
// shared/components/index.ts - Valid barrel export
export { Button } from './button/button';
export { Modal } from './modal/modal';
export { Card } from './card/card';
```

## Output Format

Present results as a structured report:

```
# Code Conventions Report

**Project:** {project-name}
**Framework:** {detected-framework}
**Files scanned:** {count}

---

## Violations (Must Fix)

❌ **[FILE_NAMING]** `src/app/features/users/UserService.ts`
   Expected: `user-data.ts` (kebab-case, no "Service" suffix)

❌ **[CLASS_NAMING]** `src/app/core/services/user.ts:5`
   Class `UserService` should use descriptive name like `UserDataClient`

❌ **[IMPORT_ORDER]** `src/app/features/orders/order-list.ts:1-12`
   Third-party import `lodash` appears before framework import `@angular/core`

---

## Warnings

⚠️ **[BARREL_EXPORT]** `src/app/shared/components/`
   Missing `index.ts` barrel export file

⚠️ **[FOLDER_STRUCTURE]** `src/app/features/users/`
   Missing `models/` subfolder for type definitions

⚠️ **[IMPORT_ALIAS]** `src/app/features/orders/order-list.ts:8`
   Deep relative import `../../../core/services/auth` - consider using path alias `@core/services/auth`

---

## Passed

✅ File naming conventions (42/45 files)
✅ Component class naming (18/18 components)
✅ Folder structure follows framework conventions
✅ No unused imports detected
✅ Constants use UPPER_SNAKE_CASE

---

## Summary

📊 **Score: 38/43 rules passed (88%)**

| Category | Passed | Total | Status |
|----------|--------|-------|--------|
| File Naming | 42 | 45 | ⚠️ |
| Class/Function Naming | 20 | 22 | ⚠️ |
| Folder Structure | 5 | 5 | ✅ |
| Import Order | 8 | 10 | ⚠️ |
| Barrel Exports | 3 | 4 | ⚠️ |
```

## Severity Levels

- **❌ Violation**: Breaks convention, must be fixed. Includes file path and line number when applicable.
- **⚠️ Warning**: Suggestion for improvement, not a hard rule.
- **✅ Pass**: Convention is correctly followed.

## Framework Detection

Detect the framework by checking (in order):

1. `angular.json` exists -> Angular
2. `next.config.js` / `next.config.mjs` / `next.config.ts` exists -> Next.js
3. `astro.config.mjs` / `astro.config.ts` exists -> Astro
4. `package.json` has `react` dependency but no Next/Astro -> React (standalone)
5. If multiple detected, report all applicable conventions

## Scope Control

- **Full scan**: Validate entire `src/` directory
- **Targeted scan**: If the user specifies files or folders, only validate those
- **Single file**: Validate naming, imports, and class conventions for one file
- Always respect `.gitignore` and skip `node_modules/`, `dist/`, `.next/`, `.angular/`
