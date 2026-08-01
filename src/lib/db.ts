import { createClient } from '@supabase/supabase-js';

type ProjectRecord = {
  id?: number;
  title?: string;
  summary?: string;
  stack?: unknown;
  link?: string;
  created_at?: string;
};

type PortfolioProject = {
  id: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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
  };
}

export async function fetchProjects() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, summary, stack, link, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => normalizeProject(item as ProjectRecord));
}

export async function createProject(input: { title: string; summary: string; stack: string[]; link: string }) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('projects').insert({
    title: input.title,
    summary: input.summary,
    stack: input.stack,
    link: input.link,
  });

  if (error) {
    throw error;
  }
}

export async function updateProject(id: number, input: { title: string; summary: string; stack: string[]; link: string }) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('projects').update({
    title: input.title,
    summary: input.summary,
    stack: input.stack,
    link: input.link,
  }).eq('id', id);

  if (error) {
    throw error;
  }
}

export async function deleteProject(id: number) {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    throw error;
  }
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
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const { error } = await supabase.from('availability').upsert({ id: 1, status });

  if (error) {
    throw error;
  }
}

export default supabase;
