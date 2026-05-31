import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Mesa',
  description: 'Accedé al panel de administración de tu restaurante.',
};

/**
 * Login route page.
 * Server component — renders the client LoginForm inside the auth layout.
 * URL: /login (route group (auth) does not affect the URL segment).
 */
export default function LoginPage() {
  return <LoginForm />;
}
