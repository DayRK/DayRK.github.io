'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, CardBody, Chip, Input } from '@heroui/react';
import { Copy, ImagePlus, Trash2, Upload } from 'lucide-react';
import type { PortfolioMedia } from '@/lib/db';

export default function AdminMediaPanel() {
  const [media, setMedia] = useState<PortfolioMedia[]>([]);
  const [alt, setAlt] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    try {
      const response = await fetch('/api/media');
      if (response.status === 401) {
        setMessage({ text: 'Your session expired. Please log in again.', tone: 'error' });
        return;
      }
      if (!response.ok) throw new Error('Failed to load media');
      setMedia(await response.json());
    } catch {
      setMessage({ text: 'Could not load the media library.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage({ text: 'Choose an image first.', tone: 'error' });
      return;
    }

    const body = new FormData();
    body.append('file', file);
    body.append('alt', alt);

    setBusy(true);

    try {
      const response = await fetch('/api/media', { method: 'POST', body });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ text: data.error || 'Upload failed.', tone: 'error' });
        return;
      }

      setAlt('');
      if (fileRef.current) fileRef.current.value = '';
      setMessage({ text: 'Image uploaded.', tone: 'success' });
      loadMedia();
    } catch {
      setMessage({ text: 'Upload failed.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this image? The file is removed from storage too.')) return;

    try {
      const response = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMedia((current) => current.filter((item) => item.id !== id));
      setMessage({ text: 'Image deleted.', tone: 'success' });
    } catch {
      setMessage({ text: 'Could not delete the image.', tone: 'error' });
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage({ text: 'Image URL copied.', tone: 'success' });
    } catch {
      setMessage({ text: 'Could not copy the URL.', tone: 'error' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_15px_45px_rgba(4,2,16,0.35)]">
        <CardBody className="gap-4 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Media library</h2>
            <p className="mt-1 text-sm text-slate-400">
              Upload images for projects and posts. JPEG, PNG, WebP, GIF or AVIF, up to 5 MB each.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              type="file"
              accept="image/*"
              ref={fileRef}
              label="Image"
              classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
            />
            <Input
              label="Alt text (optional)"
              value={alt}
              onValueChange={setAlt}
              classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
            />
            <Button
              color="secondary"
              isLoading={busy}
              onPress={upload}
              startContent={!busy ? <Upload size={16} /> : undefined}
              className="font-medium"
            >
              Upload
            </Button>
          </div>

          {message && (
            <p className={message.tone === 'success' ? 'text-sm text-emerald-300' : 'text-sm text-red-300'}>
              {message.text}
            </p>
          )}
        </CardBody>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-400">Loading media...</p>
      ) : media.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-slate-900/60 px-4 py-6 text-slate-400">
          <ImagePlus size={18} />
          <span>No images yet. Upload your first one above.</span>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-900/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt || item.filename} className="h-40 w-full object-cover" />
              <CardBody className="gap-3 p-4">
                <p className="truncate text-sm font-medium text-white" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="flat" className="bg-white/10 text-slate-300">
                    {(item.sizeBytes / 1024).toFixed(0)} KB
                  </Chip>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    className="flex-1 font-medium"
                    startContent={<Copy size={14} />}
                    onPress={() => copyUrl(item.url)}
                  >
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                    aria-label="Delete image"
                    onPress={() => remove(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
