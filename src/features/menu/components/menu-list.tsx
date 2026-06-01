'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LockIcon } from 'lucide-react';
import { CategorySection } from './category-section';
import { CategoryDialog } from './category-dialog';
import { ProductDialog } from './product-dialog';
import type { Category, Product, CategoryWithProducts, CategoryFields, ProductFields } from '@/features/menu/types';
import { DIALOG_MODE } from '@/features/menu/constants';

// ─── Local dialog state ───────────────────────────────────────────────────────

interface EditCategoryState {
  open: boolean;
  categoryId: string;
  currentName: string;
}

type ProductDialogState =
  | { open: false }
  | { open: true; mode: 'add'; defaultCategoryId: string }
  | { open: true; mode: 'edit'; product: Product };

// ─── Props ────────────────────────────────────────────────────────────────────

interface MenuListProps {
  grouped: CategoryWithProducts[];
  categories: Category[];
  currency: string;
  isOwner: boolean;
  isMutating: boolean;
  onAddCategory: (fields: CategoryFields) => Promise<void>;
  onEditCategory: (categoryId: string, fields: CategoryFields) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onAddProduct: (fields: ProductFields) => Promise<void>;
  onEditProduct: (productId: string, fields: ProductFields) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onToggleAvailability: (productId: string, available: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Main content area of the menu page.
 *
 * Owns dialog open/close state only — all data mutations are delegated upward
 * via callbacks (the hook owns the actual data).
 *
 * Owner-gating: passes isOwner down to every child; also shows a read-only notice.
 */
export function MenuList({
  grouped,
  categories,
  currency,
  isOwner,
  isMutating,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailability,
}: MenuListProps) {
  const [editCatState, setEditCatState] = useState<EditCategoryState>({
    open: false,
    categoryId: '',
    currentName: '',
  });
  const [productDialog, setProductDialog] = useState<ProductDialogState>({ open: false });

  // ── Category dialog handlers ────────────────────────────────────────────

  function openEditCategory(categoryId: string, currentName: string) {
    setEditCatState({ open: true, categoryId, currentName });
  }

  function closeEditCategory() {
    setEditCatState((prev) => ({ ...prev, open: false }));
  }

  async function handleAddCategory(fields: CategoryFields): Promise<void> {
    await onAddCategory(fields);
  }

  async function handleEditCategory(fields: CategoryFields, categoryId: string): Promise<void> {
    await onEditCategory(categoryId, fields);
    closeEditCategory();
  }

  // ── Product dialog handlers ─────────────────────────────────────────────

  function openAddProduct(defaultCategoryId: string) {
    setProductDialog({ open: true, mode: 'add', defaultCategoryId });
  }

  function openEditProduct(product: Product) {
    setProductDialog({ open: true, mode: 'edit', product });
  }

  function closeProductDialog() {
    setProductDialog({ open: false });
  }

  async function handleProductSave(fields: ProductFields, productId?: string): Promise<void> {
    if (productId) {
      await onEditProduct(productId, fields);
    } else {
      await onAddProduct(fields);
    }
    closeProductDialog();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Staff read-only notice */}
      {!isOwner && (
        <Alert className="border-border bg-muted/40">
          <LockIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          <AlertTitle>Solo lectura</AlertTitle>
          <AlertDescription>
            Solo los propietarios pueden editar el menú. Estás viendo la carta
            en modo de solo lectura.
          </AlertDescription>
        </Alert>
      )}

      {/* Category sections */}
      <div className="flex flex-col gap-4" role="list" aria-label="Categorías del menú">
        {grouped.map((item, index) => (
          <div key={item.category.id} role="listitem">
            <CategorySection
              categoryWithProducts={item}
              index={index}
              currency={currency}
              isOwner={isOwner}
              onEditCategory={openEditCategory}
              onDeleteCategory={onDeleteCategory}
              onAddProduct={openAddProduct}
              onEditProduct={openEditProduct}
              onDeleteProduct={onDeleteProduct}
              onToggleAvailability={onToggleAvailability}
            />
          </div>
        ))}
      </div>

      {/* Add category — owner only (uncontrolled dialog with built-in trigger) */}
      {isOwner && (
        <div className="flex justify-start">
          <CategoryDialog
            mode={DIALOG_MODE.add}
            isMutating={isMutating}
            onSave={handleAddCategory}
          />
        </div>
      )}

      {/* Edit category — controlled dialog (no visible trigger; opened programmatically) */}
      {isOwner && (
        <CategoryDialog
          mode={DIALOG_MODE.edit}
          open={editCatState.open}
          onOpenChange={(next) => {
            if (!next) closeEditCategory();
          }}
          initialName={editCatState.currentName}
          categoryId={editCatState.categoryId}
          isMutating={isMutating}
          onSave={handleEditCategory}
        />
      )}

      {/* Product dialog — add & edit (controlled) */}
      <ProductDialog
        open={productDialog.open}
        onOpenChange={(next) => {
          if (!next) closeProductDialog();
        }}
        mode={productDialog.open ? productDialog.mode : DIALOG_MODE.add}
        product={productDialog.open && productDialog.mode === 'edit' ? productDialog.product : undefined}
        defaultCategoryId={
          productDialog.open && productDialog.mode === 'add'
            ? productDialog.defaultCategoryId
            : ''
        }
        categories={categories}
        isMutating={isMutating}
        onSave={handleProductSave}
      />
    </div>
  );
}
