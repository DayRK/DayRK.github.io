import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import AnimatedText from './AnimatedText';

type HeroSectionProps = {
  intro: string;
  description: string;
  email: string;
  availability: string;
  facts: string[];
  name: string;
  tagline: string;
};

export default function HeroSection({ intro, description, email, availability, facts, name, tagline }: HeroSectionProps) {
  const rolePhrases = [
    description,
    'Full Stack Web Developer',
    'Building with modern tech',
    'Crafting digital experiences',
  ];

  return (
    <section className="glass-card overflow-hidden rounded-[2rem] p-8 lg:p-10">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-stretch">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center lg:items-start lg:text-left">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">{name}</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              <AnimatedText phrases={rolePhrases} />
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">{tagline}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="#projects" className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-6 py-3 font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/20">
              View Work
            </Link>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500 px-6 py-3 font-medium text-white transition hover:bg-fuchsia-600">
              Contact Me <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="w-full lg:w-auto lg:max-w-sm">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_12px_45px_rgba(2,6,23,0.35)]">
            <div className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <BookOpen size={16} className="text-fuchsia-300" />
              <span>
                {availability === 'Limited Availability'
                  ? 'Commission work available around Metro Manila (limited)'
                  : availability === 'Open to Commissions'
                    ? 'Commission work available around Metro Manila'
                    : availability}
              </span>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {facts.slice(0, 2).map((fact) => (
                <li key={fact} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-400" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
