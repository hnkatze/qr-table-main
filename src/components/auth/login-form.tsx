'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from 'lucide-react';
import { signInWithUsername } from '@/lib/auth/auth-actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string };

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Premium login form (client component).
 *
 * Sign-in is by username + password. The whole verification happens in the
 * signInWithUsername Server Action (resolve username→email, verify password,
 * mint a session cookie). On success it navigates to /dashboard.
 */
export function LoginForm() {
  const router = useRouter();

  // Stable id prefix for aria attributes — avoids hydration mismatch
  const uid = useId();
  const usernameId = `${uid}-username`;
  const passwordId = `${uid}-password`;
  const errorId = `${uid}-error`;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' });
  const [showPassword, setShowPassword] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): string | null {
    if (!username.trim()) return 'Ingresá tu usuario.';
    if (!password) return 'Ingresá tu contraseña.';
    return null;
  }

  // ── Submit handler ──────────────────────────────────────────────────────────

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validate();
    if (validationError !== null) {
      setStatus({ kind: 'error', message: validationError });
      return;
    }

    setStatus({ kind: 'submitting' });

    try {
      const result = await signInWithUsername(username, password);
      if (!result.ok) {
        setStatus({ kind: 'error', message: result.error });
        return;
      }
      // Session cookie is set — the Proxy will now allow the dashboard.
      router.push('/dashboard');
    } catch {
      setStatus({
        kind: 'error',
        message: 'Ocurrió un error. Intentá de nuevo.',
      });
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const isSubmitting = status.kind === 'submitting';
  const hasError = status.kind === 'error';
  const inputType = showPassword ? 'text' : 'password';

  return (
    <div className="auth-form-panel w-full max-w-sm sm:max-w-md">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="auth-animate-1 mb-10">
        {/* Mobile-only wordmark (brand panel hidden on mobile) */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          {/* Accent dot — echoes the brand panel emerald accent */}
          <span className="auth-accent-dot" aria-hidden="true" />
          <span className="text-sm font-semibold auth-tracking-brand uppercase text-muted-foreground">
            Mesa
          </span>
        </div>

        <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
          Bienvenido de vuelta
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresá con tu cuenta para continuar
        </p>
      </div>

      {/* ── Form ────────────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulario de inicio de sesión"
      >
        <div className="flex flex-col gap-5">
          {/* ── Error alert ─────────────────────────────────────────────────── */}
          {hasError && (
            <div className="auth-animate-error">
              <Alert
                variant="destructive"
                id={errorId}
                aria-live="assertive"
                className="border-destructive/30 bg-destructive/5"
              >
                <AlertCircle className="size-4" />
                <AlertDescription className="text-destructive">
                  {status.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* ── Username field ──────────────────────────────────────────────── */}
          <div className="auth-animate-2 flex flex-col gap-2">
            <Label htmlFor={usernameId} className="text-sm font-medium text-foreground/80">
              Usuario
            </Label>
            <div className="auth-input-wrapper relative">
              <User
                className="auth-input-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60"
                aria-hidden="true"
              />
              <Input
                id={usernameId}
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="tuusuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                aria-describedby={hasError ? errorId : undefined}
                aria-invalid={hasError}
                required
                className="auth-input pl-9 h-11 text-sm"
              />
            </div>
          </div>

          {/* ── Password field ──────────────────────────────────────────────── */}
          <div className="auth-animate-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={passwordId} className="text-sm font-medium text-foreground/80">
                Contraseña
              </Label>
              {/* Placeholder — forgot-password flow not implemented yet */}
              <a
                href="#"
                className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 motion-reduce:transition-none"
                aria-label="¿Olvidaste tu contraseña? (próximamente)"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="auth-input-wrapper relative">
              <Lock
                className="auth-input-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60"
                aria-hidden="true"
              />
              <Input
                id={passwordId}
                type={inputType}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                aria-describedby={hasError ? errorId : undefined}
                aria-invalid={hasError}
                required
                className="auth-input pl-9 pr-10 h-11 text-sm"
              />
              {/* Password visibility toggle */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isSubmitting}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 disabled:pointer-events-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* ── Submit button ───────────────────────────────────────────────── */}
          <div className="auth-animate-4 pt-1">
            <Button
              type="submit"
              size="lg"
              className="auth-submit-btn w-full h-11 text-sm font-semibold tracking-wide"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span>Ingresando…</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* ── Footer divider ──────────────────────────────────────────────────── */}
      <p className="auth-animate-5 mt-10 text-center text-xs auth-tracking-meta uppercase text-muted-foreground/40">
        Mesa · Gestión de restaurantes
      </p>
    </div>
  );
}
