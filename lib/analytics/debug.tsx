'use client';

import { useCallback, useEffect, useState } from 'react';

interface AnalyticsEvent {
  type: 'event' | 'pageview' | 'web-vital';
  name: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * Analytics debug panel (development only)
 * Shows real-time analytics events and status
 */
export function AnalyticsDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [vaStatus, setVaStatus] = useState(false);
  const [gtagStatus, setGtagStatus] = useState(false);

  const addEvent = useCallback((event: AnalyticsEvent) => {
    setEvents((prev) => [event, ...prev].slice(0, 10)); // Keep last 10
  }, []);

  useEffect(() => {
    // Check analytics status
    const checkStatus = () => {
      setVaStatus(typeof globalThis !== 'undefined' && !!globalThis.va);
      setGtagStatus(typeof globalThis !== 'undefined' && !!globalThis.gtag);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Intercept analytics calls (for demo/testing)
  useEffect(() => {
    if (typeof globalThis === 'undefined') return;

    // Store original functions
    const originalVa = globalThis.va;
    const originalGtag = globalThis.gtag;

    // Wrap va
    if (globalThis.va) {
      globalThis.va = (type: string, name: string, data?: Record<string, unknown>) => {
        addEvent({
          type: type === 'track' ? 'event' : 'pageview',
          name,
          timestamp: new Date().toLocaleTimeString(),
          data,
        });
        if (originalVa) originalVa(type, name, data);
      };
    }

    // Wrap gtag
    if (globalThis.gtag) {
      globalThis.gtag = (
        command: 'config' | 'event' | 'js' | 'set' | 'consent',
        targetId: string | Date,
        config?: Record<string, unknown>
      ) => {
        if (command === 'event') {
          addEvent({
            type: 'event',
            name: String(targetId),
            timestamp: new Date().toLocaleTimeString(),
            data: config,
          });
        }
        if (originalGtag) originalGtag(command, targetId, config);
      };
    }

    return () => {
      // Restore original functions
      if (originalVa) globalThis.va = originalVa;
      if (originalGtag) globalThis.gtag = originalGtag;
    };
  }, [addEvent]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 99999,
          backgroundColor: '#9333ea',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        }}
        aria-label="Toggle analytics debug panel"
        title="Analytics Debug"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <title>Analytics Debug</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '16px',
            zIndex: 99998,
            width: '400px',
            maxHeight: '600px',
            overflow: 'auto',
            borderRadius: '8px',
            border: '2px solid #9333ea',
            backgroundColor: '#1a1a1a',
            color: '#e5e5e5',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            fontFamily: 'monospace',
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-purple-600 p-3 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">📊 Analytics Debug</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="p-3 border-b border-gray-700">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Vercel Analytics:</span>
                <span className={vaStatus ? 'text-green-400' : 'text-red-400'}>
                  {vaStatus ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Google Analytics:</span>
                <span className={gtagStatus ? 'text-green-400' : 'text-red-400'}>
                  {gtagStatus ? '✅ Active' : '❌ Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="p-3">
            <h4 className="text-xs font-bold mb-2 text-gray-400">Recent Events (Last 10)</h4>
            {events.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No events yet...</p>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div
                    key={`${event.timestamp}-${index}`}
                    className="text-xs bg-gray-800 rounded p-2 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-400">{event.name}</span>
                      <span className="text-gray-500">{event.timestamp}</span>
                    </div>
                    <div className="text-gray-400">
                      Type: <span className="text-yellow-400">{event.type}</span>
                    </div>
                    {event.data && Object.keys(event.data).length > 0 && (
                      <div className="mt-1 text-gray-500 text-[10px] overflow-hidden">
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-700 text-center">
            <p className="text-[10px] text-gray-500">Development Mode Only</p>
          </div>
        </div>
      )}
    </>
  );
}
