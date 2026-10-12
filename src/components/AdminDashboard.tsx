'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCircleCheck, faEye, faPlus, faFloppyDisk, faTrash, faPenToSquare, faPlay } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import AdminContentPanels from '@/components/AdminContentPanels';
import AdminContactPanel from '@/components/AdminContactPanel';
import AdminMediaPanel from '@/components/AdminMediaPanel';
import AdminPostsPanel from '@/components/AdminPostsPanel';
import AdminSystemPanel from '@/components/AdminSystemPanel';
import AdminVisibilityPanel from '@/components/AdminVisibilityPanel';

type Project = {
  id?: number;
  title: string;
  summary: string;
  stack: string[];
  link: string;
  showPreview: boolean;
};

type AdminDashboardProps = Record<string, never>;

const AVAILABILITY_OPTIONS = ['Open to Commissions', 'Limited Availability', 'Closed for Commissions'];

// The database stores stack as an array, but older rows can hold a JSON string.
// This keeps a bad value from throwing and blanking the whole list.
function toStackArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  return [];
}

export default function AdminDashboard(_props: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availability, setAvailability] = useState('Open to Commissions');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    summary: '',
    stack: [],
    link: '',
    showPreview: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'experience' | 'certificates' | 'posts' | 'media' | 'inbox' | 'system' | 'visibility'>('projects');

  useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const [projectsData, availabilityData] = await Promise.all([
          fetch('/api/projects').then(async (response) => {
            if (!response.ok) throw new Error('Failed to fetch projects');
            return response.json();
          }),
          fetch('/api/availability').then(async (response) => {
            if (!response.ok) throw new Error('Failed to fetch availability');
            return response.json();
          }),
        ]);

        if (!isActive) return;

        setProjects(projectsData ?? []);
        setAvailability(availabilityData?.status ?? 'Open to Commissions');
      } catch {
        if (isActive) {
          setError('Failed to load dashboard data');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async () => {
    if (!newProject.title || !newProject.summary || !newProject.link) {
      setError('Please fill in all fields');
      setStatusMessage({ text: 'Please complete the required fields before saving.', tone: 'error' });
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

      setNewProject({ title: '', summary: '', stack: [], link: '', showPreview: true });
      fetchProjects();
      setError('');
      setStatusMessage({ text: 'Project added successfully.', tone: 'success' });
    } catch {
      setError('Failed to add project');
      setStatusMessage({ text: 'Unable to add the project right now.', tone: 'error' });
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
      setStatusMessage({ text: 'Project updated successfully.', tone: 'success' });
    } catch {
      setError('Failed to update project');
      setStatusMessage({ text: 'Unable to update the project right now.', tone: 'error' });
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
      setStatusMessage({ text: 'Project removed successfully.', tone: 'success' });
    } catch {
      setError('Failed to delete project');
      setStatusMessage({ text: 'Unable to delete the project right now.', tone: 'error' });
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
      setStatusMessage({ text: 'Availability updated successfully.', tone: 'success' });
    } catch {
      setError('Failed to update availability');
      setStatusMessage({ text: 'Unable to update availability right now.', tone: 'error' });
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
        <Card className="rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-[0_25px_70px_rgba(4,2,16,0.4)] backdrop-blur">
          <CardBody className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Portfolio control center</p>
                <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Manage your public-facing work with confidence.</h1>
              </div>
              <Chip color="success" variant="flat" className="border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                Secure admin session
              </Chip>
            </div>
          </CardBody>
        </Card>

        {error && (
          <div className="flex items-start gap-3 rounded-[1.25rem] border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 shadow-[0_10px_30px_rgba(239,68,68,0.12)] animate-[fadeIn_0.25s_ease-out]">
            <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div className={`flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 shadow-[0_10px_30px_rgba(4,2,16,0.18)] animate-[fadeIn_0.25s_ease-out] ${statusMessage.tone === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
            {statusMessage.tone === 'success' ? <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 shrink-0" /> : <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {(['projects', 'experience', 'certificates', 'posts', 'media', 'inbox', 'system', 'visibility'] as const).map((tab) => (
            <Button
              key={tab}
              size="sm"
              radius="full"
              variant={activeTab === tab ? 'solid' : 'flat'}
              color={activeTab === tab ? 'secondary' : 'default'}
              onPress={() => setActiveTab(tab)}
              className="font-medium capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'projects' ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <CardBody className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Availability</h2>
                    <p className="mt-1 text-sm text-slate-400">Control the current status shown to visitors.</p>
                  </div>
                  <Chip variant="flat" className="border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
                    Live status
                  </Chip>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Select
                    aria-label="Availability status"
                    className="flex-1"
                    selectedKeys={[availability]}
                    onSelectionChange={(keys) => {
                      const [value] = Array.from(keys as Set<string>);
                      if (value) setAvailability(value);
                    }}
                    classNames={{ trigger: 'bg-slate-800 border border-white/10' }}
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option}>{option}</SelectItem>
                    ))}
                  </Select>
                  <Button
                    color="secondary"
                    startContent={<FontAwesomeIcon icon={faFloppyDisk} />}
                    onPress={updateAvailability}
                    className="px-5 py-3 font-medium"
                  >
                    Save
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <CardBody className="p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold">Add project</h2>
                  <p className="mt-1 text-sm text-slate-400">Create a new portfolio card in seconds.</p>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Project title"
                    labelPlacement="outside"
                    placeholder="Project title"
                    value={newProject.title}
                    onValueChange={(value) => setNewProject({ ...newProject, title: value })}
                    classNames={{ inputWrapper: 'bg-slate-800/80 border border-white/10' }}
                  />
                  <Textarea
                    label="Summary"
                    labelPlacement="outside"
                    placeholder="Project summary"
                    minRows={3}
                    value={newProject.summary}
                    onValueChange={(value) => setNewProject({ ...newProject, summary: value })}
                    classNames={{ inputWrapper: 'bg-slate-800/80 border border-white/10' }}
                  />
                  <Input
                    label="Project link"
                    labelPlacement="outside"
                    placeholder="https://your-project.com"
                    value={newProject.link}
                    onValueChange={(value) => setNewProject({ ...newProject, link: value })}
                    classNames={{ inputWrapper: 'bg-slate-800/80 border border-white/10' }}
                  />
                  <Input
                    label="Stack"
                    labelPlacement="outside"
                    description="Separate each technology with a comma."
                    placeholder="Next.js, TypeScript, Supabase"
                    value={newProject.stack.join(', ')}
                    onValueChange={(value) =>
                      setNewProject({
                        ...newProject,
                        stack: value.split(',').map((item) => item.trim()).filter(Boolean),
                      })
                    }
                    classNames={{ inputWrapper: 'bg-slate-800/80 border border-white/10' }}
                  />
                  <Checkbox
                    isSelected={newProject.showPreview}
                    onValueChange={(isSelected) => setNewProject({ ...newProject, showPreview: isSelected })}
                    className="rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">Show the Live Preview button on the public portfolio</span>
                  </Checkbox>
                  <Button
                    fullWidth
                    color="secondary"
                    startContent={<FontAwesomeIcon icon={faPlus} />}
                    onPress={addProject}
                    className="py-3 font-medium"
                  >
                    Add project
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <CardBody className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Preview</h2>
                    <p className="mt-1 text-sm text-slate-400">See how the portfolio will look in real time.</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/10 p-2 text-fuchsia-300">
                    <FontAwesomeIcon icon={faPlay} size="sm" />
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/80 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">Portfolio preview</p>
                      <p className="text-xs text-slate-500">Status: {availability}</p>
                    </div>
                    <Chip size="sm" variant="flat" className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                      Live
                    </Chip>
                  </div>

                  <div className="rounded-[1rem] border border-white/10 bg-slate-900/70 p-4">
                    <h3 className="text-lg font-semibold text-white">
                      {previewProject?.title || newProject.title || 'Your project title'}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {previewProject?.summary || newProject.summary || 'A polished summary will appear here as soon as you start editing.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(toStackArray(previewProject?.stack).length
                        ? toStackArray(previewProject?.stack)
                        : newProject.stack.length
                          ? newProject.stack
                          : ['React', 'Next.js']
                      ).map((tech) => (
                        <Chip key={tech} size="sm" variant="flat" className="border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                          {tech}
                        </Chip>
                      ))}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200">
                      <FontAwesomeIcon icon={faEye} />
                      <span>{previewProject?.link || newProject.link || 'https://your-link.com'}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
              <CardBody className="p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold">Projects</h2>
                  <p className="mt-1 text-sm text-slate-400">Edit and remove existing portfolio entries.</p>
                </div>
                <div className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="rounded-[1rem] border border-dashed border-white/10 bg-slate-800/50 p-5 text-center text-slate-400">
                      No projects yet. Create your first portfolio card above.
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="rounded-[1rem] border border-white/10 bg-slate-800/50 p-4 transition hover:border-fuchsia-400/25 hover:bg-slate-800/70">
                        {editingId === project.id && editingData ? (
                          <div className="space-y-3">
                            <Input
                              aria-label="Project title"
                              value={editingData.title}
                              onValueChange={(value) => setEditingData({ ...editingData, title: value })}
                              classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
                            />
                            <Textarea
                              aria-label="Project summary"
                              minRows={2}
                              value={editingData.summary}
                              onValueChange={(value) => setEditingData({ ...editingData, summary: value })}
                              classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
                            />
                            <Input
                              aria-label="Project link"
                              value={editingData.link}
                              onValueChange={(value) => setEditingData({ ...editingData, link: value })}
                              classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
                            />
                            <Checkbox
                              isSelected={editingData.showPreview}
                              onValueChange={(isSelected) => setEditingData({ ...editingData, showPreview: isSelected })}
                              className="rounded-lg border border-white/10 bg-slate-700/80 px-3 py-2"
                            >
                              <span className="text-sm text-slate-300">Show the Live Preview button</span>
                            </Checkbox>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button color="success" startContent={<FontAwesomeIcon icon={faFloppyDisk} />} onPress={updateProject} className="flex-1 font-medium">
                                Save
                              </Button>
                              <Button
                                color="default"
                                className="flex-1 font-medium"
                                onPress={() => { setEditingId(null); setEditingData(null); }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-slate-300">{project.summary}</p>
                              </div>
                              <Button
                                isIconOnly
                                variant="flat"
                                aria-label="Preview project"
                                onPress={() => setPreviewProject(project)}
                                className="rounded-full border border-white/10 bg-white/10 text-slate-200"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {toStackArray(project.stack).map((tech) => (
                                <Chip key={tech} size="sm" variant="flat" className="bg-fuchsia-500/20 text-fuchsia-200">
                                  {tech}
                                </Chip>
                              ))}
                            </div>
                            <p className="mt-4 text-sm text-slate-400">{project.link}</p>
                            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                              <Chip
                                size="sm"
                                variant="flat"
                                className={project.showPreview ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}
                              >
                                {project.showPreview ? 'Preview enabled' : 'Preview hidden'}
                              </Chip>
                            </div>
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                              <Button
                                color="primary"
                                startContent={<FontAwesomeIcon icon={faPenToSquare} />}
                                onPress={() => { setEditingId(project.id || null); setEditingData(project); }}
                                className="flex-1 font-medium"
                              >
                                Edit
                              </Button>
                              <Button
                                color="danger"
                                startContent={<FontAwesomeIcon icon={faTrash} />}
                                onPress={() => deleteProject(project.id || 0)}
                                className="flex-1 font-medium"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        ) : activeTab === 'posts' ? (
          <AdminPostsPanel />
        ) : activeTab === 'media' ? (
          <AdminMediaPanel />
        ) : activeTab === 'inbox' ? (
          <AdminContactPanel />
        ) : activeTab === 'system' ? (
          <AdminSystemPanel />
        ) : activeTab === 'visibility' ? (
          <AdminVisibilityPanel />
        ) : (
          <AdminContentPanels />
        )}
      </div>
    </div>
  );
}
