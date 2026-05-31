'use client';

import { ShieldCheckIcon, UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Role } from '@/features/members/types';

interface RoleBadgeProps {
  role: Role;
}

const ROLE_CONFIG = {
  owner: {
    label: 'Propietario',
    icon: ShieldCheckIcon,
    className:
      'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/25 dark:bg-brand-emerald/15',
  },
  staff: {
    label: 'Personal',
    icon: UserIcon,
    className:
      'bg-brand-sky/10 text-brand-sky border-brand-sky/25 dark:bg-brand-sky/15',
  },
} as const satisfies Record<Role, { label: string; icon: typeof ShieldCheckIcon; className: string }>;

/**
 * Renders a role badge with distinct visual treatment for owner vs. staff.
 * Uses both text AND icon AND color (never color alone) to meet a11y requirements.
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  const { label, icon: Icon, className } = ROLE_CONFIG[role];

  return (
    <Badge variant="outline" className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
