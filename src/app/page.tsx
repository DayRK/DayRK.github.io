import AnimatedBackground from '@/components/AnimatedBackground';
import AboutSection from '@/components/AboutSection';
import CertificatesSection from '@/components/CertificatesSection';
import ContactSection from '@/components/ContactSection';
import ExperienceSection from '@/components/ExperienceSection';
import Footer from '@/components/Footer';
import GithubSection from '@/components/GithubSection';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProjectsSection from '@/components/ProjectsSection';
import { aboutContent, profile, socialLinks } from '@/data/siteContent';
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

  // Real numbers, not decoration: a stat with nothing behind it is hidden.
  const stats = [
    { label: 'Technologies', value: aboutContent.sections.reduce((total, item) => total + item.items.length, 0) },
    { label: 'Projects', value: projects.length },
    { label: 'Roles', value: experience.length },
    { label: 'Certificates', value: certificates.length },
  ].filter((stat) => stat.value > 0);

  return (
    <>
      <Header name={profile.name} />
      <AnimatedBackground />
      <main id="main-content" className="shell">
        <HeroSection
          intro={profile.intro}
          description={profile.description}
          email={profile.email}
          availability={availability}
          name={profile.name}
          tagline={profile.tagline}
          stats={stats}
        />
        <ProjectsSection projects={projects} loadFailed={loadFailed} />
        <ExperienceSection experience={experience} loadFailed={loadFailed} />
        <AboutSection title={aboutContent.title} sections={aboutContent.sections} />
        <CertificatesSection certificates={certificates} loadFailed={loadFailed} />
        <GithubSection />
        <ContactSection email={profile.email} />
        <Footer links={socialLinks} />
      </main>
    </>
  );
}
