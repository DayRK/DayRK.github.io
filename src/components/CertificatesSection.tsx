import { ArrowUpRight } from 'lucide-react';

type Certificate = {
  id?: number;
  title: string;
  issuer: string;
  issuedAt: string;
  link: string;
  sortOrder?: number;
};

export default function CertificatesSection({
  certificates,
  loadFailed,
}: {
  certificates: Certificate[];
  loadFailed?: boolean;
}) {
  if (!loadFailed && certificates.length === 0) return null;

  return (
    <section id="certificates" className="section">
      <div className="mb-10">
        <p className="eyebrow">004 / Credentials</p>
        <h2 className="heading mt-2">Certificates</h2>
      </div>

      {loadFailed ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Certificate content is unavailable right now. Please check back in a moment.
        </p>
      ) : null}

      <ul className="grid gap-x-8">
        {certificates.map((item, index) => (
          <li
            key={item.id ?? `${item.title}-${index}`}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t py-5"
            style={{ borderColor: 'var(--line)' }}
          >
            <div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {item.issuer}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs" style={{ color: 'var(--text-faint)' }}>
                {item.issuedAt}
              </span>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm"
                  style={{ color: 'var(--accent)' }}
                >
                  View
                  <ArrowUpRight size={14} />
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
