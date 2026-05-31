/**
 * SalesByHour — mini bar/area chart bento block.
 *
 * Pure SVG, zero dependencies.
 * Renders 12 hourly bar columns (8 AM – 7 PM) with a subtle SVG area overlay.
 * The current hour column is highlighted.
 * Accessible: role="img" + aria-label on the outer div describes the trend.
 */

import { BentoCard } from './bento-card';

export interface HourlyDataPoint {
  /** 0–23 hour */
  hour: number;
  /** Raw sales value */
  value: number;
}

interface SalesByHourProps {
  data: readonly HourlyDataPoint[];
  /** Formatted total label, e.g. "L 4,380.00" */
  totalLabel: string;
  delayClass?: string;
}

/** Format hour 0-23 to short AM/PM label */
function formatHour(h: number): string {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

export function SalesByHour({ data, totalLabel, delayClass }: SalesByHourProps) {
  const currentHour = new Date().getHours();
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value), 1) : 1;

  // SVG geometry — viewBox 100×40
  const vbW = 100;
  const vbH = 40;
  const padX = 2;
  const padY = 4;
  const availW = vbW - padX * 2;
  const availH = vbH - padY;
  const barW = availW / (data.length * 1.6); // bar width with gap
  const step = availW / data.length;

  // Area path coords
  const areaCoords = data.map((d, i) => {
    const x = padX + i * step + step / 2;
    const barH = (d.value / maxValue) * availH;
    const y = vbH - barH;
    return { x, y, barH, hour: d.hour, value: d.value };
  });

  const areaPath =
    areaCoords.length > 0
      ? `M ${areaCoords[0].x},${areaCoords[0].y} ` +
        areaCoords
          .slice(1)
          .map((c) => `L ${c.x},${c.y}`)
          .join(' ') +
        ` L ${areaCoords[areaCoords.length - 1].x},${vbH} L ${areaCoords[0].x},${vbH} Z`
      : '';

  return (
    <BentoCard
      colSpan="col-span-1 sm:col-span-2 lg:col-span-2"
      accentFrom="from-sky-500/10"
      accentTo="to-blue-500/5"
      delayClass={delayClass}
      ariaLabel="Ventas por hora del día"
    >
      <div className="flex flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Ventas por hora
            </p>
            <p className="mt-0.5 text-xl font-bold text-foreground">{totalLabel}</p>
          </div>
          <span className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
            Hoy
          </span>
        </div>

        {/* SVG chart */}
        <div
          role="img"
          aria-label={`Gráfica de ventas por hora. Total: ${totalLabel}`}
        >
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: 40 }}
            aria-hidden="true"
          >
            {/* Area fill */}
            {areaPath && (
              <path
                d={areaPath}
                className="fill-sky-500/10 dark:fill-sky-400/10"
              />
            )}
            {/* Bars */}
            {areaCoords.map(({ x, y, barH, hour }) => {
              const isCurrent = hour === currentHour;
              return (
                <rect
                  key={hour}
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="1"
                  className={
                    isCurrent
                      ? 'fill-sky-500 dark:fill-sky-400'
                      : 'fill-sky-300/60 dark:fill-sky-600/50'
                  }
                />
              );
            })}
            {/* Area stroke line */}
            {areaCoords.length > 1 && (
              <polyline
                points={areaCoords.map((c) => `${c.x},${c.y}`).join(' ')}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-sky-500 dark:stroke-sky-400"
              />
            )}
          </svg>
        </div>

        {/* Hour axis labels — show every 3rd */}
        <div className="flex justify-between" aria-hidden="true">
          {data
            .filter((_, i) => i % 3 === 0)
            .map((d) => (
              <span key={d.hour} className="text-xs text-muted-foreground/60">
                {formatHour(d.hour)}
              </span>
            ))}
        </div>
      </div>
    </BentoCard>
  );
}
