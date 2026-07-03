import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NewsletterBroadcaster } from '@/components/admin/NewsletterBroadcaster';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { auth } from '@/lib/auth';

export default async function AdminNewsletterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  if (!session.user.isAdmin) {
    redirect('/admin/unauthorized');
  }

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" className="pl-0 gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Newsletter</h1>
        <p className="mt-1 text-muted-foreground">
          Envía actualizaciones a todos tus suscriptores activos.
        </p>
      </div>

      <NewsletterBroadcaster />
    </Container>
  );
}
