/**
 * Builds the public customer URL for a given restaurant table.
 *
 * Pattern: /r/[publicId]/t/[qrToken]
 *
 * Both segments are rotatable public tokens — NOT the restaurant slug and NOT the
 * table number (see .claude/rules/data-conventions.md):
 *   - `publicId` identifies the business; unguessable and rotatable.
 *   - `qrToken` identifies the table; unguessable and rotatable.
 * The table number is a human-facing display label only and never appears here.
 *
 * Pure function — no side effects, no state.
 * When the routing convention changes, only this mapper needs updating.
 *
 * @example
 *   buildTableUrl('biz_8aR2kQ9mZ', 'qr_7Kp2Qx9aZ3mN')
 *   // → '/r/biz_8aR2kQ9mZ/t/qr_7Kp2Qx9aZ3mN'
 */
export function buildTableUrl(publicId: string, qrToken: string): string {
  return `/r/${publicId}/t/${qrToken}`;
}

/**
 * Public customer site origin where QR codes point — the landing/customer domain,
 * NOT this admin app and NOT `window.location.origin`.
 *
 * Why a fixed origin (no `window`):
 *   - **Stable across SSR and client**, so the QR `<img>` src/alt is identical on
 *     the server and on hydration. Reading `window` here returned a relative URL on
 *     the server and an absolute one on the client → a hydration mismatch.
 *   - **Correct target**: the QR is scanned by customers, so it must point at the
 *     public site, never at the admin backoffice this app runs on.
 *
 * Inlined at build time via `NEXT_PUBLIC_SITE_URL` (same value on server + client).
 */
const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mesa.app';

/**
 * Builds the absolute customer URL (for QR generation and copy-to-clipboard).
 * Stable across SSR/client — no `window`.
 *
 * @example
 *   buildAbsoluteTableUrl('biz_8aR2kQ9mZ', 'qr_7Kp2Qx9aZ3mN')
 *   // → 'https://mesa.app/r/biz_8aR2kQ9mZ/t/qr_7Kp2Qx9aZ3mN'
 */
export function buildAbsoluteTableUrl(publicId: string, qrToken: string): string {
  return `${PUBLIC_SITE_URL}${buildTableUrl(publicId, qrToken)}`;
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
