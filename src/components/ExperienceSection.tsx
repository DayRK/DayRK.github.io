'use client';

import { Briefcase } from 'lucide-react';
import { Card, CardBody } from '@heroui/react';

type Experience = {
  id?: number;
  role: string;
  company: string;
  period: string;
  description: string;
  sortOrder?: number;
};

type ExperienceSectionProps = {
  experience: Experience[];
  loadFailed?: boolean;
};

export default function ExperienceSection({ experience, loadFailed }: ExperienceSectionProps) {
  if (!loadFailed && experience.length === 0) {
    return null;
  }

  return (
    <section id="experience" className="glass-card rounded-[2rem] p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Experience</p>
        {loadFailed && (
          <p className="mt-3 text-sm text-slate-400">
            Experience content is unavailable right now. Please check back in a moment.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {experience.map((item, index) => (
          <Card
            key={item.id ?? `${item.role}-${index}`}
            className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 shadow-none"
          >
            <CardBody className="p-4 sm:p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-white">{item.role}</h3>
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  <Briefcase size={14} className="text-fuchsia-300" />
                  {item.period}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-fuchsia-200">{item.company}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
