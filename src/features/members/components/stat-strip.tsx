import { UsersIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import type { MemberRow } from '@/features/members/types';

// ─── StatTile ─────────────────────────────────────────────────────────────────

interface StatTileProps {
  icon: React.ElementType;
  label: string;
  value: number;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  /** Ring color for the icon chip — a `ring-*` class (NOT a `border-*` class). */
  colorRing: string;
}

function StatTile({ icon: Icon, label, value, colorBg, colorText, colorBorder, colorRing }: StatTileProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colorBg} ${colorBorder} transition-shadow duration-200 hover:shadow-sm`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${colorBg} ring-1 ring-inset ${colorRing}`}
        aria-hidden="true"
      >
        <Icon className={`size-4 ${colorText}`} />
      </span>
      <div>
        <p className={`text-xl font-bold leading-none ${colorText}`}>{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── StatStrip ────────────────────────────────────────────────────────────────

interface StatStripProps {
  members: MemberRow[];
  restaurantName: string;
}

/**
 * Three-tile stat strip: total / owners / staff counts.
 * Pure presentational — derives counts from the members array prop.
 */
export function StatStrip({ members, restaurantName }: StatStripProps) {
  const ownerCount = members.filter((m) => m.role === 'owner').length;
  const staffCount = members.filter((m) => m.role === 'staff').length;

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      aria-label={`Estadísticas de miembros de ${restaurantName}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <StatTile
        icon={UsersIcon}
        label="Total de miembros"
        value={members.length}
        colorBg="bg-muted/60"
        colorText="text-foreground"
        colorBorder="border-border"
        colorRing="ring-border"
      />
      <StatTile
        icon={ShieldCheckIcon}
        label="Propietarios"
        value={ownerCount}
        colorBg="bg-brand-emerald/10"
        colorText="text-brand-emerald"
        colorBorder="border-brand-emerald/20"
        colorRing="ring-brand-emerald/20"
      />
      <StatTile
        icon={UserIcon}
        label="Personal"
        value={staffCount}
        colorBg="bg-brand-sky/10"
        colorText="text-brand-sky"
        colorBorder="border-brand-sky/20"
        colorRing="ring-brand-sky/20"
      />
    </div>
  );
}
