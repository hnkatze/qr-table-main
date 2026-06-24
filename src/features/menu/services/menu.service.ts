'use server';

/**
 * Menu service — real Firestore implementation (Server Actions, Admin SDK).
 *
 * Data lives in two flat top-level collections, each doc stamped with
 * `restaurantId` for query-by-restaurant (same shape as the rest of the seed):
 *   - categories/{categoryId}
 *   - products/{productId}
 *
 * Every call authorizes the current user against the restaurant via
 * requireMembership(), so Firestore can stay locked and the client never writes
 * directly. Mutations persist the full domain object the hook already built, so
 * the optimistic id in the UI and the stored id always match.
 */

import { adminDb } from '@/lib/firebase/admin';
import { requireMembership } from '@/lib/auth/server-session';
import type { Category, Product } from '@/features/menu/types';

const CATEGORIES = 'categories';
const PRODUCTS = 'products';

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCategories(restaurantId: string): Promise<Category[]> {
  await requireMembership(restaurantId);
  const snap = await adminDb
    .collection(CATEGORIES)
    .where('restaurantId', '==', restaurantId)
    .get();
  return snap.docs
    .map((d) => {
      const { restaurantId: _r, ...category } = d.data() as Category & {
        restaurantId: string;
      };
      return category;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProducts(restaurantId: string): Promise<Product[]> {
  await requireMembership(restaurantId);
  const snap = await adminDb
    .collection(PRODUCTS)
    .where('restaurantId', '==', restaurantId)
    .get();
  return snap.docs.map((d) => {
    const { restaurantId: _r, ...product } = d.data() as Product & {
      restaurantId: string;
    };
    return product;
  });
}

// ─── Category mutations ───────────────────────────────────────────────────────

export async function createCategory(
  restaurantId: string,
  category: Category
): Promise<void> {
  await requireMembership(restaurantId);
  await adminDb
    .collection(CATEGORIES)
    .doc(category.id)
    .set({ ...category, restaurantId });
}

export async function updateCategory(
  restaurantId: string,
  category: Category
): Promise<void> {
  await requireMembership(restaurantId);
  await adminDb
    .collection(CATEGORIES)
    .doc(category.id)
    .set({ ...category, restaurantId });
}

/** Delete a category and cascade-delete all its products in one batch. */
export async function deleteCategory(
  restaurantId: string,
  categoryId: string
): Promise<void> {
  await requireMembership(restaurantId);
  const batch = adminDb.batch();
  batch.delete(adminDb.collection(CATEGORIES).doc(categoryId));

  const products = await adminDb
    .collection(PRODUCTS)
    .where('restaurantId', '==', restaurantId)
    .where('categoryId', '==', categoryId)
    .get();
  for (const doc of products.docs) batch.delete(doc.ref);

  await batch.commit();
}

// ─── Product mutations ────────────────────────────────────────────────────────

export async function createProduct(
  restaurantId: string,
  product: Product
): Promise<void> {
  await requireMembership(restaurantId);
  await adminDb
    .collection(PRODUCTS)
    .doc(product.id)
    .set({ ...product, restaurantId });
}

export async function updateProduct(
  restaurantId: string,
  product: Product
): Promise<void> {
  await requireMembership(restaurantId);
  await adminDb
    .collection(PRODUCTS)
    .doc(product.id)
    .set({ ...product, restaurantId });
}

export async function deleteProduct(
  restaurantId: string,
  productId: string
): Promise<void> {
  await requireMembership(restaurantId);
  await adminDb.collection(PRODUCTS).doc(productId).delete();
}

export async function toggleProductAvailability(
  restaurantId: string,
  productId: string,
  available: boolean
): Promise<void> {
  await requireMembership(restaurantId);
  await adminDb.collection(PRODUCTS).doc(productId).update({ available });
}
