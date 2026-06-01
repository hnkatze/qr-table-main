'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { User } from '@/types/user';
import type { Restaurant } from '@/types/restaurant';
import type { Role, RestaurantMembership } from '@/types/membership';
import type { PlatformRole } from '@/types/platform';
import { hasPermission, type Permission } from '@/lib/permissions';
import {
  MOCK_CURRENT_USER,
  MOCK_CURRENT_USER_MEMBERSHIPS,
} from '@/lib/mock-data';
import { clearMockSession } from '@/lib/auth/session';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_RESTAURANT_KEY = 'mesa_active_restaurant_id';

// ─── Context shape ────────────────────────────────────────────────────────────

/**
 * Public API for useAuth().
 * Design intent: the internals (mock vs. Firebase) can change freely
 * as long as this surface stays stable.
 */
interface AuthContextValue {
  /** The currently authenticated user, or null if not signed in. */
  currentUser: User | null;
  /**
   * All restaurants the current user belongs to, each enriched with
   * the user's role in that restaurant.
   */
  memberships: RestaurantMembership[];
  /**
   * The restaurant the user is currently administering.
   * Null only before the context has initialized or if the user has no memberships.
   */
  activeRestaurant: Restaurant | null;
  /**
   * Switch the active restaurant by id.
   * Persists the selection to localStorage so a refresh keeps context.
   */
  setActiveRestaurant: (restaurantId: string) => void;
  /** Sign the user out. Clears local state and localStorage selection. */
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Safe localStorage helpers (SSR guard) ───────────────────────────────────

function readStoredRestaurantId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACTIVE_RESTAURANT_KEY);
  } catch {
    return null;
  }
}

function writeStoredRestaurantId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id === null) {
      window.localStorage.removeItem(ACTIVE_RESTAURANT_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_RESTAURANT_KEY, id);
    }
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded, etc.)
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // In production these will come from a Firebase Auth listener.
  // For now they're seeded from mock data.
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_CURRENT_USER);
  const [memberships] = useState<RestaurantMembership[]>(
    MOCK_CURRENT_USER_MEMBERSHIPS
  );

  /**
   * Initialize activeRestaurantId lazily so localStorage is only read
   * on the client (never on the server during SSR).
   * The initializer runs once on mount — no effect needed.
   */
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(
    () => {
      const stored = readStoredRestaurantId();
      const isValid =
        stored !== null &&
        MOCK_CURRENT_USER_MEMBERSHIPS.some((m) => m.restaurantId === stored);
      if (isValid) return stored;
      return MOCK_CURRENT_USER_MEMBERSHIPS[0]?.restaurantId ?? null;
    }
  );

  const setActiveRestaurant = useCallback(
    (restaurantId: string) => {
      const membership = memberships.find((m) => m.restaurantId === restaurantId);
      if (!membership) return;
      setActiveRestaurantId(restaurantId);
      writeStoredRestaurantId(restaurantId);
    },
    [memberships]
  );

  const signOut = useCallback(() => {
    console.log('[signout] clicked — clearing client state');
    // Clear client-side state immediately (optimistic).
    setCurrentUser(null);
    setActiveRestaurantId(null);
    writeStoredRestaurantId(null);
    // Clear the server-side session cookie, then HARD-navigate to login.
    // A hard navigation (not router.push) forces a fresh request so the Proxy
    // re-evaluates with the cookie already cleared — avoids the RSC-cache / redirect
    // race where /login still sees the old cookie and bounces back to /dashboard.
    // `.finally` guarantees we leave the dashboard even if the action rejects.
    // TODO: also call Firebase Auth signOut() and revoke the refresh token before
    // calling clearMockSession() once Firebase is wired.
    void clearMockSession()
      .then(() => console.log('[signout] clearMockSession resolved OK'))
      .catch((e) => console.error('[signout] clearMockSession FAILED', e))
      .finally(() => {
        console.log('[signout] hard-navigating to /login');
        window.location.assign('/login');
      });
  }, []);

  const activeRestaurant = useMemo<Restaurant | null>(() => {
    if (activeRestaurantId === null) return null;
    const membership = memberships.find(
      (m) => m.restaurantId === activeRestaurantId
    );
    return membership?.restaurant ?? null;
  }, [activeRestaurantId, memberships]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      memberships,
      activeRestaurant,
      setActiveRestaurant,
      signOut,
    }),
    [currentUser, memberships, activeRestaurant, setActiveRestaurant, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Access the auth context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

/**
 * Convenience hook: returns the current user's role in the active restaurant.
 * Returns null if there is no active restaurant or the user has no membership there.
 */
export function useActiveRole(): Role | null {
  const { currentUser, memberships, activeRestaurant } = useAuth();
  if (!currentUser || !activeRestaurant) return null;
  const membership = memberships.find(
    (m) =>
      m.userId === currentUser.id && m.restaurantId === activeRestaurant.id
  );
  return membership?.role ?? null;
}

/**
 * The current user's GLOBAL platform role (e.g. 'superadmin'), or null.
 * This is the plane ABOVE tenants — independent of the active restaurant.
 */
export function usePlatformRole(): PlatformRole | null {
  const { currentUser } = useAuth();
  return currentUser?.platformRole ?? null;
}

/** True when the current user is a platform-level administrator (SaaS owner). */
export function useIsPlatformAdmin(): boolean {
  return usePlatformRole() === 'superadmin';
}

/**
 * Whether the current user holds a capability, checked across BOTH planes:
 *   - platform permissions (`platform:*`) come from the global platformRole
 *   - tenant permissions (`tenant:*`) come from the active-restaurant role
 *
 * Permissions are namespaced, so OR-ing the two role lookups is correct: a
 * superadmin gets `platform:*`, an owner gets `tenant:*`, and a user who is
 * both gets both.
 */
export function useHasPermission(permission: Permission): boolean {
  const platformRole = usePlatformRole();
  const activeRole = useActiveRole();
  return (
    hasPermission(platformRole, permission) ||
    hasPermission(activeRole, permission)
  );
}
