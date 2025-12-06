import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import Container from '@/components/ui/Container';
import { auth } from '@/lib/auth';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

  if (!session.user.isAdmin) {
    redirect('/admin/unauthorized');
  }

  return (
    <Container className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenido, {session.user.name || session.user.email}
          </p>
        </div>
      </div>

      <AdminDashboard user={session.user} />
    </Container>
  );
}
