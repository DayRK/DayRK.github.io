'use client';

import { useEffect, useRef, useState } from 'react';

export type Stat = {
  label: string;
  value: number;
};

function StatItem({ label, value }: Stat) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const duration = 900;

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="font-mono text-2xl font-medium tabular-nums md:text-3xl">
        {shown}
        <span className="text-[var(--accent)]">+</span>
      </span>
      <span className="text-xs uppercase tracking-wide text-[var(--text-faint)]">{label}</span>
    </div>
  );
}

export default function HeroStats({ stats }: { stats: Stat[] }) {
  if (stats.length < 2) return null;

  return (
    <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 sm:grid-cols-4" style={{ borderColor: 'var(--line)' }}>
      {stats.map((stat) => (
        <StatItem key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
