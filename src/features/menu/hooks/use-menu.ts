import { useEffect, useState } from 'react';
import type {
  Category,
  Product,
  CategoryFields,
  ProductFields,
  CategoryWithProducts,
} from '@/features/menu/types';
import {
  getCategories,
  getProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from '@/features/menu/services/menu.service';
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
  /** True while the initial Firestore load is in flight. */
  isLoading: boolean;
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toProduct(id: string, fields: ProductFields): Product {
  return {
    id,
    categoryId: fields.categoryId,
    name: fields.name.trim(),
    description: fields.description.trim() || undefined,
    price: parseFloat(fields.price) || 0,
    available: fields.available,
    emoji: fields.emoji.trim() || undefined,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates all menu-feature state for the active restaurant, backed by
 * Firestore through menu.service.ts (Server Actions):
 *   - initial load: getCategories + getProducts in an effect keyed by restaurantId
 *   - CRUD handlers: optimistic local update + awaited service call + rollback
 *   - grouped: derived CategoryWithProducts[] via mapper (never computed in .tsx)
 *
 * The returned API surface is stable so the page/components don't change.
 */
export function useMenu({ restaurantId }: UseMenuInput): UseMenuOutput {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // Load (and reload when the active restaurant changes).
  useEffect(() => {
    if (!restaurantId) {
      setLocalCategories([]);
      setLocalProducts([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    Promise.all([getCategories(restaurantId), getProducts(restaurantId)])
      .then(([cats, prods]) => {
        if (cancelled) return;
        setLocalCategories(cats);
        setLocalProducts(prods);
      })
      .catch(() => {
        if (cancelled) return;
        setLocalCategories([]);
        setLocalProducts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

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
      slug: slugify(fields.name),
      name: fields.name.trim(),
      sortOrder: nextSortOrder(),
    };
    const prev = localCategories;
    setLocalCategories((p) => [...p, newCategory]);
    try {
      await withMutation(() => createCategory(restaurantId, newCategory));
    } catch {
      setLocalCategories(prev);
    }
  }

  async function handleEditCategory(
    categoryId: string,
    fields: CategoryFields
  ): Promise<void> {
    if (!restaurantId) return;
    const existing = localCategories.find((c) => c.id === categoryId);
    if (!existing) return;
    const updated: Category = {
      ...existing,
      name: fields.name.trim(),
      slug: slugify(fields.name),
    };
    const prev = localCategories;
    setLocalCategories((p) => p.map((c) => (c.id === categoryId ? updated : c)));
    try {
      await withMutation(() => updateCategory(restaurantId, updated));
    } catch {
      setLocalCategories(prev);
    }
  }

  async function handleDeleteCategory(categoryId: string): Promise<void> {
    if (!restaurantId) return;
    const prevCategories = localCategories;
    const prevProducts = localProducts;
    setLocalCategories((p) => p.filter((c) => c.id !== categoryId));
    setLocalProducts((p) => p.filter((pr) => pr.categoryId !== categoryId));
    try {
      await withMutation(() => deleteCategory(restaurantId, categoryId));
    } catch {
      setLocalCategories(prevCategories);
      setLocalProducts(prevProducts);
    }
  }

  // ── Product CRUD ──────────────────────────────────────────────────────────

  async function handleAddProduct(fields: ProductFields): Promise<void> {
    if (!restaurantId) return;
    const newProduct = toProduct(shortId('prd'), fields);
    const prev = localProducts;
    setLocalProducts((p) => [...p, newProduct]);
    try {
      await withMutation(() => createProduct(restaurantId, newProduct));
    } catch {
      setLocalProducts(prev);
    }
  }

  async function handleEditProduct(
    productId: string,
    fields: ProductFields
  ): Promise<void> {
    if (!restaurantId) return;
    const updated = toProduct(productId, fields);
    const prev = localProducts;
    setLocalProducts((p) => p.map((pr) => (pr.id === productId ? updated : pr)));
    try {
      await withMutation(() => updateProduct(restaurantId, updated));
    } catch {
      setLocalProducts(prev);
    }
  }

  async function handleDeleteProduct(productId: string): Promise<void> {
    if (!restaurantId) return;
    const prev = localProducts;
    setLocalProducts((p) => p.filter((pr) => pr.id !== productId));
    try {
      await withMutation(() => deleteProduct(restaurantId, productId));
    } catch {
      setLocalProducts(prev);
    }
  }

  function handleToggleAvailability(productId: string, available: boolean): void {
    if (!restaurantId) return;
    const prev = localProducts;
    // Immediate optimistic flip — no loading state (feels instant by design).
    setLocalProducts((p) =>
      p.map((pr) => (pr.id === productId ? { ...pr, available } : pr))
    );
    void toggleProductAvailability(restaurantId, productId, available).catch(
      () => setLocalProducts(prev)
    );
  }

  return {
    categories: localCategories,
    products: localProducts,
    grouped,
    isLoading,
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
