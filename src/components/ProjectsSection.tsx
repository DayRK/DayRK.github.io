import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type Project = {
  id?: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
  showPreview?: boolean;
};

export default function ProjectsSection({
  projects,
  loadFailed,
}: {
  projects: Project[];
  loadFailed?: boolean;
}) {
  if (!loadFailed && projects.length === 0) return null;

  return (
    <section id="projects" className="section">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">002 / Work</p>
          <h2 className="heading mt-2">Selected projects</h2>
        </div>
        <Link href="/search" className="hidden text-sm sm:block" style={{ color: 'var(--text-muted)' }}>
          Search all content
        </Link>
      </div>

      {loadFailed ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Project content is unavailable right now. Please check back in a moment.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <article
            key={project.id ?? `${project.title}-${index}`}
            className="card card-hover flex flex-col p-5"
          >
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              {project.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>

            {(project.showPreview ?? true) && project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: 'var(--accent)' }}
              >
                View live
                <ArrowUpRight size={15} />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
