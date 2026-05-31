'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Role } from '@/features/members/types';

interface MemberRoleSelectProps {
  currentRole: Role;
  memberId: string;
  onRoleChange: (memberId: string, newRole: Role) => void;
  disabled?: boolean;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'owner', label: 'Propietario' },
  { value: 'staff', label: 'Personal' },
];

/**
 * Inline role selector for a membership row.
 * Mock-only — calls onRoleChange which updates local state only.
 * TODO: wire Firestore membership update (update the `role` field on the membership document)
 */
export function MemberRoleSelect({
  currentRole,
  memberId,
  onRoleChange,
  disabled = false,
}: MemberRoleSelectProps) {
  return (
    <Select
      value={currentRole}
      onValueChange={(value) => onRoleChange(memberId, value as Role)}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label="Cambiar rol del miembro"
        className="min-w-[130px] border-border bg-background transition-colors hover:border-brand-emerald/40 focus-visible:ring-brand-emerald/30"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLE_OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
