import { ArrowUpRight } from 'lucide-react';

type Project = {
  title: string;
  summary: string;
  stack: string[];
  link: string;
};

type ProjectsSectionProps = {
  projects: Project[];
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section id="projects" className="glass-card rounded-[2rem] p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Featured Projects</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project.title} className="flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4 sm:p-5">
            <h3 className="text-xl font-semibold tracking-tight">{project.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">{item}</span>
              ))}
            </div>
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-2 text-sm font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/20"
            >
              View Live
              <ArrowUpRight size={16} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
