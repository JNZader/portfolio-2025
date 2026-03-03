import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/lib/generated/prisma/client';

/**
 * Prisma Client Singleton
 * Evita múltiples instancias en desarrollo (hot reload)
 *
 * Prisma v7 requiere un driver adapter explícito.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper para cerrar conexión (útil en scripts)
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
