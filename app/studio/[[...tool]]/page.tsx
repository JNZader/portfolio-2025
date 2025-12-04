/**
 * Sanity Studio
 * Accesible en /studio
 * Uses dynamic import to reduce main bundle size (~2MB saved)
 */
import dynamic from 'next/dynamic';

const StudioComponent = dynamic(() => import('./StudioComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-[#101112]">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto" />
        <p className="text-white/60 text-sm">Cargando Sanity Studio...</p>
      </div>
    </div>
  ),
});

export default function StudioPage() {
  return <StudioComponent />;
}
