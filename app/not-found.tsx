import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
