import AnimatedBackground from '@/components/AnimatedBackground';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/ProjectsSection';
import { aboutContent, profile, quickFacts, socialLinks } from '@/data/siteContent';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

type PortfolioProject = {
  id: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
};

function normalizeProject(raw: Record<string, unknown>): PortfolioProject {
  const stackValue = raw.stack;
  let stack: string[] = [];

  if (typeof stackValue === 'string') {
    try {
      const parsed = JSON.parse(stackValue);
      stack = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      stack = [];
    }
  } else if (Array.isArray(stackValue)) {
    stack = stackValue.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  return {
    id: Number(raw.id ?? 0),
    title: String(raw.title ?? 'Untitled Project'),
    summary: String(raw.summary ?? ''),
    stack,
    link: String(raw.link ?? '#'),
  };
}

export default async function Home() {
  let projects: PortfolioProject[] = [];
  let availability = profile.availability;

  try {
    const connection = await pool.getConnection();
    const [projectRows] = await connection.query('SELECT id, title, summary, stack, link FROM projects ORDER BY created_at DESC');
    const [availabilityRows] = await connection.query('SELECT status FROM availability WHERE id = 1');
    connection.release();

    const normalizedProjects = Array.isArray(projectRows)
      ? projectRows.map((project) => normalizeProject(project as Record<string, unknown>))
      : [];

    projects = normalizedProjects;

    const normalizedAvailabilityRows = Array.isArray(availabilityRows) ? availabilityRows : [];
    const rawStatus = normalizedAvailabilityRows[0] && typeof normalizedAvailabilityRows[0] === 'object'
      ? (normalizedAvailabilityRows[0] as { status?: string }).status
      : undefined;

    if (typeof rawStatus === 'string' && rawStatus.trim()) {
      availability = rawStatus;
    }
  } catch (error) {
    console.error('Failed to load portfolio data', error);
  }

  return (
    <main className="portfolio-shell text-slate-100">
      <AnimatedBackground />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <HeroSection
          intro={profile.intro}
          description={profile.description}
          email={profile.email}
          availability={availability}
          facts={quickFacts}
          name={profile.name}
          tagline={profile.tagline}
        />
        <AboutSection title={aboutContent.title} sections={aboutContent.sections} />
        <ProjectsSection projects={projects} />
        <Footer links={socialLinks} />
      </div>
    </main>
  );
}
