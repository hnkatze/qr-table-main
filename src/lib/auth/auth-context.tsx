'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Loader2 } from 'lucide-react';
import type { User } from '@/types/user';
import type { Restaurant } from '@/types/restaurant';
import type { Role, RestaurantMembership } from '@/types/membership';
import type { PlatformRole } from '@/types/platform';
import { hasPermission, type Permission } from '@/lib/permissions';
import { getCurrentUser, signOutAction } from '@/lib/auth/auth-actions';

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

// ─── Profile loading state ──────────────────────────────────────────────────

type ProfileState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'ready'; user: User; memberships: RestaurantMembership[] };

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

// ─── Loader ───────────────────────────────────────────────────────────────────

function AuthLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Cargando tu cuenta…</span>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<ProfileState>({ status: 'loading' });
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(
    null
  );

  // Load the authenticated profile from the verified session cookie on mount.
  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setProfile({ status: 'unauthenticated' });
          return;
        }
        setProfile({
          status: 'ready',
          user: result.user,
          memberships: result.memberships,
        });
        // Restore the active restaurant from localStorage, validated against the
        // user's real memberships; fall back to the first membership.
        const stored = readStoredRestaurantId();
        const isValid =
          stored !== null &&
          result.memberships.some((m) => m.restaurantId === stored);
        setActiveRestaurantId(
          isValid ? stored : result.memberships[0]?.restaurantId ?? null
        );
      })
      .catch(() => {
        if (!cancelled) setProfile({ status: 'unauthenticated' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // No valid session → clear the (possibly stale) cookie FIRST, then bounce to
  // login. Clearing is essential: the Proxy only checks cookie presence, so if
  // we redirect while an invalid cookie is still set, it bounces us back to the
  // dashboard and we loop. signOutAction() deletes it, breaking the cycle.
  useEffect(() => {
    if (profile.status === 'unauthenticated') {
      void signOutAction().finally(() => window.location.assign('/login'));
    }
  }, [profile.status]);

  // Derived, stable across renders so the callbacks/memos below don't churn.
  const currentUser = profile.status === 'ready' ? profile.user : null;
  const memberships = useMemo<RestaurantMembership[]>(
    () => (profile.status === 'ready' ? profile.memberships : []),
    [profile]
  );

  const setActiveRestaurant = useCallback(
    (restaurantId: string) => {
      const membership = memberships.find(
        (m) => m.restaurantId === restaurantId
      );
      if (!membership) return;
      setActiveRestaurantId(restaurantId);
      writeStoredRestaurantId(restaurantId);
    },
    [memberships]
  );

  const signOut = useCallback(() => {
    // Clear client state immediately, clear the server cookie, then hard-navigate
    // so the Proxy re-evaluates with the cookie already gone.
    setProfile({ status: 'unauthenticated' });
    setActiveRestaurantId(null);
    writeStoredRestaurantId(null);
    void signOutAction().finally(() => window.location.assign('/login'));
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

  // Gate rendering until the profile resolves so consumers always see a real
  // user (no null-currentUser flicker through the dashboard shell).
  if (profile.status !== 'ready') {
    return <AuthLoader />;
  }

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
