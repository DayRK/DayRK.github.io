import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ProjectRecord = {
  id?: number;
  title?: string;
  summary?: string;
  stack?: unknown;
  link?: string;
  created_at?: string;
  show_preview?: boolean | null;
};

type PortfolioProject = {
  id: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
  showPreview: boolean;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Only the fields the public site renders, so nothing extra is sent to the browser.
const PROJECT_COLUMNS = 'id, title, summary, stack, link, show_preview, created_at';

function makeClient(key: string): SupabaseClient | null {
  if (!supabaseUrl || !key) return null;

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Public read client.
 * Uses the anon key, so row level security still applies. Safe to use when
 * rendering the public site.
 */
export const supabase = makeClient(anonKey);

/**
 * Server-only write client.
 * Uses the service-role key, which bypasses row level security, so this client
 * must only ever be used inside API routes on the server. Never import it into
 * a component that runs in the browser.
 */
let adminClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}

function normalizeStack(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function normalizeProject(raw: ProjectRecord): PortfolioProject {
  return {
    id: Number(raw.id ?? 0),
    title: String(raw.title ?? 'Untitled Project'),
    summary: String(raw.summary ?? ''),
    stack: normalizeStack(raw.stack),
    link: String(raw.link ?? '#'),
    showPreview: typeof raw.show_preview === 'boolean' ? raw.show_preview : true,
  };
}

export async function fetchProjects() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeProject(item as ProjectRecord));
}

export async function createProject(input: { title: string; summary: string; stack: string[]; link: string; showPreview: boolean }) {
  const { error } = await getAdminClient().from('projects').insert({
    title: input.title,
    summary: input.summary,
    stack: input.stack,
    link: input.link,
    show_preview: input.showPreview,
  });

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'create', entity: 'project', actor: 'admin' });
}

export async function updateProject(id: number, input: { title: string; summary: string; stack: string[]; link: string; showPreview: boolean }) {
  const { error } = await getAdminClient()
    .from('projects')
    .update({
      title: input.title,
      summary: input.summary,
      stack: input.stack,
      link: input.link,
      show_preview: input.showPreview,
    })
    .eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'update', entity: 'project', entityId: id, actor: 'admin' });
}

export async function deleteProject(id: number) {
  const { error } = await getAdminClient().from('projects').delete().eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'delete', entity: 'project', entityId: id, actor: 'admin' });
}

type ExperienceRecord = {
  id?: number;
  role?: string;
  company?: string;
  period?: string;
  description?: string;
  sort_order?: number | null;
};

export type PortfolioExperience = {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  sortOrder: number;
};

type CertificateRecord = {
  id?: number;
  title?: string;
  issuer?: string;
  issued_at?: string;
  link?: string | null;
  sort_order?: number | null;
};

export type PortfolioCertificate = {
  id: number;
  title: string;
  issuer: string;
  issuedAt: string;
  link: string;
  sortOrder: number;
};

export type ExperienceInput = {
  role: string;
  company: string;
  period: string;
  description: string;
  sortOrder: number;
};

export type CertificateInput = {
  title: string;
  issuer: string;
  issuedAt: string;
  link: string;
  sortOrder: number;
};

function normalizeExperience(raw: ExperienceRecord): PortfolioExperience {
  return {
    id: Number(raw.id ?? 0),
    role: String(raw.role ?? ''),
    company: String(raw.company ?? ''),
    period: String(raw.period ?? ''),
    description: String(raw.description ?? ''),
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

function normalizeCertificate(raw: CertificateRecord): PortfolioCertificate {
  return {
    id: Number(raw.id ?? 0),
    title: String(raw.title ?? ''),
    issuer: String(raw.issuer ?? ''),
    issuedAt: String(raw.issued_at ?? ''),
    link: String(raw.link ?? ''),
    sortOrder: Number(raw.sort_order ?? 0),
  };
}

export async function fetchExperience() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('experience')
    .select('id, role, company, period, description, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeExperience(item as ExperienceRecord));
}

export async function createExperience(input: ExperienceInput) {
  const { error } = await getAdminClient().from('experience').insert({
    role: input.role,
    company: input.company,
    period: input.period,
    description: input.description,
    sort_order: input.sortOrder,
  });

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'create', entity: 'experience', actor: 'admin' });
}

export async function updateExperience(id: number, input: ExperienceInput) {
  const { error } = await getAdminClient()
    .from('experience')
    .update({
      role: input.role,
      company: input.company,
      period: input.period,
      description: input.description,
      sort_order: input.sortOrder,
    })
    .eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'update', entity: 'experience', entityId: id, actor: 'admin' });
}

