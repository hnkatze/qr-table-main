import type { Category, Product, CategoryWithProducts } from '@/features/menu/types';

/**
 * Groups a flat list of products under their respective categories.
 *
 * Sort order:
 *   - Categories: ascending by sortOrder.
 *   - Products within a category: alphabetically by name (es locale).
 *
 * Categories with no products ARE included (empty array).
 * Products whose categoryId references no known category are dropped.
 *
 * Pure function — no side effects, no state.
 */
export function groupProductsByCategory(
  categories: readonly Category[],
  products: readonly Product[]
): CategoryWithProducts[] {
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return sortedCategories.map((category) => ({
    category,
    products: products
      .filter((p) => p.categoryId === category.id)
      .sort((a, b) => a.name.localeCompare(b.name, 'es')),
  }));
}
