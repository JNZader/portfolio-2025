import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="text-center space-y-6">
                <h1 className="text-9xl font-bold text-primary">404</h1>
                <h2 className="text-3xl font-semibold">Página no encontrada</h2>
                <p className="text-foreground/60">
                    La página que buscas no existe o fue movida.
                </p>
                <Link
                    href="/"
                    className="inline-block mt-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}