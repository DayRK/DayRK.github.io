import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

type FooterProps = {
  links: Array<{ label: string; href: string; iconName: 'linkedin' | 'github' | 'fiverr' }>;
};

function FiverrIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M14.5 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM9 7h2v12H9Zm5 0h2v1.7h.02c.5-.9 1.7-1.8 3.5-1.8 3.7 0 4.9 2.4 4.9 5.5V19h-2v-9.5c0-2.2-.5-3.8-2.7-3.8-1.9 0-3.3 1.3-3.8 2.6V19h-2V7Z" />
    </svg>
  );
}

export default function Footer({ links }: FooterProps) {
  const renderIcon = (iconName: 'linkedin' | 'github' | 'fiverr') => {
    if (iconName === 'linkedin') return <Linkedin size={16} />;
    if (iconName === 'github') return <Github size={16} />;
    return <FiverrIcon />;
  };

  return (
    <footer className="section pb-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
          © 2026 Jan Patrick Bejare · National University – Manila
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/blog" className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Writing
          </Link>
          <Link href="/search" className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Search
          </Link>
          <Link href="/resume" className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Resume
          </Link>
          <span className="hidden h-4 w-px sm:block" style={{ background: 'var(--line-strong)' }} />
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className="transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {renderIcon(link.iconName)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
