'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, CopyIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionBadge } from '@/features/platform/components/subscription-badge';
import type { CommerceDetail } from '@/features/platform/types';

interface CommerceDetailHeaderProps {
  detail: CommerceDetail;
}

/**
 * Page header for the commerce drill-down: name, status badge, publicId token
 * with a copy button, and a back link to the commerces list.
 */
export function CommerceDetailHeader({ detail }: CommerceDetailHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { restaurant, status } = detail;

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(restaurant.publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="flex flex-col gap-4">
      {/* Back navigation */}
      <div>
        <Link
          href="/platform/commerces"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
        >
          <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
          Volver a comercios
        </Link>
      </div>

      {/* Title row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Eyebrow */}
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-violet">
            <span
              className="inline-block h-1.5 w-4 rounded-full bg-brand-violet"
              aria-hidden="true"
            />
            Plataforma · Comercio
          </p>

          {/* Name + status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {restaurant.name}
            </h1>
            <SubscriptionBadge status={status} />
          </div>

          {restaurant.tagline && (
            <p className="text-sm text-muted-foreground">{restaurant.tagline}</p>
          )}

          {/* publicId token */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">Public ID:</span>
            <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
              {restaurant.publicId}
            </code>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={copied ? 'Public ID copiado' : 'Copiar public ID'}
              onClick={handleCopy}
            >
              {copied ? (
                <CheckIcon className="size-3 text-brand-emerald" aria-hidden="true" />
              ) : (
                <CopyIcon className="size-3" aria-hidden="true" />
              )}
            </Button>
            {copied && (
              <span role="status" className="sr-only">
                Public ID copiado al portapapeles
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
