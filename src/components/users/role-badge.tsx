'use client';

import { Badge } from '@/components/ui/badge';
import type { Role } from '@/types/membership';

interface RoleBadgeProps {
  role: Role;
}

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Propietario',
  staff: 'Personal',
};

/**
 * Renders a role badge with distinct visual treatment for owner vs. staff.
 * Uses both text AND color (never color alone) to meet a11y requirements.
 */
export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === 'owner') {
    return (
      <Badge
        variant="default"
        className="bg-primary/10 text-primary border-primary/20 dark:bg-primary/20"
      >
        {ROLE_LABELS[role]}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      {ROLE_LABELS[role]}
    </Badge>
  );
}
