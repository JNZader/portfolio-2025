import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/monitoring/logger';

interface UptimeRobotMonitor {
  id: number;
  friendly_name: string;
  url: string;
  type: number;
  status: number;
  average_response_time: string;
  custom_uptime_ratio: string;
  logs?: Array<{
    type: number;
    datetime: number;
    duration: number;
    reason?: {
      code: string;
      detail: string;
    };
  }>;
}

interface UptimeRobotResponse {
  stat: 'ok' | 'fail';
  monitors?: UptimeRobotMonitor[];
  error?: {
    message: string;
  };
}

// Mapeo de estados de Uptime Robot
const STATUS_MAP: Record<number, string> = {
  0: 'paused',
  1: 'not_checked_yet',
  2: 'up',
  8: 'seems_down',
  9: 'down',
};

/**
 * GET /api/admin/uptime
 * Obtiene datos de monitoreo desde Uptime Robot
 * Solo accesible por administradores autenticados
 */
export async function GET() {
  try {
    // Verificar autenticación
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const apiKey = process.env.UPTIME_ROBOT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Uptime Robot no configurado',
          configured: false,
        },
        { status: 200 }
      );
    }

    // Llamar a la API de Uptime Robot
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        format: 'json',
        logs: '1',
        logs_limit: '10',
        response_times: '1',
        response_times_limit: '24',
        custom_uptime_ratios: '1-7-30',
      }),
    });

    if (!response.ok) {
      throw new Error(`Uptime Robot API error: ${response.status}`);
    }

    const data: UptimeRobotResponse = await response.json();

    if (data.stat !== 'ok') {
      throw new Error(data.error?.message ?? 'Error desconocido de Uptime Robot');
    }

    // Transformar datos para el frontend
    const monitors = data.monitors?.map((monitor) => {
      const uptimeRatios = monitor.custom_uptime_ratio?.split('-').map(Number) ?? [0, 0, 0];

      return {
        id: monitor.id,
        name: monitor.friendly_name,
        url: monitor.url,
        status: STATUS_MAP[monitor.status] ?? 'unknown',
        statusCode: monitor.status,
        responseTime: Number.parseInt(monitor.average_response_time, 10) || 0,
        uptime: {
          day: uptimeRatios[0] ?? 0,
          week: uptimeRatios[1] ?? 0,
          month: uptimeRatios[2] ?? 0,
        },
        logs:
          monitor.logs?.slice(0, 5).map((log) => {
            const logTypeMap: Record<number, string> = { 1: 'down', 2: 'up' };
            return {
              type: logTypeMap[log.type] ?? 'paused',
              datetime: new Date(log.datetime * 1000).toISOString(),
              duration: log.duration,
              reason: log.reason?.detail,
            };
          }) ?? [],
      };
    });

    return NextResponse.json(
      {
        configured: true,
        monitors: monitors ?? [],
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    logger.error('Uptime Robot API error', error as Error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al obtener datos de Uptime Robot',
        configured: true,
      },
      { status: 500 }
    );
  }
}
