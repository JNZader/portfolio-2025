import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroBackground } from '@/components/ui/HeroBackground';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      <HeroBackground showBlobs showDotPattern={false} />

      <div className="text-center space-y-6 relative z-10">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="text-muted-foreground">La página que buscas no existe o fue movida.</p>
        <Button asChild className="mt-8">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
