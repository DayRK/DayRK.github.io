type Experience = {
  id?: number;
  role: string;
  company: string;
  period: string;
  description: string;
  sortOrder?: number;
};

export default function ExperienceSection({
  experience,
  loadFailed,
}: {
  experience: Experience[];
  loadFailed?: boolean;
}) {
  if (!loadFailed && experience.length === 0) return null;

  return (
    <section id="experience" className="section">
      <div className="mb-10">
        <p className="eyebrow">001 / Background</p>
        <h2 className="heading mt-2">Experience</h2>
      </div>

      {loadFailed ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Experience content is unavailable right now. Please check back in a moment.
        </p>
      ) : null}

      <ol className="flex flex-col">
        {experience.map((item, index) => (
          <li
            key={item.id ?? `${item.role}-${index}`}
            className="grid gap-2 border-t py-6 sm:grid-cols-[10rem_1fr] sm:gap-8"
            style={{ borderColor: 'var(--line)' }}
          >
            <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              {item.period}
            </span>
            <div>
              <h3 className="text-base font-semibold">{item.role}</h3>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--accent)' }}>
                {item.company}
              </p>
              <p className="mt-3 text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
