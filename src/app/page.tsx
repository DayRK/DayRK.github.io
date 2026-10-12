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
import { fetchAvailability, fetchCertificates, fetchExperience, fetchModuleVisibility, fetchProjects } from '@/lib/db';
import { isAdminSession } from '@/lib/visibility';
import { isModuleVisible } from '@/lib/modules';

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

  // Visibility decides what renders; a signed-in admin also gets the hidden
  // sections back, clearly marked, so they can keep working on them.
  const [visibility, adminSession] = await Promise.all([fetchModuleVisibility(), isAdminSession()]);

  const show = (key: 'about' | 'projects' | 'experience' | 'certificates' | 'github' | 'contact') =>
    isModuleVisible(visibility, key);

  const previewMode = adminSession &&
    (['about', 'projects', 'experience', 'certificates', 'github', 'contact'] as const).some(
      (key) => !isModuleVisible(visibility, key),
    );

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
      <Header
        name={profile.name}
        visible={{
          about: show('about'),
          experience: show('experience'),
          projects: show('projects'),
          certificates: show('certificates'),
          contact: show('contact'),
        }}
      />
      <AnimatedBackground />
      <main id="main-content" className="shell">
        {previewMode ? (
          <p className="pt-6 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--text-faint)' }}>
            Admin preview — hidden modules are shown to you only
          </p>
        ) : null}
        <HeroSection
          intro={profile.intro}
          description={profile.description}
          email={profile.email}
          availability={availability}
          name={profile.name}
          tagline={profile.tagline}
          stats={stats}
          showContact={show('contact')}
          showProjects={show('projects')}
        />
        {show('projects') ? <ProjectsSection projects={projects} loadFailed={loadFailed} /> : null}
        {show('experience') ? <ExperienceSection experience={experience} loadFailed={loadFailed} /> : null}
        {show('about') ? <AboutSection title={aboutContent.title} sections={aboutContent.sections} /> : null}
        {show('certificates') ? <CertificatesSection certificates={certificates} loadFailed={loadFailed} /> : null}
        {show('github') ? <GithubSection /> : null}
        {show('contact') ? <ContactSection email={profile.email} /> : null}
        <Footer links={socialLinks} />
      </main>
    </>
  );
}
