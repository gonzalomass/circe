import { useEffect, useState } from 'react';

type UpdateStatus =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; version: string; releaseNotes?: string }
  | { type: 'not-available' }
  | { type: 'downloading'; percent: number }
  | { type: 'ready'; version: string }
  | { type: 'error'; message: string };

export function UpdateNotification() {
  const [status, setStatus] = useState<UpdateStatus>({ type: 'idle' });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Listen for push events from main process
    const unsub = window.circe.onUpdateStatus((s) => {
      setStatus(s);
      setDismissed(false);
    });

    // Check on mount (packaged builds only — main process no-ops in dev)
    window.circe.checkForUpdates().catch(() => {});

    return unsub;
  }, []);

  if (dismissed) return null;
  if (status.type === 'idle' || status.type === 'not-available' || status.type === 'checking') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {status.type === 'available' && (
        <Banner
          icon="⬆️"
          title={`Update available — v${status.version}`}
          description="Downloading in the background…"
          onDismiss={() => setDismissed(true)}
        />
      )}

      {status.type === 'downloading' && (
        <Banner
          icon="⬇️"
          title={`Downloading update… ${status.percent}%`}
          description={
            <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-300"
                style={{ width: `${status.percent}%` }}
              />
            </div>
          }
        />
      )}

      {status.type === 'ready' && (
        <Banner
          icon="✅"
          title={`v${status.version} ready to install`}
          description="Restart Circe to apply the update."
          action={
            <button
              onClick={() => window.circe.installUpdate()}
              className="mt-2 w-full rounded-md bg-violet-600 hover:bg-violet-500 active:bg-violet-700 px-3 py-1.5 text-xs font-medium text-white transition-colors"
            >
              Restart &amp; Install
            </button>
          }
          onDismiss={() => setDismissed(true)}
        />
      )}

      {status.type === 'error' && (
        <Banner
          icon="⚠️"
          title="Update check failed"
          description={status.message}
          onDismiss={() => setDismissed(true)}
        />
      )}
    </div>
  );
}

interface BannerProps {
  icon: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

function Banner({ icon, title, description, action, onDismiss }: BannerProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[rgba(20,20,30,0.95)] backdrop-blur-sm shadow-2xl px-4 py-3 text-sm text-white">
      <div className="flex items-start gap-2">
        <span className="text-base leading-none mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-snug">{title}</p>
          {description && (
            <p className="text-white/60 text-xs mt-0.5 leading-snug">{description}</p>
          )}
          {action}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/80 transition-colors leading-none mt-0.5 flex-shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
