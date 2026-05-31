# Feature-Based Architecture

## Core Principle

**Feature-first organization** with strict **separation of concerns** (container / presentational).

> If a module does NOT handle, derive, or mutate state — and does NOT render UI —
> it must NOT live in a `.tsx` file.

- `.tsx` files → **state + UI only** (render from props, local UI state, event handlers).
- Non-state logic (joins, derivations, fetch, CRUD, mapping) → plain `.ts` modules.
- Types/interfaces, constants, and mappers each live in their **own file**.

This keeps code maintainable and shareable. Apply it from the start — refactoring
5 files is trivial, refactoring 50 is a nightmare.

## Feature Structure

```
src/features/<feature>/
  components/        ← .tsx — presentational (props → UI) + local UI state only
  hooks/
    use-<feature>.ts ← encapsulates the feature's STATE (no UI)
  services/
    <name>.service.ts ← the "server functions": fetch / join / CRUD. The data boundary.
  mappers/
    <name>.mapper.ts ← pure transformations / joins
  types.ts           ← feature-local types & interfaces
  constants.ts       ← feature-local constants (as const)
```

Shared, cross-feature code does NOT go in a feature:

| Shared concern | Location |
| -------------- | -------- |
| Domain types/interfaces | `src/types/` |
| UI primitives (shadcn) | `src/components/ui/` |
| Generic utilities | `src/lib/` |
| Auth/session context | `src/lib/auth/` |

## Layer Responsibilities

| Layer | File | Responsibility | Rule |
| ----- | ---- | -------------- | ---- |
| **Presentation** | `components/*.tsx` | Render from props, local UI state (open/closed, hover) | No business logic, no data joins, no fetch |
| **State** | `hooks/use-*.ts` | Own the feature's state and orchestrate services | `.ts` only — never renders |
| **Service** | `services/*.service.ts` | Fetch / join / CRUD. Mock today, real backend later | The ONLY place the backend is known |
| **Mapper** | `mappers/*.mapper.ts` | Pure data transforms / joins / derivations | No side effects, no state |
| **Types** | `types.ts` | Feature-local types | — |
| **Constants** | `constants.ts` | Feature-local constants | `as const` |

## The Service Is the Boundary

Services are the seam between the app and the backend. Today they run on mock data;
when the real backend (e.g. Firestore) lands, **only the service changes** — components,
hooks, mappers, and types stay untouched. Mark future integration points with `// TODO:`.

```ts
// services/members.service.ts
export async function getMembers(restaurantId: string): Promise<MemberRow[]> {
  // TODO: replace with Firestore query + realtime listener
  return buildMemberRows(restaurantId); // mapper over mock data for now
}
```

## Pages Are Thin Orchestrators

`app/**/page.tsx` reads auth/params, calls the feature hook, and renders presentational
components. **Zero business logic, joins, or mappers inline.**

```tsx
// app/(dashboard)/users/page.tsx — thin
export default function UsersPage() {
  const { activeRestaurant, currentUser } = useAuth();
  const isOwner = useActiveRole() === 'owner';
  const { members, changeRole, removeMember, invite } = useMembers({ restaurantId: activeRestaurant?.id ?? null });
  // ...render presentational components only
}
```

> Route name ≠ feature name is fine (route `/users` → feature `members`). Don't rename
> routes just to match a feature folder.

## Good vs. Bad

```tsx
// ❌ BAD — join + sort logic living inside the .tsx
function UsersPage() {
  const rows = MOCK_MEMBERSHIPS.filter(...).map(...).sort(...); // business logic in a component
}

// ✅ GOOD — logic extracted; component only orchestrates state + render
function UsersPage() {
  const { members } = useMembers({ restaurantId }); // hook → service → mapper
}
```

## Naming

- Files: `kebab-case` (`member-role-select.tsx`, `member-row.mapper.ts`).
- Hooks: `use-<name>.ts`. Services: `<name>.service.ts`. Mappers: `<name>.mapper.ts`.
- `import type` for type-only imports; `as const` for literal constants; no `any`.

## When NOT to Make a Feature

Truly generic, cross-feature building blocks (a reusable button, a date formatter)
belong in `src/components/ui/` or `src/lib/`, not in a feature folder.

## Related

- Styling/theming is **token-only** — see the theming convention: components reference
  shadcn semantic tokens + brand tokens, never inline `oklch()`/`bg-[#...]`.
- TypeScript conventions: `typescript.md`. Folder conventions: `nextjs-structure.md`.
