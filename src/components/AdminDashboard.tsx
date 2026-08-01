'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, Eye, Plus, Save, Trash2, Edit2, MonitorPlay } from 'lucide-react';

type Project = {
  id?: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
};

type AdminDashboardProps = {
  token: string;
};

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availability, setAvailability] = useState('Open to Commissions');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    summary: '',
    stack: [],
    link: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchAvailability();
  }, []);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await fetch('/api/availability');
      if (!res.ok) throw new Error('Failed to fetch availability');
      const data = await res.json();
      setAvailability(data.status);
    } catch (err) {
      console.error('Failed to load availability');
    }
  };

  const addProject = async () => {
    if (!newProject.title || !newProject.summary || !newProject.link) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProject),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add project');
        return;
      }

      setNewProject({ title: '', summary: '', stack: [], link: '' });
      fetchProjects();
      setError('');
    } catch (err) {
      setError('Failed to add project');
    }
  };

  const updateProject = async () => {
    if (!editingData || !editingId) return;

    try {
      const res = await fetch(`/api/projects/${editingId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editingData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update project');
        return;
      }

      setEditingId(null);
      setEditingData(null);
      fetchProjects();
      setError('');
    } catch (err) {
      setError('Failed to update project');
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete project');
        return;
      }

      fetchProjects();
      setError('');
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const updateAvailability = async () => {
    try {
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: availability }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update availability');
        return;
      }

      setError('');
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(192,132,252,0.18),_transparent_28%),linear-gradient(135deg,_#04010d_0%,_#12081f_45%,_#080511_100%)] p-6 text-slate-100">
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 px-8 py-6 text-center shadow-[0_25px_70px_rgba(4,2,16,0.4)]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Loading dashboard</p>
          <p className="mt-2 text-lg text-slate-300">Preparing your portfolio controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(192,132,252,0.18),_transparent_28%),linear-gradient(135deg,_#04010d_0%,_#12081f_45%,_#080511_100%)] p-4 text-slate-100 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_25px_70px_rgba(4,2,16,0.4)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Portfolio control center</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Manage your public-facing work with confidence.</h1>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              Secure admin session
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[1.25rem] border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Availability</h2>
                  <p className="mt-1 text-sm text-slate-400">Control the current status shown to visitors.</p>
                </div>
                <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-300">Live status</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 outline-none ring-0"
                >
                  <option>Open to Commissions</option>
                  <option>Limited Availability</option>
                  <option>Closed for Commissions</option>
                </select>
                <button
                  onClick={updateAvailability}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3 font-medium text-white transition hover:bg-fuchsia-700"
                >
                  <Save size={18} /> Save
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Add project</h2>
                  <p className="mt-1 text-sm text-slate-400">Create a new portfolio card in seconds.</p>
                </div>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Project title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-400"
                />
                <textarea
                  placeholder="Project summary"
                  value={newProject.summary}
                  onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                  className="h-24 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-400"
                />
                <input
                  type="text"
                  placeholder="Project link"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-400"
                />
                <input
                  type="text"
                  placeholder="Stack (comma separated)"
                  value={newProject.stack.join(', ')}
                  onChange={(e) => setNewProject({ ...newProject, stack: e.target.value.split(',').map((s) => s.trim()) })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-fuchsia-400"
                />
                <button
                  onClick={addProject}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3 font-medium text-white transition hover:bg-fuchsia-700"
                >
                  <Plus size={18} /> Add project
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Preview</h2>
                  <p className="mt-1 text-sm text-slate-400">See how the portfolio will look in real time.</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 p-2 text-fuchsia-300">
                  <MonitorPlay size={16} />
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">Portfolio preview</p>
                    <p className="text-xs text-slate-500">Status: {availability}</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Live</div>
                </div>

                <div className="rounded-[1rem] border border-white/10 bg-slate-900/70 p-4">
                  <h3 className="text-lg font-semibold text-white">
                    {previewProject?.title || newProject.title || 'Your project title'}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {previewProject?.summary || newProject.summary || 'A polished summary will appear here as soon as you start editing.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(previewProject?.stack?.length ? previewProject.stack : newProject.stack.length ? newProject.stack : ['React', 'Next.js']).map((tech) => (
                      <span key={tech} className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200">
                    <Eye size={14} />
                    <span>{previewProject?.link || newProject.link || 'https://your-link.com'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Projects</h2>
                  <p className="mt-1 text-sm text-slate-400">Edit and remove existing portfolio entries.</p>
                </div>
              </div>
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="rounded-[1rem] border border-dashed border-white/10 bg-slate-800/50 p-5 text-center text-slate-400">
                    No projects yet. Create your first portfolio card above.
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="rounded-[1rem] border border-white/10 bg-slate-800/50 p-4">
                      {editingId === project.id && editingData ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingData.title}
                            onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-slate-700 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-400"
                          />
                          <textarea
                            value={editingData.summary}
                            onChange={(e) => setEditingData({ ...editingData, summary: e.target.value })}
                            className="h-20 w-full rounded-lg border border-white/10 bg-slate-700 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-400"
                          />
                          <input
                            type="text"
                            value={editingData.link}
                            onChange={(e) => setEditingData({ ...editingData, link: e.target.value })}
                            className="w-full rounded-lg border border-white/10 bg-slate-700 px-3 py-2 text-slate-100 outline-none focus:border-fuchsia-400"
                          />
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button onClick={updateProject} className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700">
                              <Save size={16} /> Save
                            </button>
                            <button onClick={() => { setEditingId(null); setEditingData(null); }} className="flex-1 rounded-lg bg-slate-600 px-4 py-2 font-medium text-white transition hover:bg-slate-700">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                              <p className="mt-2 text-sm leading-7 text-slate-300">{project.summary}</p>
                            </div>
                            <button
                              onClick={() => {
                                setPreviewProject(project);
                              }}
                              className="rounded-full border border-white/10 bg-white/10 p-2 text-slate-200 transition hover:bg-white/20"
                              aria-label="Preview project"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {(typeof project.stack === 'string' ? JSON.parse(project.stack) : project.stack).map((tech: string) => (
                              <span key={tech} className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-sm text-fuchsia-200">
                                {tech}
                              </span>
                            ))}
                          </div>
                          <p className="mt-4 text-sm text-slate-400">{project.link}</p>
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <button onClick={() => { setEditingId(project.id || null); setEditingData(project); }} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">
                              <Edit2 size={16} /> Edit
                            </button>
                            <button onClick={() => deleteProject(project.id || 0)} className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
