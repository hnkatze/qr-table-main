---
globs: ["**/next.config.*", "**/app/**", "**/src/app/**"]
description: Next.js App Router folder structure conventions. Applied when working with Next.js projects.
---

# Next.js App Router Folder Structure

## Standard Structure

```
project-root/
├── src/
│   ├── app/                         # App Router (routes)
│   │   ├── (auth)/                  # Route group (no URL impact)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/             # Route group
│   │   │   ├── layout.tsx           # Dashboard layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                     # API routes
│   │   │   ├── users/
│   │   │   │   └── route.ts
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   ├── loading.tsx              # Root loading UI
│   │   ├── error.tsx                # Root error UI
│   │   ├── not-found.tsx            # 404 page
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # Shared components
│   │   ├── ui/                      # UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── modal.tsx
│   │   ├── forms/                   # Form components
│   │   └── layouts/                 # Layout components
│   │
│   ├── lib/                         # Utility functions, configs
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   └── validations.ts
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-auth.ts
│   │   └── use-media-query.ts
│   │
│   ├── services/                    # API clients, external services
│   │   ├── api.ts
│   │   └── auth.ts
│   │
│   ├── types/                       # TypeScript types
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   └── styles/                      # Additional styles
│       └── components.css
│
├── public/                          # Static files
│   ├── images/
│   └── fonts/
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## App Router Special Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Shared layout (wraps children) |
| `page.tsx` | Route page component |
| `loading.tsx` | Loading UI (Suspense fallback) |
| `error.tsx` | Error boundary UI |
| `not-found.tsx` | 404 page |
| `route.ts` | API endpoint |
| `template.tsx` | Re-rendered layout |
| `default.tsx` | Parallel route fallback |

## Route Groups

Use `(folder)` for logical grouping without affecting URL:

```
app/
├── (marketing)/           # URL: /about, /contact
│   ├── about/page.tsx
│   └── contact/page.tsx
│
├── (shop)/                # URL: /products, /cart
│   ├── products/page.tsx
│   └── cart/page.tsx
│
└── (auth)/                # URL: /login, /register
    ├── login/page.tsx
    └── register/page.tsx
```

## Dynamic Routes

```
app/
├── blog/
│   ├── [slug]/            # /blog/my-post
│   │   └── page.tsx
│   └── page.tsx           # /blog
│
├── users/
│   └── [id]/              # /users/123
│       ├── page.tsx
│       └── settings/
│           └── page.tsx   # /users/123/settings
│
└── docs/
    └── [...slug]/         # /docs/a/b/c (catch-all)
        └── page.tsx
```

## Parallel Routes

```
app/
├── @modal/                # Parallel route slot
│   └── login/
│       └── page.tsx
├── @sidebar/              # Another slot
│   └── default.tsx
├── layout.tsx             # Uses slots: { modal, sidebar }
└── page.tsx
```

## Server Actions

```
app/
├── actions/               # Centralized actions
│   ├── user-actions.ts
│   └── auth-actions.ts
│
└── dashboard/
    ├── _actions/          # Route-specific actions
    │   └── dashboard-actions.ts
    └── page.tsx
```

## Component Organization

### Feature-Based (Recommended for large apps)

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   └── types.ts
│   │
│   └── users/
│       ├── components/
│       ├── hooks/
│       └── types.ts
│
└── components/            # Shared only
```

### Component-Based (Simpler apps)

```
src/
├── components/
│   ├── ui/               # Primitives
│   ├── forms/            # Form components
│   └── features/         # Feature components
```

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase or kebab-case | `UserCard.tsx` or `user-card.tsx` |
| Hooks | camelCase with `use` prefix | `use-auth.ts` |
| Utils | camelCase | `format-date.ts` |
| Types | PascalCase | `User.ts` |
| Constants | UPPER_SNAKE_CASE | `API_URL` |

## Server vs Client Components

```typescript
// Server Component (default) - no directive needed
export default function Page() {
  // Can use async/await, access DB directly
}

// Client Component - needs directive
'use client';
export default function Counter() {
  const [count, setCount] = useState(0);
  // Can use hooks, browser APIs
}
```

## Best Practices

1. **Colocation** - Keep related files close to routes
2. **Route groups** - Use `(group)` for organization
3. **Server-first** - Default to Server Components
4. **Parallel routes** - For complex layouts (modals, sidebars)
5. **Loading states** - Use `loading.tsx` for better UX
6. **Error boundaries** - Use `error.tsx` for graceful errors

Sources:
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Best Practices 2025](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3)
