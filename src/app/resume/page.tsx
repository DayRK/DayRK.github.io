import Link from 'next/link';
import { ArrowLeft, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import PrintButton from '@/components/PrintButton';
import { aboutContent, profile, socialLinks } from '@/data/siteContent';
import { fetchAvailability, fetchCertificates, fetchExperience, fetchProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resume',
  description: `Resume of ${profile.name} — ${profile.intro} based in Manila.`,
  alternates: { canonical: '/resume' },
};

type PortfolioProject = {
  id: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
  showPreview?: boolean;
};

type PortfolioExperience = {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
};

type PortfolioCertificate = {
  id: number;
  title: string;
  issuer: string;
  issuedAt: string;
  link: string;
};

/** Turns a raw URL into something readable on paper. */
function prettyLink(href: string) {
  return href.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="resume-label font-mono text-[11px] uppercase tracking-[0.18em]">{label}</h2>
      <div className="resume-rule mt-2 border-t" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function ResumePage() {
  let projects: PortfolioProject[] = [];
  let experience: PortfolioExperience[] = [];
  let certificates: PortfolioCertificate[] = [];
  let availability = profile.availability;

  try {
    const [rows, status, roles, certs] = await Promise.all([
      fetchProjects(),
      fetchAvailability(),
      fetchExperience(),
      fetchCertificates(),
    ]);
    projects = rows;
    availability = status;
    experience = roles;
    certificates = certs;
  } catch (error) {
    console.error('Resume: failed to load portfolio data', error);
  }

  const links = socialLinks.filter((link) => link.href && link.href !== '#');

  return (
    <main id="main-content" className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto mb-5 flex max-w-4xl items-center justify-between gap-4 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} />
          Back to portfolio
        </Link>
        <PrintButton />
      </div>

      <div className="resume-paper mx-auto max-w-4xl p-8 md:p-12">
        <header className="resume-header">
          <h1 className="resume-name text-3xl font-semibold md:text-4xl">{profile.name}</h1>
          <p className="resume-role mt-2 text-base">{profile.intro}</p>

          <div className="resume-contact mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              Manila, Philippines
            </span>
            {links.map((link) => (
              <span key={link.label} className="inline-flex items-center gap-1.5">
                {link.iconName === 'github' ? <Github size={14} /> : <Linkedin size={14} />}
                <a href={link.href} target="_blank" rel="noreferrer">
                  {prettyLink(link.href)}
                </a>
              </span>
            ))}
          </div>
        </header>

        <Section label="Summary">
          <p className="resume-body text-sm leading-relaxed">{profile.description}</p>
          <p className="resume-body mt-2 text-sm leading-relaxed">{availability}</p>
        </Section>

        {experience.length > 0 ? (
          <Section label="Experience">
            <ul className="space-y-5">
              {experience.map((item) => (
                <li key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="resume-strong text-sm font-semibold">{item.role}</h3>
                    <span className="resume-muted font-mono text-xs">{item.period}</span>
                  </div>
                  <p className="resume-muted text-sm">{item.company}</p>
                  {item.description ? (
                    <p className="resume-body mt-1.5 text-sm leading-relaxed">{item.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section label="Projects">
            <ul className="space-y-5">
              {projects.map((item) => (
                <li key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="resume-strong text-sm font-semibold">{item.title}</h3>
                    {item.link ? (
                      <a className="resume-muted font-mono text-xs" href={item.link} target="_blank" rel="noreferrer">
                        {prettyLink(item.link)}
                      </a>
                    ) : null}
                  </div>
                  {item.summary ? (
                    <p className="resume-body mt-1.5 text-sm leading-relaxed">{item.summary}</p>
                  ) : null}
                  {item.stack.length > 0 ? (
                    <p className="resume-muted mt-1 font-mono text-xs">{item.stack.join(' · ')}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        <Section label="Technical Skills">
          <dl className="space-y-2">
            {aboutContent.sections.map((group) => (
              <div key={group.heading} className="sm:flex sm:gap-4">
                <dt className="resume-strong w-40 shrink-0 text-sm font-semibold">{group.heading}</dt>
                <dd className="resume-body text-sm leading-relaxed">{group.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {certificates.length > 0 ? (
          <Section label="Certificates">
            <ul className="space-y-3">
              {certificates.map((item) => (
                <li key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="resume-strong text-sm font-semibold">{item.title}</h3>
                    {item.issuedAt ? (
                      <span className="resume-muted font-mono text-xs">{item.issuedAt}</span>
                    ) : null}
                  </div>
                  <p className="resume-muted text-sm">{item.issuer}</p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </main>
  );
}
