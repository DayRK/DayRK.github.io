'use client';

import Link from 'next/link';
import { ArrowLeft, Compass, DatabaseZap, Home, WifiOff } from 'lucide-react';

type ErrorVariant = 'not-found' | 'database' | 'server' | 'network';

type ErrorDisplayProps = {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

const variantMap: Record<
  ErrorVariant,
  {
    badge: string;
    title: string;
    description: string;
    icon: typeof Compass;
  }
> = {
  'not-found': {
    badge: '404',
    title: 'Page not found',
    description: 'The page you were looking for has moved, vanished, or never existed.',
    icon: Compass,
  },
  database: {
    badge: 'DB ERROR',
    title: 'Database connection issue',
    description: 'The data layer is currently unavailable. Please check the connection and try again.',
    icon: DatabaseZap,
  },
  server: {
    badge: 'ERROR',
    title: 'Something went wrong',
    description: 'A server-side issue interrupted this request. The team has been notified.',
    icon: Home,
  },
  network: {
    badge: 'NETWORK',
    title: 'Connection interrupted',
    description: 'The request could not complete because the network is unavailable or the service is timing out.',
    icon: WifiOff,
  },
};

export default function ErrorDisplay({
  variant = 'server',
  title,
  description,
  actionLabel = 'Try again',
  onAction,
}: ErrorDisplayProps) {
  const config = variantMap[variant];
  const Icon = config.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(192,132,252,0.14),_transparent_28%),linear-gradient(135deg,_#04010d_0%,_#12081f_45%,_#080511_100%)] px-4 py-16 text-slate-100">
      <div className="glass-card w-full max-w-2xl rounded-[2rem] border border-white/10 p-8 text-center shadow-[0_30px_90px_rgba(4,2,16,0.45)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200">
          <Icon className="h-8 w-8" />
        </div>
        <div className="mt-6 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
          {config.badge}
        </div>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{title ?? config.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-300">
          {description ?? config.description}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          {onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-fuchsia-700"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
