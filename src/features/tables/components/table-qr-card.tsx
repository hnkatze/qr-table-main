'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon, Trash2Icon, ExternalLinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { buildAbsoluteTableUrl, buildQrImageUrl } from '@/features/tables/mappers/public-url.mapper';
import type { TableCard } from '@/features/tables/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TableQrCardProps {
  tableCard: TableCard;
  /** Slug needed to build the absolute URL (e.g., 'la-ceiba'). */
  restaurantSlug: string;
  restaurantName: string;
  isOwner: boolean;
  onDelete: (tableId: string) => void;
}

// ─── QR image sub-component ───────────────────────────────────────────────────

interface QrImageProps {
  absoluteUrl: string;
  tableNumber: number;
  restaurantName: string;
}

/**
 * Renders a QR code image via the public qrserver.com API.
 *
 * The `src` points to an external image endpoint that generates the QR on-demand.
 * The `alt` text is fully descriptive so screen-reader users know what the QR encodes.
 *
 * TODO: replace the `src` with a locally-generated QR (e.g., via the `qrcode` npm package
 * rendered to a data URL or <canvas>) to remove the external dependency, support
 * offline use, and allow custom colours / logo overlays.
 */
function QrImage({ absoluteUrl, tableNumber, restaurantName }: QrImageProps) {
  const qrSrc = buildQrImageUrl(absoluteUrl, 160);
  const altText = `Código QR de Mesa ${tableNumber} de ${restaurantName}. Apunta a: ${absoluteUrl}`;

  return (
    <div
      className="flex items-center justify-center rounded-xl bg-white p-3 ring-1 ring-border"
      aria-label={`QR de Mesa ${tableNumber}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrSrc}
        alt={altText}
        width={160}
        height={160}
        className="block size-40 object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

// ─── Copy link button ─────────────────────────────────────────────────────────

interface CopyLinkButtonProps {
  absoluteUrl: string;
  tableNumber: number;
}

/**
 * Copies the absolute customer URL to the clipboard.
 * Provides accessible feedback via aria-live for screen readers
 * and a brief visual state change for sighted users.
 */
function CopyLinkButton({ absoluteUrl, tableNumber }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      // Reset after 2 s so the button returns to its normal state
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Clipboard API blocked (non-secure context, permissions) — silent fail
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? `Enlace de Mesa ${tableNumber} copiado` : `Copiar enlace de Mesa ${tableNumber}`}
        className="gap-1.5 flex-1"
      >
        {copied ? (
          <CheckIcon aria-hidden="true" className="text-brand-emerald" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )}
        {copied ? 'Copiado' : 'Copiar enlace'}
      </Button>

      {/* Live region for screen-reader feedback on copy */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {copied ? `Enlace de Mesa ${tableNumber} copiado al portapapeles` : ''}
      </span>
    </>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

/**
 * Card for a single restaurant table.
 *
 * Shows:
 *   - Table number as the title
 *   - Customer relative URL as a descriptor
 *   - QR code image (external API — see QrImage TODO to swap for local generator)
 *   - Copy link button (accessible, aria-live feedback)
 *   - Open in new tab button
 *   - Delete button (owner-only)
 *
 * Firestore seams:
 *   - onDelete: currently updates local state only.
 *     TODO: wire Firestore table delete (delete document by tableId)
 */
export function TableQrCard({
  tableCard,
  restaurantSlug,
  restaurantName,
  isOwner,
  onDelete,
}: TableQrCardProps) {
  const { table, qrToken, customerUrl } = tableCard;
  // Absolute URL is built from the rotatable qrToken, never the display number.
  const absoluteUrl = buildAbsoluteTableUrl(restaurantSlug, qrToken);

  return (
    <article aria-label={`Mesa ${table.number}`}>
      <Card className="flex flex-col transition-shadow duration-200 hover:shadow-md h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <CardTitle className="text-lg font-bold">
                Mesa {table.number}
              </CardTitle>
              <CardDescription className="font-mono text-xs truncate">
                {customerUrl}
              </CardDescription>
            </div>

            {/* Accent chip */}
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-sky/10 text-sm font-bold text-brand-sky ring-1 ring-brand-sky/20"
              aria-hidden="true"
            >
              {table.number}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col items-center gap-4 pt-2">
          <QrImage
            absoluteUrl={absoluteUrl}
            tableNumber={table.number}
            restaurantName={restaurantName}
          />
        </CardContent>

        <CardFooter className="flex-wrap gap-2 pt-0 border-t-0 bg-transparent">
          <CopyLinkButton absoluteUrl={absoluteUrl} tableNumber={table.number} />

          <Button
            variant="outline"
            size="sm"
            aria-label={`Abrir enlace de Mesa ${table.number} en pestaña nueva`}
            onClick={() => window.open(absoluteUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLinkIcon aria-hidden="true" />
            <span className="sr-only">Abrir</span>
          </Button>

          {isOwner && (
            <Button
              variant="destructive"
              size="sm"
              aria-label={`Eliminar Mesa ${table.number}`}
              onClick={() => onDelete(table.id)}
            >
              <Trash2Icon aria-hidden="true" />
              <span className="sr-only">Eliminar</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </article>
  );
}
