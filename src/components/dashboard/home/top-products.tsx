/**
 * TopProducts — a ranked list bento block.
 *
 * Shows the top-selling products with:
 *  - rank number
 *  - emoji + product name
 *  - order count
 *  - thin progress bar (proportional to the top item)
 *
 * Purely presentational — receives typed data from the page.
 */

import { BentoCard } from './bento-card';

export interface TopProductItem {
  id: string;
  emoji: string;
  name: string;
  count: number;
}

interface TopProductsProps {
  items: readonly TopProductItem[];
  delayClass?: string;
}

export function TopProducts({ items, delayClass }: TopProductsProps) {
  const max = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 1;

  return (
    <BentoCard
      colSpan="col-span-1 sm:col-span-1 lg:col-span-1"
      rowSpan="row-span-2"
      accentFrom="from-violet-500/10"
      accentTo="to-purple-500/5"
      delayClass={delayClass}
      ariaLabel="Top productos"
    >
      <div className="flex flex-col gap-4 p-5 h-full">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Top Productos
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-foreground">
            Más pedidos hoy
          </h2>
        </div>

        <ol className="flex flex-col gap-3" aria-label="Ranking de productos">
          {items.map((item, idx) => {
            const pct = max > 0 ? Math.round((item.count / max) * 100) : 0;
            return (
              <li key={item.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {/* Rank */}
                  <span
                    aria-hidden="true"
                    className="w-4 shrink-0 text-right text-xs font-bold text-muted-foreground/60"
                  >
                    {idx + 1}
                  </span>
                  {/* Emoji */}
                  <span aria-hidden="true" className="text-base leading-none">
                    {item.emoji}
                  </span>
                  {/* Name */}
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  {/* Count */}
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    {item.count}x
                  </span>
                </div>
                {/* Progress bar */}
                <div
                  className="ml-6 h-1 overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950/40"
                  role="presentation"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </BentoCard>
  );
}
