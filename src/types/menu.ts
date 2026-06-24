export interface Category {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  emoji?: string;
  /** Public URL of the product photo in Firebase Storage (WebP). Optional. */
  imageUrl?: string;
}
