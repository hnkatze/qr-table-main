/**
 * Short, URL-safe unique IDs generated on our side.
 *
 * IDs are NOT sequential and NOT numeric — see `.claude/rules/data-conventions.md`.
 * Use a short entity prefix so ids are self-describing: tbl, ord, prd, cat, mem, qr.
 *
 *   shortId('tbl')  → 'tbl_7Kp2Qx9aZ3mN'
 *   shortId('qr')   → 'qr_3bV8sLp1Wq2X'   (rotatable public token for QR URLs)
 *
 * Backed by the Web Crypto API (`crypto.getRandomValues`), available in the
 * browser and in Node's global scope. Generate ids inside client event handlers
 * (create/rotate), never at module scope, to stay SSR/hydration-safe.
 */

// Base58 alphabet — URL-safe and free of visually ambiguous chars (0/O, 1/I/l).
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Largest multiple of the alphabet length that fits in a byte, used to reject
// values that would introduce modulo bias.
const UNBIASED_MAX = Math.floor(256 / ALPHABET.length) * ALPHABET.length;

const DEFAULT_SIZE = 12;

/**
 * Generate a short random, URL-safe id.
 *
 * @param prefix optional entity prefix (e.g. 'tbl', 'ord', 'qr')
 * @param size   number of random characters (default 12 ≈ 70 bits of entropy)
 */
export function shortId(prefix?: string, size: number = DEFAULT_SIZE): string {
  let out = '';
  while (out.length < size) {
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    for (let i = 0; i < size && out.length < size; i++) {
      const byte = bytes[i]!;
      // Reject biased bytes so every alphabet char is equally likely.
      if (byte < UNBIASED_MAX) {
        out += ALPHABET[byte % ALPHABET.length];
      }
    }
  }
  return prefix ? `${prefix}_${out}` : out;
}

/**
 * Generate a fresh public QR token for a TABLE (rotatable, independent of the id).
 * Rotating a QR = call this again and store the new token; the entity id is unchanged.
 */
export function newQrToken(): string {
  return shortId('qr');
}

/**
 * Generate a fresh public BUSINESS token (rotatable, independent of the id).
 * Longer than a table token and prefix-less so the customer URL stays clean:
 * `/r/[publicId]/t/[qrToken]`. Never the internal restaurant id.
 */
export function newPublicId(): string {
  return shortId(undefined, 16);
}
