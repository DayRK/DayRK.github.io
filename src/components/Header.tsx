'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
];

export default function Header({ name }: { name: string }) {
  const [active, setActive] = useState<string>('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => node !== null,
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-88px 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3);

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ borderColor: 'var(--line)', background: 'rgba(11, 6, 20, 0.82)' }}>
      <div className="shell flex h-[68px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span
            className="flex h-9 w-9 items-center justify-center font-mono text-xs font-semibold"
            style={{ border: '1px solid var(--line-strong)', borderRadius: 10, color: 'var(--accent)' }}
          >
            {initials}
          </span>
          <span className="hidden text-sm font-medium sm:block">{name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="px-3 py-2 text-sm transition-colors"
              style={{ color: active === item.id ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {item.label}
            </a>
          ))}
          <Link href="/blog" className="px-3 py-2 text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
            Writing
          </Link>
          <a href="#contact" className="btn btn-primary ml-2">
            Get in touch
          </a>
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          style={{ color: 'var(--text)' }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className="border-t md:hidden" style={{ borderColor: 'var(--line)' }}>
          <div className="shell flex flex-col py-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.label}
              </a>
            ))}
            <Link href="/blog" onClick={() => setOpen(false)} className="py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              Writing
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
