# Mesa — Admin / Backoffice (project brief)

> Context for the **second** project: `qr-table-main` (freshly bootstrapped, no app code yet).
> This repo (`qr-table`) is the **public landing / demo**. The admin is a separate repo.
> Ongoing context is shared via **engram** (topic key: `architecture/admin-backoffice`), not by copying files.

## 1. Vision

The **backoffice** for Mesa (the QR-ordering SaaS). A restaurant owner/staff logs in and manages
everything that powers the customer-facing experience: menu, products, tables/QRs, and live orders.

- **Domain**: `admin.<domain>` (e.g. `admin.mesa.app`)
- **Audience**: authenticated owners/staff — NOT end customers
- **Demo today** uses an in-memory `MockStore` (`qr-table/src/lib/mock-store.ts`). The admin replaces that
  with **Firebase** as the real backend. The customer + kitchen views will eventually read the same
  Firestore data the admin writes.

## 2. Stack

- **Next.js 16.2.6** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind v4** · **shadcn/ui** (base-nova)
- **Firebase**:
  - **Auth** → login. Email/password first. Roles via **custom claims** (`owner`, `staff`).
  - **Firestore** → all data, with **realtime listeners** for the live orders board.
  - **Storage** → product/menu images.

> ⚠️ This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing code (see `AGENTS.md`).

## 3. Shared domain model — EXACT shapes from the demo

These are the real types in `qr-table/src/types/`. The admin MUST stay compatible with them.

```ts
// types/restaurant.ts
interface Restaurant {
  id: string; slug: string; name: string;
  tagline?: string; currency: string;          // demo uses "HNL"
  tables: readonly Table[];                     // embedded in demo; becomes a subcollection in Firestore
}
interface Table { id: string; number: number; qrToken: string; }

// types/menu.ts
interface Category { id: string; slug: string; name: string; sortOrder: number; }
interface Product {
  id: string; categoryId: string; name: string;
  description?: string; price: number; available: boolean; emoji?: string;
}

// types/order.ts
type OrderStatus = "pending" | "preparing" | "ready" | "delivered";
interface OrderItem { productId: string; name: string; price: number; quantity: number; notes?: string; }
interface Order {
  id: string; restaurantId: string; tableId: string; tableNumber: number;
  items: readonly OrderItem[]; total: number; status: OrderStatus;
  customerName?: string; createdAt: number; updatedAt: number;
}
```

**Join keys** (how the landing links to data): restaurant **`slug`** + table **`number`** + order **`id`**.
- Customer menu: `/r/[slug]/t/[tableNumber]`
- Order tracking: `/r/[slug]/t/[tableNumber]/o/[orderId]`
- Kitchen board: `/kitchen/[slug]`

> 🔜 **Planned extension** (engram `sdd/sales-flow`): adds a `"closed"` status + a payment snapshot on
> close. NOT in the code yet. Design the admin's order status flow to accommodate it later.

## 4. Firestore data model (proposed)

```
restaurants/{restaurantId}
  slug, name, tagline?, currency, ownerUid, branding?

restaurants/{restaurantId}/tables/{tableId}
  number, qrToken                              // was embedded in the demo Restaurant.tables

restaurants/{restaurantId}/categories/{categoryId}
  slug, name, sortOrder

restaurants/{restaurantId}/products/{productId}
  categoryId, name, description?, price, available, emoji?, imageUrl?

restaurants/{restaurantId}/orders/{orderId}
  tableId, tableNumber, items[], total, status, customerName?, createdAt, updatedAt
  // paymentSnapshot? once sales-flow lands
```

> The demo embeds `tables` inside `Restaurant` and ships products as static arrays in `mock-data.ts`.
> In Firestore they become **subcollections** so owners can edit them.

## 5. Routes (admin)

```
/login                      → Firebase Auth
/(dashboard)                → protected layout (sidebar + topbar)
  /dashboard                → overview / live orders summary
  /orders                   → realtime board, status flow
  /menu                     → categories + products CRUD
  /tables                   → tables + QR generation
  /settings                 → restaurant profile, branding
```

## 6. MVP scope

1. **Auth** — login, protected routes, sign-out, redirect unauthenticated.
2. **Dashboard shell** — sidebar + topbar layout, nav between sections.
3. **Menu & products** — CRUD: categories + products (image upload, `available` toggle).
4. **Tables & QR** — create tables, generate the QR pointing to `/r/[slug]/t/[number]` on the landing.
5. **Orders (live)** — Firestore realtime board; advance `pending → preparing → ready → delivered`.
6. **Settings** — restaurant profile (name, slug, tagline, currency, branding).

## 7. Out of scope (for now)

Billing/subscriptions · multi-restaurant org management · analytics dashboards · staff-invitation UI.

## 8. Conventions

Carry over the same `.claude/rules/` from this repo: TS strict, Tailwind utility-first, a11y, error-handling
(discriminated-union async state, never swallow errors), conventional commits, `nextjs-structure.md` folders.

## 9. Open decisions (resolve when work starts)

- Single role vs. `owner`/`staff` from day one (custom-claims design).
- `paymentSnapshot` shape on order close (align with `sdd/sales-flow/design` in engram).
- Hosting: Vercel (frontend) + Firebase (backend) vs. Firebase Hosting end-to-end.
- When/how the **demo** migrates from `MockStore` to reading the same Firestore data.
- Firestore Security Rules: enforce `ownerUid` / restaurant-scoped access per collection.
- Currency handling: demo hardcodes `HNL` — keep per-restaurant `currency` field authoritative.
