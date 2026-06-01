import type { Category, Product } from '@/features/menu/types';

/**
 * Mock menu data scoped to this feature.
 * Lives here (not in src/lib/mock-data.ts) so the Menu feature is
 * self-contained and shared mock data stays clean.
 *
 * When Firestore lands, delete this file and replace with real listeners.
 */

// ─── La Ceiba (rest_a_001) ────────────────────────────────────────────────────

export const MOCK_CATEGORIES_A: Category[] = [
  { id: 'cat_a_1', slug: 'entradas', name: 'Entradas', sortOrder: 1 },
  { id: 'cat_a_2', slug: 'platos-fuertes', name: 'Platos fuertes', sortOrder: 2 },
  { id: 'cat_a_3', slug: 'bebidas', name: 'Bebidas', sortOrder: 3 },
  { id: 'cat_a_4', slug: 'postres', name: 'Postres', sortOrder: 4 },
];

export const MOCK_PRODUCTS_A: Product[] = [
  {
    id: 'prod_a_01',
    categoryId: 'cat_a_1',
    name: 'Yuca frita con chimol',
    description: 'Yuca crujiente acompañada de chimol hondureño fresco.',
    price: 85,
    available: true,
    emoji: '🍟',
  },
  {
    id: 'prod_a_02',
    categoryId: 'cat_a_1',
    name: 'Sopa de caracol',
    description: 'Caldo cremoso de caracol con leche de coco y vegetales.',
    price: 130,
    available: true,
    emoji: '🍲',
  },
  {
    id: 'prod_a_03',
    categoryId: 'cat_a_2',
    name: 'Baleada especial',
    description: 'Tortilla de harina con frijoles, mantequilla, queso, huevo y aguacate.',
    price: 95,
    available: true,
    emoji: '🌮',
  },
  {
    id: 'prod_a_04',
    categoryId: 'cat_a_2',
    name: 'Pollo en salsa de tamarindo',
    description: 'Pechuga a la plancha glaseada con salsa de tamarindo y jengibre.',
    price: 175,
    available: true,
    emoji: '🍗',
  },
  {
    id: 'prod_a_05',
    categoryId: 'cat_a_2',
    name: 'Tapado de mariscos',
    description: 'Guiso costero de mariscos en caldo de coco con plátanos maduros.',
    price: 220,
    available: false,
    emoji: '🦐',
  },
  {
    id: 'prod_a_06',
    categoryId: 'cat_a_3',
    name: 'Fresco de tamarindo',
    description: 'Refresco natural de tamarindo con agua y azúcar de caña.',
    price: 40,
    available: true,
    emoji: '🥤',
  },
  {
    id: 'prod_a_07',
    categoryId: 'cat_a_3',
    name: 'Horchata',
    description: 'Bebida artesanal de arroz, canela y vainilla.',
    price: 45,
    available: true,
    emoji: '🥛',
  },
  {
    id: 'prod_a_08',
    categoryId: 'cat_a_3',
    name: 'Café de olla',
    description: 'Café negro hondureño preparado en olla de barro.',
    price: 35,
    available: true,
    emoji: '☕',
  },
  {
    id: 'prod_a_09',
    categoryId: 'cat_a_4',
    name: 'Pastel tres leches',
    description: 'Bizcocho esponjoso bañado en mezcla de tres leches y crema chantilly.',
    price: 75,
    available: true,
    emoji: '🍰',
  },
  {
    id: 'prod_a_10',
    categoryId: 'cat_a_4',
    name: 'Buñuelos de yuca',
    description: 'Buñuelos tradicionales de yuca con miel de caña.',
    price: 60,
    available: false,
    emoji: '🍩',
  },
];

// ─── El Mercado (rest_b_002) ──────────────────────────────────────────────────

export const MOCK_CATEGORIES_B: Category[] = [
  { id: 'cat_b_1', slug: 'desayunos', name: 'Desayunos', sortOrder: 1 },
  { id: 'cat_b_2', slug: 'almuerzos', name: 'Almuerzos', sortOrder: 2 },
  { id: 'cat_b_3', slug: 'jugos', name: 'Jugos naturales', sortOrder: 3 },
];

export const MOCK_PRODUCTS_B: Product[] = [
  {
    id: 'prod_b_01',
    categoryId: 'cat_b_1',
    name: 'Desayuno típico',
    description: 'Huevos al gusto, frijoles, queso, crema y tortillas.',
    price: 110,
    available: true,
    emoji: '🍳',
  },
  {
    id: 'prod_b_02',
    categoryId: 'cat_b_1',
    name: 'Tamales de elote',
    description: 'Tamales dulces de maíz tierno envueltos en hoja de milpa.',
    price: 30,
    available: true,
    emoji: '🌽',
  },
  {
    id: 'prod_b_03',
    categoryId: 'cat_b_2',
    name: 'Sopa de res',
    description: 'Caldo de res con verduras frescas y tortillas recién hechas.',
    price: 160,
    available: true,
    emoji: '🥩',
  },
  {
    id: 'prod_b_04',
    categoryId: 'cat_b_3',
    name: 'Jugo de naranja',
    price: 40,
    available: true,
    emoji: '🍊',
  },
  {
    id: 'prod_b_05',
    categoryId: 'cat_b_3',
    name: 'Licuado de mango',
    description: 'Mango natural con leche o agua, sin azúcar añadida.',
    price: 50,
    available: true,
    emoji: '🥭',
  },
];

// ─── Index by restaurantId ─────────────────────────────────────────────────────

export const MOCK_CATEGORIES_BY_RESTAURANT: Record<string, Category[]> = {
  rest_a_001: MOCK_CATEGORIES_A,
  rest_b_002: MOCK_CATEGORIES_B,
};

export const MOCK_PRODUCTS_BY_RESTAURANT: Record<string, Product[]> = {
  rest_a_001: MOCK_PRODUCTS_A,
  rest_b_002: MOCK_PRODUCTS_B,
};
