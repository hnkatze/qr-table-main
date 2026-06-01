/**
 * Builds the public customer URL for a given restaurant table.
 *
 * Pattern: /r/[restaurantSlug]/t/[qrToken]
 *
 * The URL uses the rotatable `qrToken` — NOT the table number. The number is a
 * human-facing display label only (see .claude/rules/data-conventions.md):
 * tokens are non-guessable and can be rotated if a QR leaks or is reprinted.
 *
 * Pure function — no side effects, no state.
 * When the routing convention changes, only this mapper needs updating.
 *
 * @example
 *   buildTableUrl('la-ceiba', 'qr-la-ceiba-t1')
 *   // → '/r/la-ceiba/t/qr-la-ceiba-t1'
 */
export function buildTableUrl(restaurantSlug: string, qrToken: string): string {
  return `/r/${restaurantSlug}/t/${qrToken}`;
}

/**
 * Builds the absolute customer URL (for QR generation and copy-to-clipboard).
 *
 * Uses the current window.location.origin on the client.
 * Falls back to a relative URL when called during SSR.
 *
 * @example
 *   buildAbsoluteTableUrl('la-ceiba', 'qr-la-ceiba-t1')
 *   // → 'https://mesa.hn/r/la-ceiba/t/qr-la-ceiba-t1'  (on the real domain)
 *   // → 'http://localhost:3000/r/la-ceiba/t/qr-la-ceiba-t1'  (in dev)
 */
export function buildAbsoluteTableUrl(restaurantSlug: string, qrToken: string): string {
  const path = buildTableUrl(restaurantSlug, qrToken);
  if (typeof window === 'undefined') return path; // SSR guard
  return `${window.location.origin}${path}`;
}

/**
 * Builds the QR code image URL using the public qrserver.com API.
 *
 * TODO: swap this call for a local/offline QR generator (e.g., `qrcode` npm package
 * rendered to a canvas/SVG on the client) to remove the external dependency,
 * support offline environments, and allow full visual customisation.
 *
 * @param absoluteUrl - The full URL to encode in the QR code.
 * @param size        - Pixel size of the generated image (square). Default 160.
 */
export function buildQrImageUrl(absoluteUrl: string, size = 160): string {
  const encoded = encodeURIComponent(absoluteUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=8`;
}
