'use client';

import { ArrowUpRight } from 'lucide-react';
import { Button, Card, CardBody, Chip } from '@heroui/react';

type Project = {
  id?: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
  showPreview?: boolean;
};

type ProjectsSectionProps = {
  projects: Project[];
  loadFailed?: boolean;
};

export default function ProjectsSection({ projects, loadFailed }: ProjectsSectionProps) {
  return (
    <section id="projects" className="glass-card rounded-[2rem] p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Featured Projects</p>
        {loadFailed && (
          <p className="mt-3 text-sm text-slate-400">
            Project content is unavailable right now. Please check back in a moment.
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Card
            key={project.id ?? project.title ?? index}
            className="flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-slate-900/70 shadow-none"
          >
            <CardBody className="gap-0 p-4 sm:p-5">
              <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{project.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <Chip
                    key={item}
                    size="sm"
                    variant="flat"
                    className="border border-white/10 bg-slate-800/80 text-xs text-slate-300"
                  >
                    {item}
                  </Chip>
                ))}
              </div>
              {(project.showPreview ?? true) ? (
                <Button
                  as="a"
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  size="sm"
                  radius="full"
                  variant="flat"
                  endContent={<ArrowUpRight size={16} />}
                  className="mt-5 self-start border border-fuchsia-400/30 bg-fuchsia-400/10 font-medium text-fuchsia-200"
                >
                  View Live
                </Button>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
