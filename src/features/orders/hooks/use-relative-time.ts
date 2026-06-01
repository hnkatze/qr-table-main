import { useEffect, useState } from 'react';
import {
  formatRelativeTime,
  formatAbsoluteTime,
} from '@/features/orders/mappers/format-order.mapper';

/**
 * Refresh cadence for the live relative-time label (ms).
 * 60s is cheap and keeps a live order board feeling current.
 */
const REFRESH_INTERVAL_MS = 60_000;

/**
 * Client-only relative-time hook — the fix for the SSR/hydration mismatch.
 *
 * Problem: rendering "hace X min" during SSR bakes the SERVER's clock into the
 * HTML; the client then hydrates with its own (slightly different) clock, so the
 * text — and any time-derived attribute — mismatch. React throws a hydration
 * warning.
 *
 * Solution: this hook returns a STABLE fallback during SSR and the first client
 * render (so server HTML === first client HTML, no mismatch), then switches to
 * the live relative string only AFTER mount (inside useEffect, where code runs
 * client-side only). It re-computes every 60s so the board stays current.
 *
 * Formatting logic stays in the mapper (formatRelativeTime / formatAbsoluteTime);
 * this hook owns only the mount + now state. That keeps the architecture clean:
 * pure transforms in the mapper, UI state in the hook.
 */
export function useRelativeTime(createdAt: number): string {
  // `now` is null until mounted. Null === "not yet on client" → show the stable
  // absolute-time fallback, which is identical on server and first client render.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Runs only on the client, after hydration. Set the real current time and
    // refresh on an interval so the relative label stays live.
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) {
    // SSR + first client render: deterministic, hydration-safe.
    return formatAbsoluteTime(createdAt);
  }

  return formatRelativeTime(createdAt, now);
}
