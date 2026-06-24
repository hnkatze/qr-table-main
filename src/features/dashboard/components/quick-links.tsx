'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  UtensilsCrossed,
  LayoutGrid,
  CreditCard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoCard } from '@/components/dashboard/home/bento-card';
import { QUICK_LINKS } from '@/features/dashboard/constants';
import type { QuickLink } from '@/features/dashboard/constants';

/**
 * Icon map — keyed by href so the constants stay JSON-serialisable.
 * LucideIcon components live here in the client component layer.
 */
const LINK_ICONS: Record<string, LucideIcon> = {
  '/orders': ShoppingBag,
  '/menu': UtensilsCrossed,
  '/tables': LayoutGrid,
  '/subscription': CreditCard,
};

interface QuickLinkCardProps extends QuickLink {
  delayClass?: string;
}

function QuickLinkCard({
  href,
  label,
  description,
  chipBg,
  accentText,
  accentFrom,
  accentTo,
  delayClass,
}: QuickLinkCardProps) {
  const Icon = LINK_ICONS[href];

  return (
    <BentoCard
      colSpan="col-span-1"
      accentFrom={accentFrom}
      accentTo={accentTo}
      delayClass={delayClass}
      ariaLabel={label}
    >
      <Link
        href={href}
        className={cn(
          'flex h-full flex-col gap-3 p-5',
          'transition-opacity hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl'
        )}
        aria-label={`${label} — ${description}`}
      >
        {/* Icon chip */}
        <span
          aria-hidden="true"
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            chipBg
          )}
        >
          {Icon && <Icon className="size-4 text-white" />}
        </span>

        {/* Text */}
        <div>
          <p className={cn('text-sm font-bold', accentText)}>{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </Link>
    </BentoCard>
  );
}

interface QuickLinksProps {
  delayClass?: string;
}

/**
 * QuickLinks — row of shortcut tiles to main admin sections.
 * Renders a responsive 2-col / 4-col grid.
 */
export function QuickLinks({ delayClass }: QuickLinksProps) {
  return (
    <section
      aria-label="Accesos rápidos"
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
    >
      {QUICK_LINKS.map((link, idx) => (
        <QuickLinkCard
          key={link.href}
          {...link}
          delayClass={delayClass ?? `bento-delay-${idx + 1}`}
        />
      ))}
    </section>
  );
}
