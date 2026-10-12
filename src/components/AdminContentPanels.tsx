'use client';

import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faFloppyDisk, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardBody, Chip, Input, Textarea } from '@heroui/react';

type ExperienceItem = {
  id?: number;
  role: string;
  company: string;
  period: string;
  description: string;
  sortOrder: number;
};

type CertificateItem = {
  id?: number;
  title: string;
  issuer: string;
  issuedAt: string;
  link: string;
  sortOrder: number;
};

type AdminContentPanelsProps = Record<string, never>;

const emptyExperience: ExperienceItem = {
  role: '',
  company: '',
  period: '',
  description: '',
  sortOrder: 0,
};

const emptyCertificate: CertificateItem = {
  title: '',
  issuer: '',
  issuedAt: '',
  link: '',
  sortOrder: 0,
};

const inputClass = 'bg-slate-800/80 border border-white/10';

export default function AdminContentPanels(_props: AdminContentPanelsProps) {
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [newExperience, setNewExperience] = useState<ExperienceItem>(emptyExperience);
  const [newCertificate, setNewCertificate] = useState<CertificateItem>(emptyCertificate);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<CertificateItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
    }),
    []
  );

  useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const loadAll = useCallback(async () => {
    try {
      const [experienceResponse, certificatesResponse] = await Promise.all([
        fetch('/api/experience'),
        fetch('/api/certificates'),
      ]);

      if (experienceResponse.ok) {
        setExperience(await experienceResponse.json());
      }
      if (certificatesResponse.ok) {
        setCertificates(await certificatesResponse.json());
      }
    } catch {
      setStatusMessage({ text: 'Could not load experience and certificates.', tone: 'error' });
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const send = async (
    url: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body?: unknown
  ): Promise<{ ok: boolean; error?: string }> => {
    const response = await fetch(url, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { ok: false, error: (data as { error?: string }).error || 'Request failed' };
    }

    return { ok: true };
  };

  const addExperience = async () => {
    if (!newExperience.role || !newExperience.company || !newExperience.period || !newExperience.description) {
      setStatusMessage({ text: 'Complete the experience fields before saving.', tone: 'error' });
      return;
    }

    const result = await send('/api/experience', 'POST', newExperience);
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not add experience.', tone: 'error' });
      return;
    }

    setNewExperience(emptyExperience);
    loadAll();
    setStatusMessage({ text: 'Experience added successfully.', tone: 'success' });
  };

  const updateExperienceItem = async () => {
    if (!editingExperience || !editingExperienceId) return;

    const result = await send(`/api/experience/${editingExperienceId}`, 'PUT', editingExperience);
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not update experience.', tone: 'error' });
      return;
    }

    setEditingExperienceId(null);
    setEditingExperience(null);
    loadAll();
    setStatusMessage({ text: 'Experience updated successfully.', tone: 'success' });
  };

  const removeExperience = async (id: number) => {
    if (!confirm('Delete this experience entry?')) return;

    const result = await send(`/api/experience/${id}`, 'DELETE');
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not delete experience.', tone: 'error' });
      return;
    }

    loadAll();
    setStatusMessage({ text: 'Experience removed successfully.', tone: 'success' });
  };

  const addCertificate = async () => {
    if (!newCertificate.title || !newCertificate.issuer || !newCertificate.issuedAt) {
      setStatusMessage({ text: 'Complete the certificate fields before saving.', tone: 'error' });
      return;
    }

    const result = await send('/api/certificates', 'POST', newCertificate);
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not add certificate.', tone: 'error' });
      return;
    }

    setNewCertificate(emptyCertificate);
    loadAll();
    setStatusMessage({ text: 'Certificate added successfully.', tone: 'success' });
  };

  const updateCertificateItem = async () => {
    if (!editingCertificate || !editingCertificateId) return;

    const result = await send(`/api/certificates/${editingCertificateId}`, 'PUT', editingCertificate);
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not update certificate.', tone: 'error' });
      return;
    }

    setEditingCertificateId(null);
    setEditingCertificate(null);
    loadAll();
    setStatusMessage({ text: 'Certificate updated successfully.', tone: 'success' });
  };

  const removeCertificate = async (id: number) => {
    if (!confirm('Delete this certificate?')) return;

    const result = await send(`/api/certificates/${id}`, 'DELETE');
    if (!result.ok) {
      setStatusMessage({ text: result.error || 'Could not delete certificate.', tone: 'error' });
      return;
    }

    loadAll();
    setStatusMessage({ text: 'Certificate removed successfully.', tone: 'success' });
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className={`flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 shadow-[0_10px_30px_rgba(4,2,16,0.18)] animate-[fadeIn_0.25s_ease-out] ${statusMessage.tone === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
          {statusMessage.tone === 'success' ? <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 shrink-0" /> : <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
        <CardBody className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Experience</h2>
              <p className="mt-1 text-sm text-slate-400">Work history shown on the public portfolio.</p>
            </div>
            <Chip variant="flat" className="border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
              {experience.length} entries
            </Chip>
          </div>

          <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
            <Input
              label="Role"
              labelPlacement="outside"
              placeholder="Full Stack Developer"
              value={newExperience.role}
              onValueChange={(value) => setNewExperience({ ...newExperience, role: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Company"
                labelPlacement="outside"
                placeholder="Company name"
                value={newExperience.company}
                onValueChange={(value) => setNewExperience({ ...newExperience, company: value })}
                classNames={{ inputWrapper: inputClass }}
              />
              <Input
                label="Period"
                labelPlacement="outside"
                placeholder="2023 - Present"
                value={newExperience.period}
                onValueChange={(value) => setNewExperience({ ...newExperience, period: value })}
                classNames={{ inputWrapper: inputClass }}
              />
            </div>
            <Textarea
              label="Description"
              labelPlacement="outside"
              placeholder="What you did in this role"
              minRows={3}
              value={newExperience.description}
              onValueChange={(value) => setNewExperience({ ...newExperience, description: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <Input
              label="Sort order"
              labelPlacement="outside"
              description="Lower numbers appear first."
              type="number"
              value={String(newExperience.sortOrder)}
              onValueChange={(value) => setNewExperience({ ...newExperience, sortOrder: Number(value) || 0 })}
              classNames={{ inputWrapper: inputClass }}
            />
            <Button color="secondary" fullWidth startContent={<FontAwesomeIcon icon={faPlus} />} onPress={addExperience} className="font-medium">
              Add experience
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {experience.map((item) => (
              <div key={item.id ?? `${item.role}-${item.company}`} className="rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
                {editingExperienceId === item.id && editingExperience ? (
                  <div className="space-y-3">
                    <Input
                      aria-label="Edit role"
                      label="Role"
                      labelPlacement="outside"
                      value={editingExperience.role}
                      onValueChange={(value) => setEditingExperience({ ...editingExperience, role: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit company"
                      label="Company"
                      labelPlacement="outside"
                      value={editingExperience.company}
                      onValueChange={(value) => setEditingExperience({ ...editingExperience, company: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit period"
                      label="Period"
                      labelPlacement="outside"
                      value={editingExperience.period}
                      onValueChange={(value) => setEditingExperience({ ...editingExperience, period: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Textarea
                      aria-label="Edit description"
                      label="Description"
                      labelPlacement="outside"
                      minRows={3}
                      value={editingExperience.description}
                      onValueChange={(value) => setEditingExperience({ ...editingExperience, description: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit sort order"
                      label="Sort order"
                      labelPlacement="outside"
                      type="number"
                      value={String(editingExperience.sortOrder)}
                      onValueChange={(value) => setEditingExperience({ ...editingExperience, sortOrder: Number(value) || 0 })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button color="success" startContent={<FontAwesomeIcon icon={faFloppyDisk} />} onPress={updateExperienceItem} className="flex-1 font-medium">
                        Save
                      </Button>
                      <Button color="default" className="flex-1 font-medium" onPress={() => { setEditingExperienceId(null); setEditingExperience(null); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.role}</h3>
                        <p className="mt-1 text-sm text-fuchsia-200">{item.company} · {item.period}</p>
                      </div>
                      <Chip size="sm" variant="flat" className="bg-slate-700 text-slate-300">#{item.sortOrder}</Chip>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button color="primary" startContent={<FontAwesomeIcon icon={faPenToSquare} />} onPress={() => { setEditingExperienceId(item.id ?? null); setEditingExperience(item); }} className="flex-1 font-medium">
                        Edit
                      </Button>
                      <Button color="danger" startContent={<FontAwesomeIcon icon={faTrash} />} onPress={() => removeExperience(item.id || 0)} className="flex-1 font-medium">
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
        <CardBody className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Certificates</h2>
              <p className="mt-1 text-sm text-slate-400">Credentials shown on the public portfolio.</p>
            </div>
            <Chip variant="flat" className="border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300">
              {certificates.length} entries
            </Chip>
          </div>

          <div className="space-y-4 rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
            <Input
              label="Title"
              labelPlacement="outside"
              placeholder="Certificate title"
              value={newCertificate.title}
              onValueChange={(value) => setNewCertificate({ ...newCertificate, title: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Issuer"
                labelPlacement="outside"
                placeholder="Issuing organization"
                value={newCertificate.issuer}
                onValueChange={(value) => setNewCertificate({ ...newCertificate, issuer: value })}
                classNames={{ inputWrapper: inputClass }}
              />
              <Input
                label="Issued"
                labelPlacement="outside"
                placeholder="March 2024"
                value={newCertificate.issuedAt}
                onValueChange={(value) => setNewCertificate({ ...newCertificate, issuedAt: value })}
                classNames={{ inputWrapper: inputClass }}
              />
            </div>
            <Input
              label="Credential link (optional)"
              labelPlacement="outside"
              placeholder="https://credential.example.com"
              value={newCertificate.link}
              onValueChange={(value) => setNewCertificate({ ...newCertificate, link: value })}
              classNames={{ inputWrapper: inputClass }}
            />
            <Input
              label="Sort order"
              labelPlacement="outside"
              description="Lower numbers appear first."
              type="number"
              value={String(newCertificate.sortOrder)}
              onValueChange={(value) => setNewCertificate({ ...newCertificate, sortOrder: Number(value) || 0 })}
              classNames={{ inputWrapper: inputClass }}
            />
            <Button color="secondary" fullWidth startContent={<FontAwesomeIcon icon={faPlus} />} onPress={addCertificate} className="font-medium">
              Add certificate
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {certificates.map((item) => (
              <div key={item.id ?? `${item.title}-${item.issuer}`} className="rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
                {editingCertificateId === item.id && editingCertificate ? (
                  <div className="space-y-3">
                    <Input
                      aria-label="Edit title"
                      label="Title"
                      labelPlacement="outside"
                      value={editingCertificate.title}
                      onValueChange={(value) => setEditingCertificate({ ...editingCertificate, title: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit issuer"
                      label="Issuer"
                      labelPlacement="outside"
                      value={editingCertificate.issuer}
                      onValueChange={(value) => setEditingCertificate({ ...editingCertificate, issuer: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit issued date"
                      label="Issued"
                      labelPlacement="outside"
                      value={editingCertificate.issuedAt}
                      onValueChange={(value) => setEditingCertificate({ ...editingCertificate, issuedAt: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit credential link"
                      label="Credential link"
                      labelPlacement="outside"
                      value={editingCertificate.link}
                      onValueChange={(value) => setEditingCertificate({ ...editingCertificate, link: value })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <Input
                      aria-label="Edit sort order"
                      label="Sort order"
                      labelPlacement="outside"
                      type="number"
                      value={String(editingCertificate.sortOrder)}
                      onValueChange={(value) => setEditingCertificate({ ...editingCertificate, sortOrder: Number(value) || 0 })}
                      classNames={{ inputWrapper: inputClass }}
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button color="success" startContent={<FontAwesomeIcon icon={faFloppyDisk} />} onPress={updateCertificateItem} className="flex-1 font-medium">
                        Save
                      </Button>
                      <Button color="default" className="flex-1 font-medium" onPress={() => { setEditingCertificateId(null); setEditingCertificate(null); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="mt-1 text-sm text-fuchsia-200">{item.issuer} · {item.issuedAt}</p>
                      </div>
                      <Chip size="sm" variant="flat" className="bg-slate-700 text-slate-300">#{item.sortOrder}</Chip>
                    </div>
                    {item.link ? <p className="mt-2 text-sm text-slate-400">{item.link}</p> : null}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button color="primary" startContent={<FontAwesomeIcon icon={faPenToSquare} />} onPress={() => { setEditingCertificateId(item.id ?? null); setEditingCertificate(item); }} className="flex-1 font-medium">
                        Edit
                      </Button>
                      <Button color="danger" startContent={<FontAwesomeIcon icon={faTrash} />} onPress={() => removeCertificate(item.id || 0)} className="flex-1 font-medium">
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
