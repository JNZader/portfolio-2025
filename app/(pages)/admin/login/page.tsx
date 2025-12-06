'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Suspense } from 'react';
import { FaGithub } from 'react-icons/fa';
import Container from '@/components/ui/Container';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Error al iniciar sesión con GitHub',
    OAuthCallback: 'Error en la respuesta de GitHub',
    OAuthCreateAccount: 'Error al crear cuenta',
    EmailCreateAccount: 'Error al crear cuenta',
    Callback: 'Error en el proceso de autenticación',
    OAuthAccountNotLinked: 'El email ya está asociado a otra cuenta',
    EmailSignin: 'Error al enviar email',
    CredentialsSignin: 'Credenciales inválidas',
    SessionRequired: 'Debes iniciar sesión para acceder',
    Default: 'Error de autenticación',
  };

  return (
    <Container className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-2 text-muted-foreground">
            Inicia sesión con tu cuenta de GitHub para acceder al panel de administración.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-600 dark:text-red-400">
            {errorMessages[error] || errorMessages.Default}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => signIn('github', { callbackUrl })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#24292e] px-6 py-3 text-white transition-colors hover:bg-[#1a1e22] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-[#333] dark:hover:bg-[#444]"
          >
            <FaGithub className="h-5 w-5" />
            <span>Continuar con GitHub</span>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Solo usuarios autorizados pueden acceder al panel de administración.
        </p>
      </div>
    </Container>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <Container className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Cargando...</div>
        </Container>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
