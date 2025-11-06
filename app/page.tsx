export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="text-center space-y-6">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Portfolio 2025
                </h1>

                <p className="text-xl text-foreground/80 max-w-2xl">
                    Next.js 16.0 • React 19.2 • TypeScript 5.9 • Tailwind CSS 4.1
                </p>

                <div className="flex gap-4 justify-center mt-8">
                    <div className="px-4 py-2 bg-primary/10 rounded-lg">
                        <p className="text-sm font-mono">✓ Setup completo</p>
                    </div>
                    <div className="px-4 py-2 bg-green-500/10 rounded-lg">
                        <p className="text-sm font-mono">✓ TypeScript estricto</p>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/10 rounded-lg">
                        <p className="text-sm font-mono">✓ Tailwind 4</p>
                    </div>
                </div>

                <div className="mt-12 p-6 border border-foreground/10 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold mb-4">Prueba de Dark Mode</h2>
                    <p className="text-sm text-foreground/60">
                        Cambia el modo de tu sistema operativo para ver el dark mode en acción.
                    </p>
                </div>
            </div>
        </main>
    );
}