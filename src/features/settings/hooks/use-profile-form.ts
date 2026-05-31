import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Restaurant } from '@/types/restaurant';
import { CURRENCY_OPTIONS } from '../constants';
import { restaurantToFormFields } from '../mappers/profile.mapper';
import { saveProfile } from '../services/profile.service';
import type { FormFields, CurrencyCode, SaveState } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_OPTIONS.some((opt) => opt.value === value);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseProfileFormReturn {
  fields: FormFields;
  saveState: SaveState;
  isLoading: boolean;
  fieldDisabled: boolean;
  updateField: <K extends keyof FormFields>(key: K, value: FormFields[K]) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

/**
 * Owns the form field state + the SaveState machine + the submit handler.
 * The component is a thin presentational consumer of this hook.
 */
export function useProfileForm(
  restaurant: Restaurant,
  isOwner: boolean
): UseProfileFormReturn {
  const [fields, setFields] = useState<FormFields>(() =>
    restaurantToFormFields(restaurant)
  );
  const [saveState, setSaveState] = useState<SaveState>({ status: 'idle' });

  const isLoading = saveState.status === 'loading';
  const fieldDisabled = !isOwner || isLoading;

  function updateField<K extends keyof FormFields>(key: K, value: FormFields[K]): void {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Dismiss feedback when user starts editing again
    if (saveState.status === 'success' || saveState.status === 'error') {
      setSaveState({ status: 'idle' });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!isOwner || isLoading) return;

    setSaveState({ status: 'loading' });

    try {
      await saveProfile(restaurant.id, fields);

      setSaveState({
        status: 'success',
        message: `Los cambios de "${fields.name}" se guardaron correctamente.`,
      });

      // Auto-dismiss success after 5 s so the live region doesn't linger
      window.setTimeout(() => {
        setSaveState((prev) => (prev.status === 'success' ? { status: 'idle' } : prev));
      }, 5_000);
    } catch {
      setSaveState({
        status: 'error',
        message: 'No se pudo guardar. Revisá tu conexión e intentá de nuevo.',
      });
    }
  }

  return { fields, saveState, isLoading, fieldDisabled, updateField, handleSubmit };
}
