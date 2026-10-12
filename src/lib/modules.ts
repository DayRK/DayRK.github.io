/**
 * The public modules of the site. Each one can be hidden from visitors by the
 * admin, and the list lives here so the database, the API, the admin panel and
 * the public pages all agree on the same keys.
 */
export const MODULE_KEYS = [
  'about',
  'projects',
  'experience',
  'certificates',
  'github',
  'contact',
  'blog',
  'resume',
  'search',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  about: 'About',
  projects: 'Projects',
  experience: 'Experience',
  certificates: 'Certificates',
  github: 'GitHub activity',
  contact: 'Contact form',
  blog: 'Writing / Blog',
  resume: 'Resume',
  search: 'Site search',
};

export const MODULE_DESCRIPTIONS: Record<ModuleKey, string> = {
  about: 'The skills and background summary on the home page.',
  projects: 'The Projects section and its nav link.',
  experience: 'The Experience section and its nav link.',
  certificates: 'The Certificates section and its nav link.',
  github: 'The live GitHub repositories strip.',
  contact: 'The contact form and the "Get in touch" button.',
  blog: 'The Writing index page and every post page.',
  resume: 'The printable resume page.',
  search: 'The site search page and its footer link.',
};

/** Plain lookup: a module with no row in the database is visible. */
export type ModuleVisibility = Record<ModuleKey, boolean>;

export const ALL_MODULES_VISIBLE: ModuleVisibility = MODULE_KEYS.reduce(
  (map, key) => {
    map[key] = true;
    return map;
  },
  {} as ModuleVisibility,
);

export function isModuleVisible(visibility: ModuleVisibility, key: ModuleKey): boolean {
  return visibility[key] !== false;
}

export function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value);
}
