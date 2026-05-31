/**
 * Sparkline — lightweight SVG area/line micro-chart. Zero dependencies.
 * Renders a filled area path + a stroke line over a normalized dataset.
 * The SVG is purely decorative geometry; the chart meaning is conveyed
 * via aria-label on the wrapping element in the caller.
 */

export interface SparklineProps {
  /** Raw numeric data points (order: oldest → newest). Min 2 points. */
  data: readonly number[];
  /** Tailwind CSS colour class for the stroke line, e.g. "text-emerald-500" */
  strokeClass: string;
  /** Tailwind CSS colour class (with opacity) for the area fill, e.g. "text-emerald-500/20" */
  fillClass: string;
  /** Height in px of the SVG element — width is always 100% (responsive). */
  height?: number;
}

/** Normalizes an array to [0, 1] range. Returns 0.5 if all values are equal. */
function normalize(data: readonly number[]): number[] {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  if (range === 0) return data.map(() => 0.5);
  return data.map((v) => (v - min) / range);
}

export function Sparkline({
  data,
  strokeClass,
  fillClass,
  height = 48,
}: SparklineProps) {
  // viewBox width is fixed at 100; height is the prop.
  const vbW = 100;
  const vbH = height;
  // vertical padding so the stroke isn't clipped at top/bottom
  const padY = 4;

  const points = normalize(data);
  const stepX = vbW / (points.length - 1);

  // Build (x, y) pairs
  const coords: Array<[number, number]> = points.map((n, i) => [
    i * stepX,
    // invert Y: 0 = top (high values), vbH = bottom (low values)
    padY + (1 - n) * (vbH - padY * 2),
  ]);

  // Polyline points string
  const polyPoints = coords.map(([x, y]) => `${x},${y}`).join(' ');

  // Area path: down the right edge, across the bottom, back up the left
  const areaD =
    `M ${coords[0][0]},${coords[0][1]} ` +
    coords
      .slice(1)
      .map(([x, y]) => `L ${x},${y}`)
      .join(' ') +
    ` L ${coords[coords.length - 1][0]},${vbH} L ${coords[0][0]},${vbH} Z`;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="none"
      className={`w-full`}
      style={{ height }}
      aria-hidden="true"
    >
      {/* Area fill */}
      <path d={areaD} className={`fill-current ${fillClass}`} />
      {/* Stroke line */}
      <polyline
        points={polyPoints}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`stroke-current ${strokeClass}`}
      />
    </svg>
  );
}
