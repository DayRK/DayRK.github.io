import AnimatedBackground from '@/components/AnimatedBackground';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/ProjectsSection';
import { aboutContent, profile, quickFacts, socialLinks } from '@/data/siteContent';
import { fetchAvailability, fetchProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

type PortfolioProject = {
  id: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
};

export default async function Home() {
  let projects: PortfolioProject[] = [];
  let availability = profile.availability;

  try {
    const [portfolioProjects, portfolioAvailability] = await Promise.all([fetchProjects(), fetchAvailability()]);
    projects = portfolioProjects;
    availability = portfolioAvailability;
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
