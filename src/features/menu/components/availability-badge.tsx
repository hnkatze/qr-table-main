import { Badge } from '@/components/ui/badge';
import { CheckCircle2Icon, CircleOffIcon } from 'lucide-react';

interface AvailabilityBadgeProps {
  available: boolean;
}

/**
 * Static badge showing availability status.
 * Uses both color AND text AND icon — never color alone.
 */
export function AvailabilityBadge({ available }: AvailabilityBadgeProps) {
  return available ? (
    <Badge
      variant="outline"
      className="bg-brand-emerald/10 text-brand-emerald border-brand-emerald/25 dark:bg-brand-emerald/15"
    >
      <CheckCircle2Icon aria-hidden="true" className="size-3" />
      Disponible
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-muted/60 text-muted-foreground border-border"
    >
      <CircleOffIcon aria-hidden="true" className="size-3" />
      No disponible
    </Badge>
  );
}