export async function deleteExperience(id: number) {
  const { error } = await getAdminClient().from('experience').delete().eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'delete', entity: 'experience', entityId: id, actor: 'admin' });
}

export async function fetchCertificates() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('certificates')
    .select('id, title, issuer, issued_at, link, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeCertificate(item as CertificateRecord));
}

export async function createCertificate(input: CertificateInput) {
  const { error } = await getAdminClient().from('certificates').insert({
    title: input.title,
    issuer: input.issuer,
    issued_at: input.issuedAt,
    link: input.link,
    sort_order: input.sortOrder,
  });

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'create', entity: 'certificate', actor: 'admin' });
}

export async function updateCertificate(id: number, input: CertificateInput) {
  const { error } = await getAdminClient()
    .from('certificates')
    .update({
      title: input.title,
      issuer: input.issuer,
      issued_at: input.issuedAt,
      link: input.link,
      sort_order: input.sortOrder,
    })
    .eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'update', entity: 'certificate', entityId: id, actor: 'admin' });
}

export async function deleteCertificate(id: number) {
  const { error } = await getAdminClient().from('certificates').delete().eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'delete', entity: 'certificate', entityId: id, actor: 'admin' });
}

type PostRecord = {
  id?: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  kind?: string;
  tags?: unknown;
  published?: boolean | null;
  published_at?: string | null;
  created_at?: string | null;
};

export type PortfolioPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  kind: 'blog' | 'research';
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string | null;
};

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  kind: 'blog' | 'research';
  tags: string[];
  published: boolean;
};

// The list views skip the body so a long post never ships to the index page.
const POST_LIST_COLUMNS = 'id, slug, title, excerpt, kind, tags, published, published_at, created_at';
const POST_FULL_COLUMNS = `${POST_LIST_COLUMNS}, content`;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

function normalizePost(raw: PostRecord): PortfolioPost {
  return {
    id: Number(raw.id ?? 0),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? 'Untitled'),
    excerpt: String(raw.excerpt ?? ''),
    content: String(raw.content ?? ''),
    kind: raw.kind === 'research' ? 'research' : 'blog',
    tags: normalizeStack(raw.tags),
    published: raw.published === true,
    publishedAt: raw.published_at ? String(raw.published_at) : null,
    createdAt: raw.created_at ? String(raw.created_at) : null,
  };
}

/** Public feed: published posts only, read with the anon key. */
export async function fetchPosts() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_COLUMNS)
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizePost(item as PostRecord));
}

/** Admin view: every post, drafts included. Server-only (service-role key). */
export async function fetchAllPosts() {
  const { data, error } = await getAdminClient()
    .from('posts')
    .select(POST_LIST_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizePost(item as PostRecord));
}

export async function fetchPostBySlug(slug: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('posts')
    .select(POST_FULL_COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizePost(data as PostRecord) : null;
}

export async function createPost(input: PostInput) {
  const { error } = await getAdminClient().from('posts').insert({
    slug: slugify(input.slug || input.title),
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    kind: input.kind,
    tags: input.tags,
    published: input.published,
    published_at: input.published ? new Date().toISOString() : null,
  });

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'create', entity: 'post', actor: 'admin' });
}

export async function updatePost(id: number, input: PostInput) {
  const { error } = await getAdminClient()
    .from('posts')
    .update({
      slug: slugify(input.slug || input.title),
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      kind: input.kind,
      tags: input.tags,
      published: input.published,
    })
    .eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'update', entity: 'post', entityId: id, actor: 'admin' });
}

export async function deletePost(id: number) {
  const { error } = await getAdminClient().from('posts').delete().eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'delete', entity: 'post', entityId: id, actor: 'admin' });
}

export async function fetchAvailability() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase.from('availability').select('status').limit(1).maybeSingle();

  if (error) {
    throw error;
  }

  return data?.status ?? 'Open to Commissions';
}

export async function updateAvailability(status: string) {
  const { error } = await getAdminClient().from('availability').upsert({ id: 1, status });

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'update', entity: 'availability', actor: 'admin', detail: status });
}

type MediaRecord = {
  id?: number;
  path?: string;
  url?: string;
  filename?: string;
  mime_type?: string;
  size_bytes?: number | null;
  alt?: string | null;
  created_at?: string | null;
};

export type PortfolioMedia = {
  id: number;
  path: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  alt: string;
  createdAt: string | null;
};

