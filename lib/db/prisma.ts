import { PrismaClient } from '@prisma/client/extension';

/**
 * Prisma Client Singleton
 * Evita múltiples instancias en desarrollo (hot reload)
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper para cerrar conexión (útil en scripts)
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
