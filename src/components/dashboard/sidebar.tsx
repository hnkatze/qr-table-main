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
  Building2,
  CreditCard,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsPlatformAdmin } from '@/lib/auth/auth-context';

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  /** Optional heading rendered above the group (omitted for the main group). */
  heading?: string;
  items: NavItem[];
}

/** Tenant-scoped nav — what a restaurant owner/staff manages. */
const MAIN_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Órdenes', href: '/orders', icon: ClipboardList },
  { label: 'Menú', href: '/menu', icon: UtensilsCrossed },
  { label: 'Mesas', href: '/tables', icon: QrCode },
  { label: 'Usuarios', href: '/users', icon: Users },
  { label: 'Configuración', href: '/settings', icon: Settings },
  { label: 'Suscripción', href: '/subscription', icon: Receipt },
];

/** Platform-scoped nav — only visible to a platform admin (SaaS owner). */
const PLATFORM_ITEMS: NavItem[] = [
  { label: 'Comercios', href: '/platform/commerces', icon: Building2 },
  { label: 'Planes', href: '/platform/plans', icon: CreditCard },
  { label: 'Usuarios', href: '/platform/users', icon: ShieldCheck },
];

// ─── Single nav link ──────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, isActive, onNavigate }: NavLinkProps) {
  const { label, href, icon: Icon } = item;
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
          isActive
            ? 'sidebar-nav-active text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            isActive
              ? 'text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground'
          )}
          aria-hidden="true"
        />
        <span>{label}</span>
      </Link>
    </li>
  );
}

// ─── Nav items list (shared between sidebar and mobile sheet) ─────────────────

interface NavListProps {
  onNavigate?: () => void;
}

export function SidebarNavList({ onNavigate }: NavListProps) {
  const pathname = usePathname();
  const isPlatformAdmin = useIsPlatformAdmin();

  const sections: NavSection[] = [
    { items: MAIN_ITEMS },
    // Platform group is gated — a regular commerce never sees it.
    ...(isPlatformAdmin
      ? [{ heading: 'Plataforma', items: PLATFORM_ITEMS }]
      : []),
  ];

  return (
    <nav aria-label="Navegación principal" className="space-y-6">
      {sections.map((section, idx) => (
        <div key={section.heading ?? `section-${idx}`}>
          {section.heading && (
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              {section.heading}
            </p>
          )}
          <ul className="space-y-0.5" role="list">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  onNavigate={onNavigate}
                />
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside
      className="sidebar-surface hidden lg:flex flex-col w-60 shrink-0 border-r border-sidebar-border"
      aria-label="Panel de navegación"
    >
      {/* Logo / brand */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="sidebar-brand-dot" aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
          Mesa
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-sidebar-primary/90">
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
