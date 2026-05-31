import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Protected dashboard shell.
 *
 * Structure:
 *   - AuthProvider wraps the entire subtree (client context, mock data for now)
 *   - Desktop: Sidebar (fixed left) + flex-col main area (Topbar + content)
 *   - Mobile: Topbar contains Sheet-based slide-in nav
 *
 * Auth gate: slot is intentionally left open here — the login redirect
 * will be added in Phase 2 (middleware or a client-side guard component).
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <div className="flex h-full min-h-screen bg-background">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
