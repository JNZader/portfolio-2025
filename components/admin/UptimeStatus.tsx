'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UptimeLog {
  type: 'up' | 'down' | 'paused';
  datetime: string;
  duration: number;
  reason?: string;
}

interface Monitor {
  id: number;
  name: string;
  url: string;
  status: string;
  statusCode: number;
  responseTime: number;
  uptime: {
    day: number;
    week: number;
    month: number;
  };
  logs: UptimeLog[];
}

interface UptimeData {
  configured: boolean;
  monitors?: Monitor[];
  timestamp?: string;
  error?: string;
}

function StatusIcon({ status }: Readonly<{ status: string }>) {
  switch (status) {
    case 'up':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'down':
    case 'seems_down':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'paused':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-400" />;
  }
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const config: Record<string, { color: string; label: string }> = {
    up: {
      color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      label: 'Online',
    },
    down: {
      color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      label: 'Offline',
    },
    seems_down: {
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      label: 'Problemas',
    },
    paused: {
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      label: 'Pausado',
    },
    not_checked_yet: {
      color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
      label: 'Pendiente',
    },
  };

  const { color, label } = config[status] ?? {
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

function UptimeBar({ value, label }: Readonly<{ value: number; label: string }>) {
  const getColor = (v: number) => {
    if (v >= 99.9) return 'bg-green-500';
    if (v >= 99) return 'bg-green-400';
    if (v >= 95) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(2)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-500 ${getColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays}d`;
}

const LOG_TYPE_LABELS: Record<string, string> = {
  up: 'Recuperado',
  down: 'Caida',
  paused: 'Pausado',
};

function LogIcon({ type }: Readonly<{ type: string }>) {
  if (type === 'up') return <CheckCircle className="h-3 w-3 text-green-500" />;
  if (type === 'down') return <XCircle className="h-3 w-3 text-red-500" />;
  return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
}

export function UptimeStatus() {
  const [data, setData] = useState<UptimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUptime = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/uptime');
      const result = await response.json();

      if (!response.ok && !result.configured) {
        throw new Error(result.error ?? 'Error al obtener datos');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUptime();

    // Auto-refresh cada 2 minutos
    const interval = setInterval(fetchUptime, 120000);
    return () => clearInterval(interval);
  }, [fetchUptime]);

  // No configurado
  if (data && !data.configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uptime Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">Uptime Robot no configurado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agrega <code className="rounded bg-muted px-1">UPTIME_ROBOT_API_KEY</code> a tus
                variables de entorno
              </p>
            </div>
            <a
              href="https://uptimerobot.com/dashboard#mySettings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Obtener API Key
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uptime Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uptime Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <XCircle className="h-12 w-12 text-red-500" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Error</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUptime}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sin monitores
  if (!data?.monitors?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Uptime Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Wifi className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">Sin monitores</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea un monitor en Uptime Robot para tu sitio
              </p>
            </div>
            <a
              href="https://uptimerobot.com/dashboard#newMonitor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Crear monitor
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Uptime Monitor
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchUptime} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.monitors.map((monitor) => (
          <div key={monitor.id} className="space-y-4">
            {/* Header del monitor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={monitor.status} />
                <div>
                  <p className="font-medium">{monitor.name}</p>
                  <p className="text-xs text-muted-foreground">{monitor.url}</p>
                </div>
              </div>
              <StatusBadge status={monitor.status} />
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Response</p>
                  <p className="font-medium">{monitor.responseTime}ms</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Uptime 30d</p>
                  <p className="font-medium">{monitor.uptime.month.toFixed(2)}%</p>
                </div>
              </div>
            </div>

            {/* Barras de uptime */}
            <div className="space-y-3">
              <UptimeBar value={monitor.uptime.day} label="Hoy" />
              <UptimeBar value={monitor.uptime.week} label="7 dias" />
              <UptimeBar value={monitor.uptime.month} label="30 dias" />
            </div>

            {/* Logs recientes */}
            {monitor.logs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Eventos recientes</p>
                <div className="space-y-1">
                  {monitor.logs.map((log, idx) => (
                    <div
                      key={`${log.datetime}-${idx}`}
                      className="flex items-center justify-between rounded bg-muted/30 px-2 py-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <LogIcon type={log.type} />
                        <span className="capitalize">{LOG_TYPE_LABELS[log.type] ?? 'Pausado'}</span>
                        {log.duration > 0 && (
                          <span className="text-muted-foreground">
                            ({formatDuration(log.duration)})
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatRelativeTime(log.datetime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Footer con link a Uptime Robot */}
        <div className="border-t pt-4">
          <a
            href="https://uptimerobot.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Ver en Uptime Robot
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
