'use client';

import { useId } from 'react';
import {
  SaveIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ImageIcon,
  LockIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SettingsSection } from './settings-section';
import { useProfileForm, isCurrencyCode } from '../hooks/use-profile-form';
import { CURRENCY_OPTIONS } from '../constants';
import type { Restaurant } from '@/types/restaurant';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileFormProps {
  restaurant: Restaurant;
  isOwner: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileForm({ restaurant, isOwner }: ProfileFormProps) {
  const { fields, saveState, isLoading, fieldDisabled, updateField, handleSubmit } =
    useProfileForm(restaurant, isOwner);

  // Stable IDs for a11y label → input association
  const nameId = useId();
  const slugId = useId();
  const slugHintId = useId();
  const taglineId = useId();
  const currencyId = useId();

  return (
    <form
      id="settings-profile-form"
      onSubmit={handleSubmit}
      aria-label="Perfil del restaurante"
      noValidate
    >
      <div className="flex flex-col gap-6">

        {/* ── Staff read-only notice ─────────────────────────────────────── */}
        {!isOwner && (
          <Alert className="border-border bg-muted/40">
            <LockIcon aria-hidden="true" className="size-4 text-muted-foreground" />
            <AlertTitle>Solo lectura</AlertTitle>
            <AlertDescription>
              Solo los propietarios pueden editar la configuración. Estás viendo
              la información en modo de solo lectura.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Save feedback (live region) ────────────────────────────────── */}
        <div aria-live="polite" aria-atomic="true">
          {saveState.status === 'success' && (
            <Alert className="border-brand-emerald/30 bg-brand-emerald/10">
              <CheckCircle2Icon
                aria-hidden="true"
                className="size-4 text-brand-emerald"
              />
              <AlertTitle>Cambios guardados</AlertTitle>
              <AlertDescription>{saveState.message}</AlertDescription>
            </Alert>
          )}

          {saveState.status === 'error' && (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden="true" className="size-4" />
              <AlertTitle>Error al guardar</AlertTitle>
              <AlertDescription>{saveState.message}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* ── Section 1: Identidad ──────────────────────────────────────── */}
        <SettingsSection
          title="Identidad"
          description="El nombre y el slug son la cara pública de tu restaurante."
          accentClass="bg-brand-emerald"
        >
          <fieldset className="border-0 m-0 p-0" disabled={fieldDisabled}>
            <legend className="sr-only">Datos de identidad del restaurante</legend>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Name — spans both columns */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor={nameId}>
                  Nombre del restaurante{' '}
                  <span aria-hidden="true" className="text-destructive">*</span>
                </Label>
                <Input
                  id={nameId}
                  type="text"
                  value={fields.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Ej. La Ceiba"
                  required
                  autoComplete="organization"
                  disabled={fieldDisabled}
                  className="h-9 text-sm"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={slugId}>
                  Slug{' '}
                  <span aria-hidden="true" className="text-destructive">*</span>
                </Label>
                <Input
                  id={slugId}
                  type="text"
                  value={fields.slug}
                  onChange={(e) =>
                    updateField(
                      'slug',
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                    )
                  }
                  placeholder="la-ceiba"
                  required
                  pattern="[a-z0-9][a-z0-9-]*"
                  aria-describedby={slugHintId}
                  disabled={fieldDisabled}
                  className="h-9 font-mono text-sm"
                />
                <p id={slugHintId} className="text-xs text-muted-foreground">
                  Menú público en{' '}
                  <span className="font-medium text-foreground">
                    /r/{fields.slug || 'tu-slug'}
                  </span>
                </p>
              </div>

              {/* Tagline */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={taglineId}>
                  Tagline{' '}
                  <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  id={taglineId}
                  type="text"
                  value={fields.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="Ej. Sabores hondureños auténticos"
                  disabled={fieldDisabled}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </fieldset>
        </SettingsSection>

        {/* ── Section 2: Configuración regional ────────────────────────── */}
        <SettingsSection
          title="Configuración regional"
          description="La moneda define cómo se muestran los precios en el menú y en los reportes."
          accentClass="bg-brand-sky"
        >
          <fieldset className="border-0 m-0 p-0" disabled={fieldDisabled}>
            <legend className="sr-only">Configuración regional del restaurante</legend>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={currencyId}>Moneda</Label>
                <Select
                  value={fields.currency}
                  onValueChange={(val) => {
                    if (val && isCurrencyCode(val)) updateField('currency', val);
                  }}
                  disabled={fieldDisabled}
                >
                  <SelectTrigger
                    id={currencyId}
                    size="default"
                    className="h-9 w-full text-sm"
                    aria-label="Seleccioná la moneda del restaurante"
                  >
                    <SelectValue placeholder="Seleccioná la moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>
        </SettingsSection>

        {/* ── Section 3: Branding (placeholder) ────────────────────────── */}
        <SettingsSection
          title="Branding"
          description="Personalizá la apariencia de tu menú digital."
          accentClass="bg-brand-violet"
        >
          <div className="flex flex-col gap-4">
            {/* Logo upload affordance — mocked/disabled */}
            <div
              role="img"
              aria-label="Carga de logotipo no disponible aún"
              className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center"
            >
              <span
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-full bg-brand-violet/10"
              >
                <ImageIcon className="size-5 text-brand-violet" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Logo del restaurante
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG o SVG · Máx. 2 MB
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Próximamente
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              La carga de logo y la personalización de colores estarán
              disponibles en una próxima versión.
            </p>
          </div>
        </SettingsSection>

        {/* ── Sticky save bar (owner only) ──────────────────────────────── */}
        {isOwner && (
          <div
            className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {saveState.status === 'loading'
                  ? 'Guardando los cambios…'
                  : 'Los cambios no se guardan automáticamente.'}
              </p>
              <Button
                type="submit"
                size="default"
                disabled={isLoading}
                aria-label={
                  isLoading
                    ? 'Guardando cambios, por favor esperá'
                    : 'Guardar cambios del restaurante'
                }
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <SaveIcon aria-hidden="true" className="size-4" />
                )}
                {isLoading ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
