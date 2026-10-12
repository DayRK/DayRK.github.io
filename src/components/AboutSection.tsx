type AboutSectionProps = {
  title: string;
  sections: Array<{
    heading: string;
    items: string[];
  }>;
};

export default function AboutSection({ title, sections }: AboutSectionProps) {
  return (
    <section id="about" className="section">
      <div className="mb-10">
        <p className="eyebrow">003 / Toolkit</p>
        <h2 className="heading mt-2">{title || 'What I work with'}</h2>
      </div>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
              {section.heading}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {section.items.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
