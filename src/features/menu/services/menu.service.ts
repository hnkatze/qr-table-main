import type { Category, Product } from '@/features/menu/types';
import type { CategoryFields, ProductFields } from '@/features/menu/types';
import {
  MOCK_CATEGORIES_BY_RESTAURANT,
  MOCK_PRODUCTS_BY_RESTAURANT,
} from './menu-mock-data';
import { MOCK_WRITE_DELAY_MS } from '@/features/menu/constants';

/**
 * Menu service — the future Firestore boundary.
 *
 * All functions are async to match the eventual shape.
 * Today they operate on mock data; the hook applies changes locally (optimistic).
 * Each function has a seam comment marking where the real implementation lands.
 *
 * TODO seams:
 *   - getCategories  → Firestore: collection('restaurants/{id}/categories') orderBy sortOrder
 *   - getProducts    → Firestore: collection('restaurants/{id}/products')
 *   - createCategory → Firestore: addDoc to categories sub-collection
 *   - updateCategory → Firestore: updateDoc on the category document
 *   - deleteCategory → Firestore: deleteDoc; also cascade-delete child products
 *   - createProduct  → Firestore: addDoc to products sub-collection
 *   - updateProduct  → Firestore: updateDoc on the product document
 *   - deleteProduct  → Firestore: deleteDoc
 *   - toggleProductAvailability → Firestore: updateDoc with { available: !current }
 */

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns all categories for a restaurant, sorted by sortOrder.
 * TODO: Firestore — real-time listener on `restaurants/{id}/categories`.
 */
export async function getCategories(restaurantId: string): Promise<Category[]> {
  // TODO: Firestore — subscribe to categories sub-collection
  return MOCK_CATEGORIES_BY_RESTAURANT[restaurantId] ?? [];
}

/**
 * Returns all products for a restaurant.
 * TODO: Firestore — real-time listener on `restaurants/{id}/products`.
 */
export async function getProducts(restaurantId: string): Promise<Product[]> {
  // TODO: Firestore — subscribe to products sub-collection
  return MOCK_PRODUCTS_BY_RESTAURANT[restaurantId] ?? [];
}

// ─── Category mutations ───────────────────────────────────────────────────────

/**
 * Creates a new category.
 * Today: no-op (hook applies optimistically with a generated id).
 * TODO: Firestore — addDoc(collection(db, 'restaurants', id, 'categories'), { ... })
 */
export async function createCategory(
  _restaurantId: string,
  _fields: CategoryFields,
  _sortOrder: number
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist new category
}

/**
 * Updates an existing category.
 * Today: no-op (hook applies optimistically).
 * TODO: Firestore — updateDoc(doc(db, 'restaurants', id, 'categories', categoryId), { name })
 */
export async function updateCategory(
  _restaurantId: string,
  _categoryId: string,
  _fields: CategoryFields
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist category update
}

/**
 * Deletes a category (and all its products in a real backend).
 * Today: no-op (hook removes locally).
 * TODO: Firestore — batch delete category doc + all products with this categoryId
 */
export async function deleteCategory(
  _restaurantId: string,
  _categoryId: string
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — batch delete
}

// ─── Product mutations ────────────────────────────────────────────────────────

/**
 * Creates a new product.
 * Today: no-op (hook applies optimistically with a generated id).
 * TODO: Firestore — addDoc(collection(db, 'restaurants', id, 'products'), { ... })
 */
export async function createProduct(
  _restaurantId: string,
  _fields: ProductFields
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist new product
}

/**
 * Updates an existing product.
 * Today: no-op (hook applies optimistically).
 * TODO: Firestore — updateDoc(doc(db, 'restaurants', id, 'products', productId), { ... })
 */
export async function updateProduct(
  _restaurantId: string,
  _productId: string,
  _fields: ProductFields
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — persist product update
}

/**
 * Deletes a product.
 * Today: no-op (hook removes locally).
 * TODO: Firestore — deleteDoc(doc(db, 'restaurants', id, 'products', productId))
 */
export async function deleteProduct(
  _restaurantId: string,
  _productId: string
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_WRITE_DELAY_MS));
  // TODO: Firestore — delete product document
}

/**
 * Toggles a product's availability flag.
 * Today: no-op (hook applies optimistically).
 * TODO: Firestore — updateDoc(productRef, { available: !current })
 */
export async function toggleProductAvailability(
  _restaurantId: string,
  _productId: string,
  _available: boolean
): Promise<void> {
  // Intentionally no delay — availability toggle should feel instant
  // TODO: Firestore — atomic availability flip
}
