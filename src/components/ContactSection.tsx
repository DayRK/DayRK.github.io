'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Input, Textarea } from '@heroui/react';
import { Mail, Send } from 'lucide-react';

type ContactSectionProps = {
  email: string;
};

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const EMPTY_FORM: FormState = { name: '', email: '', subject: '', message: '', website: '' };

export default function ContactSection({ email }: ContactSectionProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || form.message.trim().length < 10) {
      setStatus({ text: 'Please add your name, email and a short message (10+ characters).', tone: 'error' });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus({ text: data.error || 'Could not send your message. Please try again.', tone: 'error' });
        return;
      }

      setForm(EMPTY_FORM);
      setStatus({ text: 'Message sent. Thank you — I will get back to you soon.', tone: 'success' });
    } catch {
      setStatus({ text: 'Could not send your message. Please try again.', tone: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="glass-card overflow-hidden rounded-[2rem] p-8 lg:p-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Contact</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Let&apos;s build something.</h2>
          <p className="max-w-md text-lg leading-8 text-slate-300">
            Have a project, a role or a question? Send a message and I&apos;ll reply directly.
          </p>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 text-fuchsia-200 transition hover:text-fuchsia-100"
          >
            <Mail size={18} />
            <span>{email}</span>
          </a>
        </div>

        <div className="flex-1">
          <Card className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_12px_45px_rgba(2,6,23,0.35)]">
            <CardBody className="gap-4 p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                  label="Name"
                  variant="bordered"
                  value={form.name}
                  onValueChange={(value) => update('name', value)}
                  classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
                />
                <Input
                  label="Email"
                  type="email"
                  variant="bordered"
                  value={form.email}
                  onValueChange={(value) => update('email', value)}
                  classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
                />
              </div>

              <Input
                label="Subject (optional)"
                variant="bordered"
                value={form.subject}
                onValueChange={(value) => update('subject', value)}
                classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
              />

              <Textarea
                label="Message"
                minRows={4}
                variant="bordered"
                value={form.message}
                onValueChange={(value) => update('message', value)}
                classNames={{ inputWrapper: 'bg-slate-700/80 border border-white/10' }}
              />

              {/* Honeypot: hidden from people, tempting to bots. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.website}
                onChange={(event) => update('website', event.target.value)}
                className="hidden"
              />

              {status && (
                <p className={status.tone === 'success' ? 'text-sm text-emerald-300' : 'text-sm text-red-300'}>
                  {status.text}
                </p>
              )}

              <Button
                color="secondary"
                radius="full"
                isLoading={sending}
                onPress={submit}
                endContent={!sending ? <Send size={16} /> : undefined}
                className="font-medium"
              >
                {sending ? 'Sending...' : 'Send message'}
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
