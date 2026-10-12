'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCircleCheck, faEye, faEyeSlash, faRotate } from '@fortawesome/free-solid-svg-icons';
import { Button, Card, CardBody, Chip, Switch } from '@heroui/react';
import { MODULE_KEYS, MODULE_LABELS, MODULE_DESCRIPTIONS, type ModuleKey } from '@/lib/modules';

type ModuleSetting = Record<ModuleKey, boolean>;

const FALLBACK_SETTINGS = MODULE_KEYS.reduce((map, key) => {
  map[key] = true;
  return map;
}, {} as ModuleSetting);

export default function AdminVisibilityPanel() {
  const [settings, setSettings] = useState<ModuleSetting>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<ModuleKey | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await fetch('/api/visibility');

        if (!response.ok) throw new Error('Failed to load visibility');

        const data = (await response.json()) as Partial<ModuleSetting>;

        if (!isActive) return;

        setSettings({ ...FALLBACK_SETTINGS, ...data });
      } catch {
        if (isActive) setError('Failed to load module visibility.');
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) return;

    const timer = window.setTimeout(() => setStatusMessage(null), 3200);

    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const toggleModule = async (key: ModuleKey, visible: boolean) => {
    const previous = settings;
    setSavingKey(key);
    setSettings({ ...settings, [key]: visible });
    setError('');

    try {
      const response = await fetch('/api/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: key, visible }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setSettings(previous);
        setError(data.error || 'Failed to update visibility');
        setStatusMessage({ text: 'Could not save that change.', tone: 'error' });
        return;
      }

      setStatusMessage({
        text: visible
          ? `${MODULE_LABELS[key]} is visible to everyone again.`
          : `${MODULE_LABELS[key]} is hidden — only you can see it.`,
        tone: 'success',
      });
    } catch {
      setSettings(previous);
      setError('Failed to update visibility');
      setStatusMessage({ text: 'Could not save that change.', tone: 'error' });
    } finally {
      setSavingKey(null);
    }
  };

  const hiddenCount = MODULE_KEYS.filter((key) => settings[key] === false).length;

  if (loading) {
    return (
      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70">
        <CardBody className="p-6">
          <p className="text-sm text-slate-300">Loading visibility settings...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(4,2,16,0.35)]">
        <CardBody className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Public visibility</p>
              <h2 className="mt-2 text-2xl font-semibold">Choose what visitors can see</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                Turn a module off and it disappears from the public site — its nav links, its section and its page.
                Hidden pages return a 404 to visitors, but stay open to you while you are signed in, so you can keep
                working on them.
              </p>
            </div>
            <Chip
              variant="flat"
              className={
                hiddenCount === 0
                  ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
              }
            >
              {hiddenCount === 0 ? 'Everything public' : `${hiddenCount} hidden`}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {error && (
        <div className="flex items-start gap-3 rounded-[1.25rem] border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {statusMessage && (
        <div
          className={`flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 ${
            statusMessage.tone === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/40 bg-red-500/10 text-red-200'
          }`}
        >
          <FontAwesomeIcon
            icon={statusMessage.tone === 'success' ? faCircleCheck : faCircleExclamation}
            className="mt-0.5 shrink-0"
          />
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {MODULE_KEYS.map((key) => {
          const visible = settings[key] !== false;

          return (
            <Card key={key} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70">
              <CardBody className="flex flex-row items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={visible ? faEye : faEyeSlash}
                      className={visible ? 'text-emerald-300' : 'text-amber-300'}
                    />
                    <h3 className="text-base font-semibold text-white">{MODULE_LABELS[key]}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{MODULE_DESCRIPTIONS[key]}</p>
                  <p className="mt-2 text-xs font-medium" style={{ color: visible ? '#6ee7b7' : '#fcd34d' }}>
                    {visible ? 'Visible to everyone' : 'Hidden — admin only'}
                  </p>
                </div>

                <Switch
                  isSelected={visible}
                  isDisabled={savingKey === key}
                  onValueChange={(isSelected) => toggleModule(key, isSelected)}
                  aria-label={`Show ${MODULE_LABELS[key]} to the public`}
                  color="secondary"
                />
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Button
        variant="flat"
        startContent={<FontAwesomeIcon icon={faRotate} />}
        onPress={() => window.location.reload()}
        className="font-medium"
      >
        Refresh
      </Button>
    </div>
  );
}
