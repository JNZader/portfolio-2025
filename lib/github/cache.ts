interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

/**
 * Obtener dato del cache si es válido
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Guardar dato en cache
 */
export function setCached<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Limpiar cache completo
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Wrapper para funciones con auto-cache
 */
export async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key);

  if (cached) {
    console.log(`✅ Cache HIT: ${key}`);
    return cached;
  }

  console.log(`❌ Cache MISS: ${key}`);
  const data = await fetcher();
  setCached(key, data);

  return data;
}