type ContactRecord = {
  id?: number;
  name?: string;
  email?: string;
  subject?: string | null;
  message?: string;
  is_read?: boolean | null;
  created_at?: string | null;
};

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string | null;
};

function normalizeMedia(raw: MediaRecord): PortfolioMedia {
  return {
    id: Number(raw.id ?? 0),
    path: String(raw.path ?? ''),
    url: String(raw.url ?? ''),
    filename: String(raw.filename ?? ''),
    mimeType: String(raw.mime_type ?? ''),
    sizeBytes: Number(raw.size_bytes ?? 0),
    alt: String(raw.alt ?? ''),
    createdAt: raw.created_at ? String(raw.created_at) : null,
  };
}

function normalizeContact(raw: ContactRecord): ContactMessage {
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    subject: String(raw.subject ?? ''),
    message: String(raw.message ?? ''),
    isRead: raw.is_read === true,
    createdAt: raw.created_at ? String(raw.created_at) : null,
  };
}

export async function fetchMedia() {
  const { data, error } = await getAdminClient()
    .from('media')
    .select('id, path, url, filename, mime_type, size_bytes, alt, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeMedia(item as MediaRecord));
}

/**
 * Uploads a file to the public storage bucket, then records it in the media
 * table. Only the server holds the service-role key, so the browser cannot
 * write to storage directly.
 */
export async function uploadMedia(input: {
  buffer: ArrayBuffer;
  filename: string;
  mimeType: string;
  alt: string;
}): Promise<PortfolioMedia> {
  const client = getAdminClient();
  const safeName = input.filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(-80);
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await client.storage
    .from('media')
    .upload(path, input.buffer, { contentType: input.mimeType, upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrl } = client.storage.from('media').getPublicUrl(path);
  const url = publicUrl.publicUrl;

  const { data, error } = await client
    .from('media')
    .insert({
      path,
      url,
      filename: input.filename,
      mime_type: input.mimeType,
      size_bytes: input.buffer.byteLength,
      alt: input.alt,
    })
    .select('id, path, url, filename, mime_type, size_bytes, alt, created_at')
    .single();

  if (error) {
    // Roll the upload back so storage does not collect orphaned files.
    await client.storage.from('media').remove([path]);
    throw error;
  }

  await writeAuditLog({ action: 'create', entity: 'media', actor: 'admin', detail: input.filename });

  return normalizeMedia(data as MediaRecord);
}

export async function deleteMedia(id: number) {
  const client = getAdminClient();

  const { data, error } = await client.from('media').select('path').eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.path) {
    await client.storage.from('media').remove([String(data.path)]);
  }

  const { error: deleteError } = await client.from('media').delete().eq('id', id);

  if (deleteError) {
    throw deleteError;
  }

  await writeAuditLog({ action: 'delete', entity: 'media', entityId: id, actor: 'admin' });
}

/**
 * Stores a contact message. Called from the public form, so it uses the
 * server-only client but exposes nothing back to the visitor.
 */
export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { error } = await getAdminClient().from('contact_messages').insert({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  });

  if (error) {
    throw error;
  }
}

export async function fetchContactMessages() {
  const { data, error } = await getAdminClient()
    .from('contact_messages')
    .select('id, name, email, subject, message, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeContact(item as ContactRecord));
}

export async function setContactRead(id: number, isRead: boolean) {
  const { error } = await getAdminClient().from('contact_messages').update({ is_read: isRead }).eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'update', entity: 'contact_message', entityId: id, actor: 'admin' });
}

export async function deleteContactMessage(id: number) {
  const { error } = await getAdminClient().from('contact_messages').delete().eq('id', id);

  if (error) {
    throw error;
  }

  await writeAuditLog({ action: 'delete', entity: 'contact_message', entityId: id, actor: 'admin' });
}

/**
 * Searches the public content with the anon key, so row level security still
 * applies. Only published posts are searched, matching the public blog.
 *
 * The query is escaped before it reaches `ilike`, so a visitor's `%` or `_` is
 * treated as a plain character instead of a wildcard.
 */
export type SearchResults = {
  projects: Array<{ id: number; title: string; summary: string; link: string }>;
  experience: Array<{ id: number; role: string; company: string; description: string }>;
  certificates: Array<{ id: number; title: string; issuer: string }>;
  posts: Array<{ id: number; slug: string; title: string; excerpt: string }>;
};

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (match) => `\\${match}`);
}

