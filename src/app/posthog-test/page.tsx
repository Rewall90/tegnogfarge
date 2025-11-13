'use client';

import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/components/cookie-consent';
import { trackPostHogEvent } from '@/lib/posthog';
import posthog from 'posthog-js';

export default function PostHogTestPage() {
  const { hasConsent, acceptAll, preferences } = useCookieConsent();
  const [logs, setLogs] = useState<string[]>([]);
  const [isPostHogLoaded, setIsPostHogLoaded] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[PostHog Test] ${message}`);
  };

  useEffect(() => {
    addLog('Page loaded');
    addLog(`Cookie consent preferences: ${JSON.stringify(preferences)}`);
    addLog(`Has analytics consent: ${hasConsent('analytics')}`);
    addLog(`PostHog loaded: ${posthog.__loaded}`);

    if (typeof window !== 'undefined' && (window as any).posthog) {
      setIsPostHogLoaded(true);
      addLog('PostHog instance found on window');
      addLog(`PostHog distinct ID: ${posthog.get_distinct_id()}`);
    }
  }, [preferences, hasConsent]);

  const testEvent = async () => {
    addLog('Testing PostHog event...');
    try {
      await trackPostHogEvent('test_event', {
        test: true,
        timestamp: new Date().toISOString()
      });
      addLog('✅ Event sent successfully');
    } catch (error) {
      addLog(`❌ Event failed: ${error}`);
    }
  };

  const testDirectCapture = () => {
    addLog('Testing direct posthog.capture...');
    try {
      posthog.capture('test_direct_capture', {
        test: true,
        method: 'direct',
        timestamp: new Date().toISOString()
      });
      addLog('✅ Direct capture sent');
    } catch (error) {
      addLog(`❌ Direct capture failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">PostHog Diagnostic Test</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${preferences ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-semibold">Cookie Consent</h3>
            <p className="text-sm">{preferences ? '✅ Set' : '❌ Not set'}</p>
          </div>

          <div className={`p-4 rounded-lg ${hasConsent('analytics') ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-semibold">Analytics Consent</h3>
            <p className="text-sm">{hasConsent('analytics') ? '✅ Granted' : '❌ Denied'}</p>
          </div>

          <div className={`p-4 rounded-lg ${isPostHogLoaded ? 'bg-green-100' : 'bg-red-100'}`}>
            <h3 className="font-semibold">PostHog Loaded</h3>
            <p className="text-sm">{isPostHogLoaded ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>POSTHOG_KEY:</strong> {process.env.NEXT_PUBLIC_POSTHOG_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>POSTHOG_HOST:</strong> {process.env.NEXT_PUBLIC_POSTHOG_HOST || 'Not set'}</p>
            <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
            <p><strong>PostHog __loaded:</strong> {String(posthog.__loaded)}</p>
            {isPostHogLoaded && (
              <>
                <p><strong>Distinct ID:</strong> {posthog.get_distinct_id()}</p>
                <p><strong>Person Properties:</strong> {JSON.stringify(posthog.get_property('$identified'))}</p>
              </>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>

          {!preferences && (
            <button
              onClick={acceptAll}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Accept All Cookies
            </button>
          )}

          <button
            onClick={testEvent}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={!hasConsent('analytics')}
          >
            Test Event (via trackPostHogEvent)
          </button>

          <button
            onClick={testDirectCapture}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            disabled={!isPostHogLoaded}
          >
            Test Direct Capture
          </button>

          <button
            onClick={() => {
              addLog('Checking PostHog status...');
              addLog(`PostHog loaded: ${posthog.__loaded}`);
              addLog(`Window.posthog exists: ${!!(window as any).posthog}`);
              if (isPostHogLoaded) {
                addLog(`Distinct ID: ${posthog.get_distinct_id()}`);
                addLog(`Config: ${JSON.stringify(posthog.config)}`);
              }
            }}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Check PostHog Status
          </button>
        </div>

        {/* Logs */}
        <div className="bg-black text-green-400 p-6 rounded-lg shadow font-mono text-sm">
          <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 && <p className="text-gray-500">No logs yet...</p>}
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
}
