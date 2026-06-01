import { PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductRow } from './product-row';
import { CATEGORY_ACCENT_CLASSES } from '@/features/menu/constants';
import type { CategoryWithProducts, Product } from '@/features/menu/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategorySectionProps {
  categoryWithProducts: CategoryWithProducts;
  /** Index in the rendered list — used to cycle accent colors. */
  index: number;
  currency: string;
  isOwner: boolean;
  onEditCategory: (categoryId: string, currentName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddProduct: (categoryId: string) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleAvailability: (productId: string, available: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders one category card: colored header strip + name + product list.
 *
 * Owner-gating:
 *   - isOwner=true → edit/delete category, add product, product row actions visible.
 *   - isOwner=false → read-only.
 *
 * Empty product list shows a gentle placeholder rather than nothing.
 */
export function CategorySection({
  categoryWithProducts,
  index,
  currency,
  isOwner,
  onEditCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailability,
}: CategorySectionProps) {
  const { category, products } = categoryWithProducts;
  const accentClass = CATEGORY_ACCENT_CLASSES[index % CATEGORY_ACCENT_CLASSES.length];

  return (
    <Card className="relative overflow-hidden" aria-labelledby={`cat-header-${category.id}`}>
      {/* Left accent strip */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${accentClass}`}
      />

      {/* Category header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 pl-6 sm:px-6 sm:pl-7">
        <h2
          id={`cat-header-${category.id}`}
          className="text-base font-semibold tracking-tight text-foreground"
        >
          {category.name}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({products.length} {products.length === 1 ? 'producto' : 'productos'})
          </span>
        </h2>

        {/* Owner actions */}
        {isOwner && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEditCategory(category.id, category.name)}
              aria-label={`Editar categoría "${category.name}"`}
            >
              <PencilIcon aria-hidden="true" className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDeleteCategory(category.id)}
              aria-label={`Eliminar categoría "${category.name}"`}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2Icon aria-hidden="true" className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Product list */}
      <CardContent className="p-0">
        {products.length > 0 ? (
          <ul aria-label={`Productos en ${category.name}`} className="divide-y-0">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                currency={currency}
                isOwner={isOwner}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onToggleAvailability={onToggleAvailability}
              />
            ))}
          </ul>
        ) : (
          <p className="px-6 py-6 text-sm text-muted-foreground text-center">
            Esta categoría no tiene productos aún.
            {isOwner && ' Agregá el primero.'}
          </p>
        )}

        {/* Add product — owner only */}
        {isOwner && (
          <div className="border-t border-border/60 px-4 py-2 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddProduct(category.id)}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label={`Agregar producto a ${category.name}`}
            >
              <PlusIcon aria-hidden="true" className="size-4" />
              Agregar producto
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
