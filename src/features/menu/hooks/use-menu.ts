import { useState } from 'react';
import type { Category, Product, CategoryFields, ProductFields, CategoryWithProducts } from '@/features/menu/types';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from '@/features/menu/services/menu.service';
import {
  MOCK_CATEGORIES_BY_RESTAURANT,
  MOCK_PRODUCTS_BY_RESTAURANT,
} from '@/features/menu/services/menu-mock-data';
import { groupProductsByCategory } from '@/features/menu/mappers/group-products-by-category.mapper';
import { shortId } from '@/lib/id';

// ─── Input / Output ───────────────────────────────────────────────────────────

interface UseMenuInput {
  restaurantId: string | null;
}

export interface UseMenuOutput {
  /** Flat list of categories for the active restaurant, sorted by sortOrder. */
  categories: Category[];
  /** Flat list of products for the active restaurant. */
  products: Product[];
  /** Derived view model: categories with their products, sorted. */
  grouped: CategoryWithProducts[];
  /** True while any async mutation is in flight. */
  isMutating: boolean;

  // ── Category CRUD ──────────────────────────────────────────────────────────
  handleAddCategory: (fields: CategoryFields) => Promise<void>;
  handleEditCategory: (categoryId: string, fields: CategoryFields) => Promise<void>;
  handleDeleteCategory: (categoryId: string) => Promise<void>;

  // ── Product CRUD ───────────────────────────────────────────────────────────
  handleAddProduct: (fields: ProductFields) => Promise<void>;
  handleEditProduct: (productId: string, fields: ProductFields) => Promise<void>;
  handleDeleteProduct: (productId: string) => Promise<void>;

  /** Flips a product's availability flag immediately (no async delay). */
  handleToggleAvailability: (productId: string, available: boolean) => void;
}

// ─── Initial state from mock data ─────────────────────────────────────────────

function getInitialCategories(restaurantId: string | null): Category[] {
  if (!restaurantId) return [];
  return MOCK_CATEGORIES_BY_RESTAURANT[restaurantId] ?? [];
}

function getInitialProducts(restaurantId: string | null): Product[] {
  if (!restaurantId) return [];
  return MOCK_PRODUCTS_BY_RESTAURANT[restaurantId] ?? [];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all menu-feature state for the active restaurant:
 *   - categories + products: local shadow of mock data (Firestore-ready boundary)
 *   - restaurant-change sync: render-phase pattern (same as useMembers)
 *   - CRUD handlers: optimistic local updates + fire-and-forget service calls
 *   - grouped: derived CategoryWithProducts[] via mapper (never computed inline in .tsx)
 *
 * When Firestore lands, replace useState initialization + service calls with
 * onSnapshot subscriptions inside useEffect(s). The returned API surface stays stable.
 */
export function useMenu({ restaurantId }: UseMenuInput): UseMenuOutput {
  const [localCategories, setLocalCategories] = useState<Category[]>(() =>
    getInitialCategories(restaurantId)
  );
  const [localProducts, setLocalProducts] = useState<Product[]>(() =>
    getInitialProducts(restaurantId)
  );
  const [isMutating, setIsMutating] = useState(false);

  // Render-phase sync: when restaurantId changes, re-seed from mock data.
  // Same pattern as useMembers — intentional, not a bug.
  const [lastRestaurantId, setLastRestaurantId] = useState<string | null>(
    restaurantId
  );
  if (restaurantId !== lastRestaurantId) {
    setLastRestaurantId(restaurantId);
    setLocalCategories(getInitialCategories(restaurantId));
    setLocalProducts(getInitialProducts(restaurantId));
  }

  // Derived view model — computed from local state, never in .tsx
  const grouped = groupProductsByCategory(localCategories, localProducts);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function withMutation(fn: () => Promise<void>): Promise<void> {
    setIsMutating(true);
    return fn().finally(() => setIsMutating(false));
  }

  function nextSortOrder(): number {
    return localCategories.length === 0
      ? 1
      : Math.max(...localCategories.map((c) => c.sortOrder)) + 1;
  }

  // ── Category CRUD ─────────────────────────────────────────────────────────

  async function handleAddCategory(fields: CategoryFields): Promise<void> {
    if (!restaurantId) return;
    const newCategory: Category = {
      id: shortId('cat'),
      slug: fields.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name: fields.name.trim(),
      sortOrder: nextSortOrder(),
    };
    // Optimistic update
    setLocalCategories((prev) => [...prev, newCategory]);
    // Service call (no-op today — TODO: await + rollback on error when Firestore lands)
    await withMutation(() => createCategory(restaurantId, fields, newCategory.sortOrder));
  }

  async function handleEditCategory(categoryId: string, fields: CategoryFields): Promise<void> {
    if (!restaurantId) return;
    // Optimistic update
    setLocalCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              name: fields.name.trim(),
              slug: fields.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            }
          : c
      )
    );
    await withMutation(() => updateCategory(restaurantId, categoryId, fields));
  }

  async function handleDeleteCategory(categoryId: string): Promise<void> {
    if (!restaurantId) return;
    // Optimistic: remove category and all its products
    setLocalCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setLocalProducts((prev) => prev.filter((p) => p.categoryId !== categoryId));
    await withMutation(() => deleteCategory(restaurantId, categoryId));
  }

  // ── Product CRUD ──────────────────────────────────────────────────────────

  async function handleAddProduct(fields: ProductFields): Promise<void> {
    if (!restaurantId) return;
    const newProduct: Product = {
      id: shortId('prd'),
      categoryId: fields.categoryId,
      name: fields.name.trim(),
      description: fields.description.trim() || undefined,
      price: parseFloat(fields.price) || 0,
      available: fields.available,
      emoji: fields.emoji.trim() || undefined,
    };
    // Optimistic update
    setLocalProducts((prev) => [...prev, newProduct]);
    await withMutation(() => createProduct(restaurantId, fields));
  }

  async function handleEditProduct(productId: string, fields: ProductFields): Promise<void> {
    if (!restaurantId) return;
    // Optimistic update
    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              categoryId: fields.categoryId,
              name: fields.name.trim(),
              description: fields.description.trim() || undefined,
              price: parseFloat(fields.price) || 0,
              available: fields.available,
              emoji: fields.emoji.trim() || undefined,
            }
          : p
      )
    );
    await withMutation(() => updateProduct(restaurantId, productId, fields));
  }

  async function handleDeleteProduct(productId: string): Promise<void> {
    if (!restaurantId) return;
    // Optimistic update
    setLocalProducts((prev) => prev.filter((p) => p.id !== productId));
    await withMutation(() => deleteProduct(restaurantId, productId));
  }

  function handleToggleAvailability(productId: string, available: boolean): void {
    // Immediate optimistic flip — no loading state (feels instant by design)
    setLocalProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, available } : p))
    );
    // Fire-and-forget — no delay in the service today
    // TODO: rollback on error when Firestore lands
    void toggleProductAvailability(restaurantId ?? '', productId, available);
  }

  return {
    categories: localCategories,
    products: localProducts,
    grouped,
    isMutating,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleToggleAvailability,
  };
}
