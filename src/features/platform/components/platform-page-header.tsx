import type { ReactNode } from 'react';

interface PlatformPageHeaderProps {
  /** Small uppercase eyebrow above the title. */
  eyebrow: string;
  title: string;
  description: string;
  /** Optional action(s) rendered on the right (e.g. a "New plan" button). */
  action?: ReactNode;
}

/**
 * Shared page header for the platform section. Matches the bento-vibrante
 * visual language of the tenant pages but uses the violet brand accent to
 * signal the platform (SaaS-owner) plane. Pure presentational.
 */
export function PlatformPageHeader({
  eyebrow,
  title,
  description,
  action,
}: PlatformPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-violet">
          <span
            className="inline-block h-1.5 w-4 rounded-full bg-brand-violet"
            aria-hidden="true"
          />
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
