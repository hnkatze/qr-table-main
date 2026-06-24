/**
 * Client-side image compression to WebP.
 *
 * Resizes an image File to fit within `maxDimension` (longest side) and encodes
 * it as WebP at `quality`, entirely in the browser via Canvas. Only the small
 * result is uploaded — the original never leaves the device, which keeps menu
 * photos light (~30-80 KB) and avoids large Server Action payloads.
 */

export interface CompressOptions {
  /** Longest side in px. Menu photos don't need to be large. */
  maxDimension?: number;
  /** WebP quality, 0..1. */
  quality?: number;
}

export async function compressToWebp(
  file: File,
  { maxDimension = 800, quality = 0.8 }: CompressOptions = {}
): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo no es una imagen.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height)
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('No se pudo procesar la imagen.');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen.')),
      'image/webp',
      quality
    );
  });
}
