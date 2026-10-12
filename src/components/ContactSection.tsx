'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

type ContactSectionProps = {
  email: string;
};

type FormState = {
  name: string;
  email: string;
  subject: string;
  budget: string;
  message: string;
  website: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  subject: '',
  budget: '',
  message: '',
  website: '',
};

const BUDGET_OPTIONS = [
  'Under ₱10,000',
  '₱10,000 – ₱25,000',
  '₱25,000 – ₱50,000',
  '₱50,000 +',
  'Not sure yet',
];

export default function ContactSection({ email }: ContactSectionProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

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
    <section id="contact" className="section">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow">006 / Contact</p>
          <h2 className="heading mt-2">Let&apos;s build something.</h2>
          <p className="mt-4 max-w-md leading-7" style={{ color: 'var(--text-muted)' }}>
            Tell me what you have in mind — a project, a role or a question. I reply directly to every
            message.
          </p>
          <a
            href={`mailto:${email}`}
            className="mt-6 inline-flex items-center gap-2 text-sm"
            style={{ color: 'var(--accent)' }}
          >
            <Mail size={16} />
            {email}
          </a>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Name
              </span>
              <input
                className="field"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                autoComplete="name"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Email
              </span>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                autoComplete="email"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Subject <span style={{ color: 'var(--text-faint)' }}>(optional)</span>
              </span>
              <input
                className="field"
                value={form.subject}
                onChange={(event) => update('subject', event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Budget range
              </span>
              <select
                className="field"
                value={form.budget}
                onChange={(event) => update('budget', event.target.value)}
              >
                <option value="">Select a range</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              What are you building?
            </span>
            <textarea
              className="field resize-y"
              rows={5}
              value={form.message}
              onChange={(event) => update('message', event.target.value)}
            />
          </label>

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

          {status ? (
            <p className="text-sm" style={{ color: status.tone === 'success' ? '#6ee7b7' : '#fca5a5' }}>
              {status.text}
            </p>
          ) : null}

          <button type="submit" disabled={sending} className="btn btn-primary self-start disabled:opacity-60">
            {sending ? 'Sending…' : 'Send message'}
            {!sending ? <Send size={15} /> : null}
          </button>
        </form>
      </div>
    </section>
  );
}
