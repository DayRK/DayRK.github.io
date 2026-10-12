'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, Chip, Spinner } from '@heroui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faGaugeHigh } from '@fortawesome/free-solid-svg-icons';

type SystemStats = {
  projects: number;
  experience: number;
  certificates: number;
  posts: number;
  drafts: number;
  media: number;
  unreadMessages: number;
};

type AuditLogEntry = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string;
  detail: string | null;
  createdAt: string;
};

const STAT_LABELS: Array<{ key: keyof SystemStats; label: string }> = [
  { key: 'projects', label: 'Projects' },
  { key: 'experience', label: 'Experience' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'posts', label: 'Posts' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'media', label: 'Media files' },
  { key: 'unreadMessages', label: 'Unread messages' },
];

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';

  return date.toLocaleString();
}

export default function AdminSystemPanel() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [log, setLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await fetch('/api/system');

        if (!response.ok) throw new Error('Failed to load system information');

        const data = await response.json();

        if (!isActive) return;

        setStats(data.stats ?? null);
        setLog(data.log ?? []);
      } catch {
        if (isActive) setError('Failed to load system information');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  if (loading) {
    return (
      <Card className="rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-[0_25px_70px_rgba(4,2,16,0.4)] backdrop-blur">
        <CardBody className="flex items-center justify-center gap-3 p-10 text-slate-300">
          <Spinner size="sm" color="secondary" />
          <span>Loading system information...</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-[1.25rem] border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
        <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-[0_25px_70px_rgba(4,2,16,0.4)] backdrop-blur">
        <CardBody className="p-6">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-fuchsia-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">
                System health
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Content at a glance</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {STAT_LABELS.map((item) => (
              <div
                key={item.key}
                className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 px-4 py-3"
              >
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">
                  {stats ? stats[item.key] : 0}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-[0_25px_70px_rgba(4,2,16,0.4)] backdrop-blur">
        <CardBody className="p-6">
          <h2 className="text-xl font-semibold text-white">Recent admin activity</h2>
          <p className="mt-1 text-sm text-slate-400">
            Every content change is recorded on the server.
          </p>

          {log.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No activity recorded yet.</p>
          ) : (
            <div className="mt-5 flex flex-col divide-y divide-white/5">
              {log.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Chip size="sm" variant="flat" className="bg-fuchsia-500/20 capitalize text-fuchsia-200">
                    {entry.action}
                  </Chip>
                  <span className="text-sm font-medium text-white capitalize">{entry.entity}</span>
                  {entry.entityId && (
                    <span className="text-xs text-slate-500">#{entry.entityId}</span>
                  )}
                  <span className="text-sm text-slate-400">{entry.detail ?? ''}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    {formatWhen(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
