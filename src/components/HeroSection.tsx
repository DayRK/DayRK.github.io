import { ArrowRight, MapPin } from 'lucide-react';
import HeroStats, { type Stat } from './HeroStats';

type HeroSectionProps = {
  intro: string;
  description: string;
  email: string;
  availability: string;
  name: string;
  tagline: string;
  stats: Stat[];
  showContact?: boolean;
  showProjects?: boolean;
};

export default function HeroSection({
  intro,
  description,
  email,
  availability,
  name,
  tagline,
  stats,
  showContact = true,
  showProjects = true,
}: HeroSectionProps) {
  return (
    <section className="pb-20 pt-20 md:pt-28">
      <p className="eyebrow">{name}</p>

      <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.1] sm:text-5xl md:text-6xl">
        {intro}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8" style={{ color: 'var(--text-muted)' }}>
        {tagline}
      </p>

      <p className="mt-2 max-w-2xl text-base leading-7" style={{ color: 'var(--text-faint)' }}>
        {description}
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        {showProjects ? (
          <a href="#projects" className="btn btn-primary">
            View work
            <ArrowRight size={16} />
          </a>
        ) : null}
        {showContact ? (
          <a href="#contact" className="btn btn-ghost">
            Get in touch
          </a>
        ) : (
          <a href={`mailto:${email}`} className="btn btn-ghost">
            Email me
          </a>
        )}
      </div>

      <p className="mt-6 inline-flex items-center gap-2 text-sm" style={{ color: 'var(--text-faint)' }}>
        <MapPin size={15} />
        {availability}
      </p>

      <HeroStats stats={stats} />
    </section>
  );
}
