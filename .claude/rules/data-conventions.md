# Data Model Conventions

## Identifiers — short UUIDs, never sequential/numeric

Entity IDs are **short, URL-safe, non-sequential** strings generated on our side
via `shortId()` from `src/lib/id.ts`. They are NOT numbers and NOT auto-increment.

```ts
import { shortId } from '@/lib/id';

const id = shortId('tbl'); // 'tbl_7Kp2Qx9aZ3mN'
```

- Use a short **entity prefix** so ids are self-describing: `tbl`, `ord`, `prd`,
  `cat`, `mem`, `qr`.
- Generate ids inside **client event handlers** (create/rotate) — never at module
  scope — to stay SSR/hydration-safe.
- Mock seed data may keep readable fixed ids, but anything **created at runtime**
  must use `shortId()`.

## Table number is display-only

`Table.number` (1, 2, 3…) is a **human label** shown in the admin so staff can
locate a table. It is NOT an identifier:

- It can repeat across restaurants.
- It can be reordered.
- It MUST NOT appear in public URLs or be used as a key.

## Public customer URLs use rotatable tokens — nothing guessable

Both segments of the customer URL are **dedicated public tokens**, separate from
internal ids, and rotatable. Nothing in the URL is enumerable or reveals a name:

```
/r/[publicId]/t/[qrToken]               ✅   e.g. /r/Rk9xQm2pVnL4bT7w/t/qr_aB3xK9
/r/[slug]/t/[number]                    ❌   guessable, leaks the business name
```

- **Business** → `Restaurant.publicId` (longer token, `newPublicId()` in
  `src/lib/id.ts`). Identifies the business in the URL without exposing its id or name.
- **Table** → `Table.qrToken` (shorter token, `newQrToken()`). Never the `number`,
  never the id.

Why dedicated tokens (not ids, not slugs):

- **Not guessable** — `/r/la-ceiba/t/1` lets anyone enumerate tables and harvest
  business names. Opaque tokens prevent both.
- **Rotatable** — if a QR leaks or is reprinted, mint a new token while keeping the
  same entity `id` and all related orders/tables intact.

```ts
Restaurant {
  id: 'rest_a_001',          // internal PK
  publicId: 'Rk9xQm2pVnL4bT7w', // goes in the public URL; rotate freely
  name: 'La Ceiba',          // admin/display
}
Table {
  id: 'tbl_9Fk2p',           // internal PK
  number: 1,                 // display only
  qrToken: 'qr_aB3xK9',      // goes in the public URL; rotate freely
}
```

> There is **no `slug`** on `Restaurant` — the admin shows `name`; the customer URL
> uses `publicId`. This supersedes the `/r/[slug]/t/[tableNumber]` shape in
> `ADMIN_PROJECT.md` — both the slug and the number were never meant for the URL.

## Related

- ID generator: `src/lib/id.ts`. Architecture: `architecture.md`.
