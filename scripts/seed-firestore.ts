/**
 * Seed Firestore + Firebase Auth from the existing mock data.
 *
 * Run:  npm run seed
 * Needs: service-account.json in the project root (or FIREBASE_SERVICE_ACCOUNT).
 * Optional env: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (the login you will use).
 *
 * Design (matches the agreed model):
 *   - Firebase Auth holds ONLY the login (one user, used to sign in).
 *   - Firestore holds the whole domain: the user profile + role, the user's
 *     commerces (memberships), the restaurants, and per-restaurant data
 *     (zones, tables). Everything downstream is filtered by restaurantId.
 *
 * The Auth user is created with uid = MOCK_CURRENT_USER.id so the Auth uid, the
 * Firestore `users/{uid}` doc, and every `membership.userId` line up — no id
 * drift between the auth plane and the data plane.
 *
 * Idempotent: set() with known ids, so re-running overwrites cleanly.
 */

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import {
  MOCK_PLANS,
  MOCK_USERS,
  MOCK_CURRENT_USER,
  MOCK_RESTAURANTS,
  MOCK_MEMBERSHIPS,
  MOCK_ZONES_BY_RESTAURANT,
  MOCK_TABLES_BY_RESTAURANT,
} from '@/lib/mock-data';
import {
  MOCK_CATEGORIES_BY_RESTAURANT,
  MOCK_PRODUCTS_BY_RESTAURANT,
} from '@/features/menu/services/menu-mock-data';

const SEED_ADMIN_USERNAME =
  process.env.SEED_ADMIN_USERNAME ?? MOCK_CURRENT_USER.username;
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? MOCK_CURRENT_USER.email;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'mesa1234';

/** Create or update the single Auth login, pinning its uid to the mock user id. */
async function seedAuthUser(): Promise<void> {
  const uid = MOCK_CURRENT_USER.id;
  const payload = {
    email: SEED_ADMIN_EMAIL,
    password: SEED_ADMIN_PASSWORD,
    displayName: MOCK_CURRENT_USER.displayName,
  };

  try {
    await adminAuth.updateUser(uid, payload);
    console.log(`[seed] auth: updated ${uid} (${SEED_ADMIN_EMAIL})`);
  } catch {
    await adminAuth.createUser({ uid, ...payload });
    console.log(`[seed] auth: created ${uid} (${SEED_ADMIN_EMAIL})`);
  }
}

/** Batch-write a list of {id}-bearing docs into a top-level collection. */
async function seedCollection<TDoc extends { id: string }>(
  name: string,
  docs: readonly TDoc[]
): Promise<void> {
  const batch = adminDb.batch();
  for (const doc of docs) {
    batch.set(adminDb.collection(name).doc(doc.id), doc);
  }
  await batch.commit();
  console.log(`[seed] ${name}: ${docs.length} docs`);
}

async function main(): Promise<void> {
  await seedAuthUser();

  await seedCollection('plans', MOCK_PLANS);

  // Keep the seeded admin's username + email in sync with the login identity so
  // the Firestore profile, the username lookup, and Firebase Auth all agree.
  const users = MOCK_USERS.map((u) =>
    u.id === MOCK_CURRENT_USER.id
      ? { ...u, username: SEED_ADMIN_USERNAME, email: SEED_ADMIN_EMAIL }
      : u
  );
  await seedCollection('users', users);

  await seedCollection('restaurants', MOCK_RESTAURANTS);
  await seedCollection('memberships', MOCK_MEMBERSHIPS);

  // Zones already carry restaurantId. Tables are keyed by restaurant in the
  // mock, so stamp restaurantId on each table doc for query-by-restaurant.
  const zones = Object.values(MOCK_ZONES_BY_RESTAURANT).flat();
  await seedCollection('zones', zones);

  const tables = Object.entries(MOCK_TABLES_BY_RESTAURANT).flatMap(
    ([restaurantId, list]) => list.map((t) => ({ ...t, restaurantId }))
  );
  await seedCollection('tables', tables);

  // Menu — categories and products keyed by restaurant in the feature mock.
  const categories = Object.entries(MOCK_CATEGORIES_BY_RESTAURANT).flatMap(
    ([restaurantId, list]) => list.map((c) => ({ ...c, restaurantId }))
  );
  await seedCollection('categories', categories);

  const products = Object.entries(MOCK_PRODUCTS_BY_RESTAURANT).flatMap(
    ([restaurantId, list]) => list.map((p) => ({ ...p, restaurantId }))
  );
  await seedCollection('products', products);

  console.log('[seed] done ✓');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] FAILED', err);
    process.exit(1);
  });
