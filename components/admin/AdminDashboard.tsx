'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  LogOut,
  Mail,
  RefreshCw,
  Server,
  Settings,
  Shield,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UptimeStatus } from './UptimeStatus';

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  responseTime: string;
  services: {
    database: string;
    email: string;
    env_config: string;
  };
}

interface AdminDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const SKELETON_CARDS = new Array(4);

function StatusIcon({ status }: Readonly<{ status: string }>) {
  switch (status) {
    case 'ok':
    case 'healthy':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'degraded':
    case 'partial':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error':
    case 'unhealthy':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-400" />;
  }
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const colors: Record<string, string> = {
    ok: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    healthy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    degraded: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    partial: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    unhealthy: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    not_configured: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? colors.not_configured}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function AdminDashboard({ user }: Readonly<AdminDashboardProps>) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/health');

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener datos de salud');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();

    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Última actualización:{' '}
            {lastRefresh
              ? lastRefresh.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : '--:--:--'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-muted-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-600 dark:text-red-400">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && !health && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SKELETON_CARDS.map((_, i) => (
            <Card key={`skeleton-${i.toString()}`}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Health data */}
      {health && (
        <>
          {/* Status Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estado General
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <StatusIcon status={health.status} />
                  <span className="text-2xl font-bold capitalize">{health.status}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Versión</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v{health.version}</div>
                <p className="text-xs text-muted-foreground">{health.environment}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
                <p className="text-xs text-muted-foreground">Tiempo activo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tiempo de Respuesta
                </CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{health.responseTime}</div>
                <p className="text-xs text-muted-foreground">Health check</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a href="/admin/newsletter" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Newsletter
                  </CardTitle>
                  <Mail className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-100">Enviar</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Crear nuevo broadcast</p>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Uptime Monitor + Services Status */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Uptime Robot Monitor */}
            <UptimeStatus />

            {/* Services Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Estado de Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {/* Database */}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Database className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Base de Datos</p>
                        <p className="text-sm text-muted-foreground">PostgreSQL / Prisma</p>
                      </div>
                    </div>
                    <StatusBadge status={health.services.database} />
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Mail className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Servicio de Email</p>
                        <p className="text-sm text-muted-foreground">Resend</p>
                      </div>
                    </div>
                    <StatusBadge status={health.services.email} />
                  </div>

                  {/* Environment Config */}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <Settings className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Configuración</p>
                        <p className="text-sm text-muted-foreground">Variables de entorno</p>
                      </div>
                    </div>
                    <StatusBadge status={health.services.env_config} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sesión Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name ?? 'Avatar'}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw JSON (collapsible) */}
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <span className="transition-transform group-open:rotate-90">▶</span>
                <span>Ver datos JSON</span>
              </div>
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs">
              {JSON.stringify(health, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
