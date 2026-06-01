import type { Category, Product } from '@/types/menu';

// ─── Re-export domain types for convenience ───────────────────────────────────

export type { Category, Product };

// ─── View model: category with its products ───────────────────────────────────

export interface CategoryWithProducts {
  category: Category;
  products: Product[];
}

// ─── Async save state (discriminated union) ───────────────────────────────────

export type MutationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

// ─── Category form fields ─────────────────────────────────────────────────────

export interface CategoryFields {
  name: string;
}

// ─── Product form fields ──────────────────────────────────────────────────────

export interface ProductFields {
  name: string;
  description: string;
  price: string; // string for controlled input; parsed to number before persistence
  emoji: string;
  available: boolean;
  categoryId: string;
}
