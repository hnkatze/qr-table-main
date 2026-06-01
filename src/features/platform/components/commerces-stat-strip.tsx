import { Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { CommerceRow } from '@/features/platform/types';

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

interface CommercesStatStripProps {
  commerces: CommerceRow[];
}

/**
 * Four-tile stat strip: total / active / trialing / at-risk (past_due+canceled).
 * Pure presentational — derives counts from the commerces array prop.
 */
export function CommercesStatStrip({ commerces }: CommercesStatStripProps) {
  const active = commerces.filter((c) => c.status === 'active').length;
  const trialing = commerces.filter((c) => c.status === 'trialing').length;
  const atRisk = commerces.filter(
    (c) => c.status === 'past_due' || c.status === 'canceled'
  ).length;

  return (
    <div
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      aria-label="Estadísticas de comercios"
      aria-live="polite"
      aria-atomic="true"
    >
      <StatTile
        icon={Building2}
        label="Comercios"
        value={commerces.length}
        colorBg="bg-muted/60"
        colorText="text-foreground"
        colorBorder="border-border"
        colorRing="ring-border"
      />
      <StatTile
        icon={CheckCircle2}
        label="Activos"
        value={active}
        colorBg="bg-brand-emerald/10"
        colorText="text-brand-emerald"
        colorBorder="border-brand-emerald/20"
        colorRing="ring-brand-emerald/20"
      />
      <StatTile
        icon={Clock}
        label="En prueba"
        value={trialing}
        colorBg="bg-brand-sky/10"
        colorText="text-brand-sky"
        colorBorder="border-brand-sky/20"
        colorRing="ring-brand-sky/20"
      />
      <StatTile
        icon={AlertTriangle}
        label="En riesgo"
        value={atRisk}
        colorBg="bg-brand-amber/10"
        colorText="text-brand-amber"
        colorBorder="border-brand-amber/20"
        colorRing="ring-brand-amber/20"
      />
    </div>
  );
}
