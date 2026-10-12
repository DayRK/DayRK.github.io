import AnimatedBackground from '@/components/AnimatedBackground';
import AboutSection from '@/components/AboutSection';
import CertificatesSection from '@/components/CertificatesSection';
import ContactSection from '@/components/ContactSection';
import ExperienceSection from '@/components/ExperienceSection';
import Footer from '@/components/Footer';
import GithubSection from '@/components/GithubSection';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/ProjectsSection';
import { aboutContent, profile, quickFacts, socialLinks } from '@/data/siteContent';
import { fetchAvailability, fetchCertificates, fetchExperience, fetchProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

export default async function Home() {
  let projects: PortfolioProject[] = [];
  let experience: PortfolioExperience[] = [];
  let certificates: PortfolioCertificate[] = [];
  let availability = profile.availability;
  let loadFailed = false;

  try {
    const [portfolioProjects, portfolioAvailability, portfolioExperience, portfolioCertificates] =
      await Promise.all([
        fetchProjects(),
        fetchAvailability(),
        fetchExperience(),
        fetchCertificates(),
      ]);
    projects = portfolioProjects;
    availability = portfolioAvailability;
    experience = portfolioExperience;
    certificates = portfolioCertificates;
  } catch (error) {
    // Logged, and shown to the visitor, so a broken database does not look
    // like an empty portfolio forever.
    loadFailed = true;
    console.error('Failed to load portfolio data', error);
  }

  return (
    <main id="main-content" className="portfolio-shell text-slate-100">
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
        <ExperienceSection experience={experience} loadFailed={loadFailed} />
        <ProjectsSection projects={projects} loadFailed={loadFailed} />
        <CertificatesSection certificates={certificates} loadFailed={loadFailed} />
        <GithubSection />
        <ContactSection email={profile.email} />
        <Footer links={socialLinks} />
      </div>
    </main>
  );
}
