import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Premium split-screen auth layout.
 *
 * Breakpoint progression (mobile-first):
 *   base (<640)  : single column — compact dark header bar, form full-width
 *   sm  (≥640)   : form gains max-width, centers with auto margins
 *   md  (≥768)   : form panel padding and vertical rhythm step up
 *   lg  (≥1024)  : split-screen activates — brand panel (2/5) + form panel (3/5)
 *   xl  (≥1280)  : brand panel grows (5/12) for better composition balance
 *
 * AuthProvider is intentionally NOT wrapping here; auth pages are public.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ── Brand panel (lg+) ─────────────────────────────────────────────────── */}
      <aside
        className="auth-brand-bg relative hidden overflow-hidden lg:flex lg:w-2/5 xl:w-5/12 lg:flex-col lg:justify-between"
        aria-hidden="true"
      >
        {/* Layered chromatic glow orbs — emerald/violet/sky/amber */}
        <div className="auth-glow-emerald" />
        <div className="auth-glow-violet" />
        <div className="auth-glow-sky" />
        <div className="auth-glow-amber" />

        {/* Fine grid texture for depth and structure */}
        <div className="auth-grid-texture absolute inset-0 opacity-5" />

        {/* Edge vignette — keeps corners dark for text legibility */}
        <div className="auth-panel-vignette" />

        {/* Top wordmark */}
        <div className="relative z-10 px-12 pt-12 xl:px-16 xl:pt-16">
          <div className="flex items-center gap-3">
            {/* QR motif icon — CSS-drawn grid, emerald-tinted */}
            <div className="auth-qr-icon" role="img" aria-label="Mesa logo" />
            <span className="text-2xl font-semibold auth-tracking-brand text-white/90 uppercase">
              Mesa
            </span>
          </div>
        </div>

        {/* Center headline */}
        <div className="relative z-10 px-12 xl:px-16">
          {/* Emerald→sky accent line above the eyebrow */}
          <span className="auth-eyebrow-line" aria-hidden="true" />
          <p className="text-xs font-semibold auth-tracking-eyebrow uppercase text-white/50 mb-5">
            Panel de Administración
          </p>
          <h1 className="text-4xl xl:text-5xl font-light leading-tight tracking-tight text-white/95">
            Gestioná tu<br />
            <em className="font-semibold not-italic text-white">restaurante</em><br />
            con precisión.
          </h1>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">
            Menús digitales, pedidos por QR y análisis en tiempo real —
            todo desde un solo lugar.
          </p>
        </div>

        {/* Bottom metadata strip */}
        <div className="relative z-10 flex items-center justify-between px-12 pb-10 xl:px-16 text-xs auth-tracking-meta uppercase text-white/25">
          <span>Mesa © 2025</span>
          <span className="flex items-center gap-1.5">
            {/* Emerald dot accent */}
            <span className="inline-block size-1.5 rounded-full bg-emerald-400/60" />
            QR · Pedidos · Análisis
          </span>
        </div>
      </aside>

      {/* ── Mobile compact header (< lg) ──────────────────────────────────────── */}
      <header className="auth-mobile-header flex items-center gap-3 px-6 py-5 lg:hidden">
        <div className="auth-qr-icon-sm relative z-10" role="img" aria-label="Mesa" />
        <span className="relative z-10 text-sm font-semibold auth-tracking-brand text-white/90 uppercase">
          Mesa
        </span>
      </header>

      {/* ── Form panel ────────────────────────────────────────────────────────── */}
      {/*
        base : px-5 py-10 — comfortable mobile padding
        sm   : px-8 py-12 — form starts breathing more
        md   : px-12 py-16 — tablet gets generous room
        lg   : flex-1, padding from md values (panel split handles width)
        xl   : px-16 py-20 — desktop feels open, not cramped
      */}
      <main className="flex flex-1 items-center justify-center bg-background px-5 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16 xl:px-16 xl:py-20">
        {children}
      </main>
    </div>
  );
}
