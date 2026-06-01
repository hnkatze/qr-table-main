'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useIsPlatformAdmin } from '@/lib/auth/auth-context';

/**
 * Client-side guard for the platform (SaaS-owner) section.
 *
 * The Proxy (proxy.ts) only does an optimistic cookie check — it cannot know
 * the user's platformRole. So platform routes are gated HERE: a non-admin who
 * navigates to /platform/* is bounced to /dashboard.
 *
 * This runs inside the (dashboard) layout, so it already lives within
 * <AuthProvider> and shares the sidebar/topbar shell.
 *
 * TODO: when real auth lands, also enforce this server-side (layout Server
 * Component reading the verified session) — a client guard alone is not security.
 */
export default function PlatformLayout({ children }: { children: ReactNode }) {
  const isPlatformAdmin = useIsPlatformAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isPlatformAdmin) {
      router.replace('/dashboard');
    }
  }, [isPlatformAdmin, router]);

  if (!isPlatformAdmin) {
    // Avoid flashing platform content to a non-admin during the redirect.
    return null;
  }

  return <>{children}</>;
}
