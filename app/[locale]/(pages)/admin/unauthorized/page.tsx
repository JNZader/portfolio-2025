'use client';

import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';

export default function UnauthorizedPage() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <ShieldX className="h-8 w-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            Tu cuenta no tiene permisos para acceder al panel de administración. Contacta al
            administrador si crees que esto es un error.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-muted-foreground"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </Container>
  );
}
