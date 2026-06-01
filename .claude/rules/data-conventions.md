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

## Public customer URLs use the rotatable `qrToken`

The QR a customer scans points at the table via its **`qrToken`** — a dedicated,
rotatable token separate from the entity id — never the `number` and never the id:

```
/r/[slug]/t/[qrToken]      ✅   e.g. /r/la-ceiba/t/qr_3bV8sLp1Wq2X
/r/[slug]/t/[number]       ❌   guessable, unstable
```

Why a separate token (not the id):

- **Not guessable** — `/t/1`, `/t/2` would let anyone enumerate tables.
- **Rotatable** — if a QR leaks or is reprinted, generate a new `qrToken`
  (`newQrToken()` in `src/lib/id.ts`) while keeping the same entity `id` and all
  related orders intact.

```ts
Table {
  id: 'tbl_9Fk2p',        // internal PK (shortId)
  number: 1,              // display only
  qrToken: 'qr_aB3xK9',   // goes in the public URL; rotate freely
}
```

> This supersedes the `/r/[slug]/t/[tableNumber]` shape mentioned in
> `ADMIN_PROJECT.md` — the number was for humans, not for the URL.

## Related

- ID generator: `src/lib/id.ts`. Architecture: `architecture.md`.
