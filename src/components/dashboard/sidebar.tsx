'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  QrCode,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Órdenes', href: '/orders', icon: ClipboardList },
  { label: 'Menú', href: '/menu', icon: UtensilsCrossed },
  { label: 'Mesas', href: '/tables', icon: QrCode },
  { label: 'Usuarios', href: '/users', icon: Users },
  { label: 'Configuración', href: '/settings', icon: Settings },
];

// ─── Nav items list (shared between sidebar and mobile sheet) ─────────────────

interface NavListProps {
  onNavigate?: () => void;
}

export function SidebarNavList({ onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal">
      <ul className="space-y-0.5" role="list">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-sidebar-primary-foreground'
                      : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
                  )}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar"
      aria-label="Panel de navegación"
    >
      {/* Logo / brand */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          Mesa
        </span>
        <span className="ml-1.5 text-xs font-medium text-muted-foreground">
          Admin
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNavList />
      </div>
    </aside>
  );
}
