import { prisma } from '@/lib/db/prisma';
import type { ConsentLog, ConsentType } from '@/lib/generated/prisma/client';

/**
 * Exportar todos los datos de un usuario
 */
export async function exportUserData(email: string) {
  const subscriber = await prisma.subscriber.findUnique({
    where: { email },
  });

  if (!subscriber) {
    return null;
  }

  // Buscar consent logs
  const consentLogs = await prisma.consentLog.findMany({
    where: { email },
    orderBy: { consentDate: 'desc' },
  });

  // Estructura de datos exportable
  const exportData = {
    personal_information: {
      email: subscriber.email,
      subscribed_at: subscriber.subscribedAt,
      confirmed_at: subscriber.confirmedAt,
      status: subscriber.status,
    },
    privacy_settings: {
      consent_given: subscriber.consentGiven,
      consent_date: subscriber.consentDate,
      consent_version: subscriber.consentVersion,
      allow_analytics: subscriber.allowAnalytics,
      allow_marketing: subscriber.allowMarketing,
    },
    metadata: {
      ip_address: subscriber.ipAddress,
      user_agent: subscriber.userAgent,
    },
    consent_history: consentLogs.map((log: ConsentLog) => ({
      type: log.consentType,
      given: log.consentGiven,
      date: log.consentDate,
      version: log.version,
    })),
    export_metadata: {
      export_date: new Date().toISOString(),
      data_retention_policy: '24 months from last activity',
      right_exercised: 'GDPR Article 15 - Right of Access',
    },
  };

  return exportData;
}

/**
 * Eliminar todos los datos de un usuario
 */
export async function deleteUserData(email: string) {
  // Verificar que existe
  const subscriber = await prisma.subscriber.findUnique({
    where: { email },
  });

  if (!subscriber) {
    return { success: false, message: 'No se encontraron datos para este email' };
  }

  try {
    // Eliminar consent logs
    await prisma.consentLog.deleteMany({
      where: { email },
    });

    // Eliminar subscriber
    await prisma.subscriber.delete({
      where: { email },
    });

    return {
      success: true,
      message: 'Todos los datos han sido eliminados permanentemente',
    };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return {
      success: false,
      message: 'Error al eliminar los datos. Por favor, contacta a soporte.',
    };
  }
}

/**
 * Registrar consentimiento
 */
export async function logConsent(data: {
  email: string;
  consentType: ConsentType;
  consentGiven: boolean;
  ipAddress?: string;
  userAgent?: string;
  version?: string;
}) {
  await prisma.consentLog.create({
    data: {
      email: data.email,
      consentType: data.consentType,
      consentGiven: data.consentGiven,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      version: data.version || '1.0',
    },
  });
}

/**
 * Actualizar preferencias de privacidad
 */
export async function updatePrivacySettings(
  email: string,
  settings: {
    allowAnalytics?: boolean;
    allowMarketing?: boolean;
  }
) {
  await prisma.subscriber.update({
    where: { email },
    data: {
      allowAnalytics: settings.allowAnalytics,
      allowMarketing: settings.allowMarketing,
    },
  });
}
