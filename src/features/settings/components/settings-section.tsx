import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface SettingsSectionProps {
  title: string;
  description: string;
  accentClass?: string;
  children: ReactNode;
}

/**
 * A settings card section with a colored left-accent strip and
 * a header (title + description) above the content slot.
 */
export function SettingsSection({
  title,
  description,
  accentClass = 'bg-brand-emerald',
  children,
}: SettingsSectionProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Left accent strip */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${accentClass}`}
      />

      <CardHeader className="pl-6">
        <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="pl-6">{children}</CardContent>
    </Card>
  );
}
