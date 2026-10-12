'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { Mail, Trash2 } from 'lucide-react';
import type { ContactMessage } from '@/lib/db';

export default function AdminContactPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/contact');
      if (response.status === 401) {
        setError('Your session expired. Please log in again.');
        return;
      }
      if (!response.ok) throw new Error('Failed to load messages');
      setMessages(await response.json());
      setError('');
    } catch {
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const toggleRead = async (message: ContactMessage) => {
    try {
      const response = await fetch(`/api/contact/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !message.isRead }),
      });
      if (!response.ok) throw new Error('Failed to update');
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? { ...item, isRead: !item.isRead } : item))
      );
    } catch {
      setError('Could not update the message.');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this message?')) return;

    try {
      const response = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMessages((current) => current.filter((item) => item.id !== id));
    } catch {
      setError('Could not delete the message.');
    }
  };

  const unread = messages.filter((message) => !message.isRead).length;

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_15px_45px_rgba(4,2,16,0.35)]">
        <CardBody className="flex flex-row items-center justify-between p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Inbox</h2>
            <p className="mt-1 text-sm text-slate-400">Messages sent from the contact form on your site.</p>
          </div>
          <Chip
            variant="flat"
            className={unread > 0 ? 'bg-fuchsia-500/20 text-fuchsia-200' : 'bg-white/10 text-slate-300'}
          >
            {unread} unread
          </Chip>
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-[1.25rem] border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">{error}</div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading messages...</p>
      ) : messages.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-slate-900/60 px-4 py-6 text-slate-400">
          <Mail size={18} />
          <span>No messages yet.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`rounded-[1.25rem] border bg-slate-900/70 ${
                message.isRead ? 'border-white/10' : 'border-fuchsia-400/40'
              }`}
            >
              <CardBody className="gap-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {message.name} <span className="font-normal text-slate-400">&lt;{message.email}&gt;</span>
                    </p>
                    {message.subject && <p className="text-sm text-slate-300">{message.subject}</p>}
                  </div>
                  <span className="text-xs text-slate-500">
                    {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
                  </span>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{message.message}</p>

                <div className="flex gap-2">
                  <Button size="sm" variant="flat" className="font-medium" onPress={() => toggleRead(message)}>
                    {message.isRead ? 'Mark unread' : 'Mark read'}
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    startContent={<Trash2 size={14} />}
                    onPress={() => remove(message.id)}
                    className="font-medium"
                  >
                    Delete
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
