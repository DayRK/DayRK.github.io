'use client';

import { Award, ExternalLink } from 'lucide-react';
import { Button, Card, CardBody } from '@heroui/react';

type Certificate = {
  id?: number;
  title: string;
  issuer: string;
  issuedAt: string;
  link: string;
  sortOrder?: number;
};

type CertificatesSectionProps = {
  certificates: Certificate[];
  loadFailed?: boolean;
};

export default function CertificatesSection({ certificates, loadFailed }: CertificatesSectionProps) {
  if (!loadFailed && certificates.length === 0) {
    return null;
  }

  return (
    <section id="certificates" className="glass-card rounded-[2rem] p-8 lg:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Certificates</p>
        {loadFailed && (
          <p className="mt-3 text-sm text-slate-400">
            Certificate content is unavailable right now. Please check back in a moment.
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((item, index) => (
          <Card
            key={item.id ?? `${item.title}-${index}`}
            className="flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-slate-900/70 shadow-none"
          >
            <CardBody className="gap-0 p-4 sm:p-5">
              <span className="text-fuchsia-300">
                <Award size={20} />
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
              <p className="mt-1 text-sm text-fuchsia-200">{item.issuer}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{item.issuedAt}</p>
              {item.link ? (
                <Button
                  as="a"
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  size="sm"
                  radius="full"
                  variant="flat"
                  endContent={<ExternalLink size={14} />}
                  className="mt-4 self-start border border-fuchsia-400/30 bg-fuchsia-400/10 font-medium text-fuchsia-200"
                >
                  View
                </Button>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
