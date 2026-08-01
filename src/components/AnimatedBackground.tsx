'use client';

import { useEffect, useState } from 'react';

type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

type ViewportState = {
  width: number;
  height: number;
};

export default function AnimatedBackground() {
  const [pointer, setPointer] = useState<PointerState>({ x: 0, y: 0, active: false });
  const [viewport, setViewport] = useState<ViewportState>({ width: 1440, height: 900 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth || 1440,
        height: window.innerHeight || 900,
      });
    };

    const handleMove = (event: MouseEvent) => {
      setPointer({ x: event.clientX, y: event.clientY, active: true });
    };

    const handleLeave = () => {
      setPointer((prev) => ({ ...prev, active: false }));
    };

    updateViewport();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    window.addEventListener('resize', updateViewport);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const xPercent = pointer.active ? `${(pointer.x / Math.max(viewport.width, 1)) * 100}%` : '50%';
  const yPercent = pointer.active ? `${(pointer.y / Math.max(viewport.height, 1)) * 100}%` : '50%';

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05030d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_34%)]" />
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at ${xPercent} ${yPercent}, rgba(167,139,250,0.28), transparent 30%), radial-gradient(circle at 80% 20%, rgba(37,99,235,0.22), transparent 24%)`,
        }}
      />
      <div className="absolute left-[-4rem] top-[-2rem] h-52 w-52 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute bottom-[-3rem] right-[-4rem] h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:90px_90px] opacity-20" />
    </div>
  );
}
