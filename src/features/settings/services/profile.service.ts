import type { FormFields } from '../types';

/**
 * Persists the profile form fields for the given restaurant.
 *
 * TODO: replace the mock with the real Firestore write when Firebase is wired:
 *   import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
 *   import { db } from '@/lib/firebase';
 *
 *   await updateDoc(doc(db, 'restaurants', restaurantId), {
 *     name: fields.name,
 *     slug: fields.slug,
 *     tagline: fields.tagline || null,
 *     currency: fields.currency,
 *     updatedAt: serverTimestamp(),
 *   });
 */
export async function saveProfile(
  _restaurantId: string,
  _fields: FormFields
): Promise<void> {
  // Mock: simulates a 900 ms async write.
  await new Promise<void>((resolve) => setTimeout(resolve, 900));
}