export async function searchContent(query: string): Promise<SearchResults> {
  const empty: SearchResults = { projects: [], experience: [], certificates: [], posts: [] };
  const term = query.trim();

  if (!supabase || term.length < 2) {
    return empty;
  }

  const pattern = `%${escapeLike(term)}%`;
  const limit = 10;

  const [projects, experience, certificates, posts] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, summary, link')
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from('experience')
      .select('id, role, company, description')
      .or(`role.ilike.${pattern},company.ilike.${pattern},description.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from('certificates')
      .select('id, title, issuer')
      .or(`title.ilike.${pattern},issuer.ilike.${pattern}`)
      .limit(limit),
    supabase
      .from('posts')
      .select('id, slug, title, excerpt')
      .eq('published', true)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern}`)
      .limit(limit),
  ]);

  // A single failed table should not blank the whole search.
  if (projects.error) console.error('Search projects failed:', projects.error);
  if (experience.error) console.error('Search experience failed:', experience.error);
  if (certificates.error) console.error('Search certificates failed:', certificates.error);
  if (posts.error) console.error('Search posts failed:', posts.error);

  return {
    projects: (projects.data ?? []).map((item) => ({
      id: Number(item.id ?? 0),
      title: String(item.title ?? ''),
      summary: String(item.summary ?? ''),
      link: String(item.link ?? '#'),
    })),
    experience: (experience.data ?? []).map((item) => ({
      id: Number(item.id ?? 0),
      role: String(item.role ?? ''),
      company: String(item.company ?? ''),
      description: String(item.description ?? ''),
    })),
    certificates: (certificates.data ?? []).map((item) => ({
      id: Number(item.id ?? 0),
      title: String(item.title ?? ''),
      issuer: String(item.issuer ?? ''),
    })),
    posts: (posts.data ?? []).map((item) => ({
      id: Number(item.id ?? 0),
      slug: String(item.slug ?? ''),
      title: String(item.title ?? ''),
      excerpt: String(item.excerpt ?? ''),
    })),
  };
}

/**
 * Records an admin action. Audit rows are written with the server-only client,
 * so they cannot be forged from the browser.
 */
export async function writeAuditLog(input: {
  action: string;
  entity: string;
  entityId?: string | number | null;
  actor: string;
  detail?: string;
}) {
  try {
    await getAdminClient().from('audit_log').insert({
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId === undefined || input.entityId === null ? null : String(input.entityId),
      actor: input.actor,
      detail: input.detail ?? null,
    });
  } catch (error) {
    // Never let a logging failure break the action the user asked for.
    console.error('Audit log write failed:', error);
  }
}

export type SystemStats = {
  projects: number;
  experience: number;
  certificates: number;
  posts: number;
  drafts: number;
  media: number;
  unreadMessages: number;
};

export type AuditLogEntry = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  actor: string;
  detail: string | null;
  createdAt: string;
};

/**
 * Counts rows in a table. Uses the server-only client, so it also counts rows
 * the public anon key is not allowed to read.
 */
async function countRows(table: string, match?: Record<string, string | boolean>): Promise<number> {
  let query = getAdminClient().from(table).select('id', { count: 'exact', head: true });

  if (match) {
    for (const [column, value] of Object.entries(match)) {
      query = query.eq(column, value);
    }
  }

  const { count, error } = await query;

  if (error) throw error;

  return count ?? 0;
}

/**
 * A one-glance health summary for the admin dashboard.
 */
export async function fetchSystemStats(): Promise<SystemStats> {
  const [projects, experience, certificates, posts, drafts, media, unreadMessages] =
    await Promise.all([
      countRows('projects'),
      countRows('experience'),
      countRows('certificates'),
      countRows('posts'),
      countRows('posts', { published: false }),
      countRows('media'),
      countRows('contact_messages', { is_read: false }),
    ]);

  return { projects, experience, certificates, posts, drafts, media, unreadMessages };
}

/**
 * The most recent admin actions, newest first.
 */
export async function fetchAuditLog(limit = 25): Promise<AuditLogEntry[]> {
  const { data, error } = await getAdminClient()
    .from('audit_log')
    .select('id, action, entity, entity_id, actor, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: Number(row.id ?? 0),
    action: String(row.action ?? ''),
    entity: String(row.entity ?? ''),
    entityId: row.entity_id === null || row.entity_id === undefined ? null : String(row.entity_id),
    actor: String(row.actor ?? ''),
    detail: row.detail === null || row.detail === undefined ? null : String(row.detail),
    createdAt: String(row.created_at ?? ''),
  }));
}

export default supabase;
