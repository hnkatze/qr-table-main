'use server';

/**
 * Storage Server Actions — image upload via the Admin SDK.
 *
 * The client compresses the photo to a small WebP first (see compressToWebp),
 * then posts it here. We authorize against the restaurant, store it under a
 * random path, and return a permanent public download URL (Firebase download
 * token), so it works regardless of Storage rules and is CDN-cacheable.
 */

import { randomUUID } from 'node:crypto';
import { adminStorage } from '@/lib/firebase/admin';
import { requireMembership } from '@/lib/auth/server-session';

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

export async function uploadProductImage(formData: FormData): Promise<string> {
  const restaurantId = String(formData.get('restaurantId') ?? '');
  const file = formData.get('file');

  if (!restaurantId) throw new Error('Falta el comercio.');
  if (!(file instanceof File)) throw new Error('Archivo inválido.');

  await requireMembership(restaurantId);

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `menu/${restaurantId}/${randomUUID()}.webp`;
  const token = randomUUID();
  const bucket = adminStorage.bucket(BUCKET);

  await bucket.file(path).save(buffer, {
    metadata: {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
}
