import type { ReactNode } from 'react';
import { Braces, CircuitBoard, Code2, Cpu, Database, FlaskConical, Layers3, LaptopMinimal, MonitorSmartphone, ServerCog, ShieldCheck, SquareTerminal } from 'lucide-react';

type AboutSectionProps = {
  title: string;
  sections: Array<{
    heading: string;
    items: string[];
  }>;
};

const sectionIconMap = {
  Languages: <Code2 size={16} />,
  'FrontEnd / Mobile': <Layers3 size={16} />,
  'BackEnd / Data': <Database size={16} />,
  Hardware: <Cpu size={16} />,
};

const itemIconMap: Record<string, ReactNode> = {
  JavaScript: <Braces size={14} />,
  PHP: <Code2 size={14} />,
  Lua: <SquareTerminal size={14} />,
  C: <CircuitBoard size={14} />,
  'C++': <CircuitBoard size={14} />,
  'C#': <ShieldCheck size={14} />,
  Python: <FlaskConical size={14} />,
  React: <Layers3 size={14} />,
  HTML5: <MonitorSmartphone size={14} />,
  'Tailwind CSS': <Braces size={14} />,
  'shadcn/ui': <Layers3 size={14} />,
  'Bootstrap 5': <Layers3 size={14} />,
  Laravel: <Code2 size={14} />,
  'Next.js': <Code2 size={14} />,
  Svelte: <Code2 size={14} />,
  MySQL: <Database size={14} />,
  MariaDB: <Database size={14} />,
  MongoDB: <Database size={14} />,
  Firebase: <Database size={14} />,
  'PC / Phone / Laptop Troubleshooting / Repair': <LaptopMinimal size={14} />,
  'PC / Server Building': <ServerCog size={14} />,
};

export default function AboutSection({ title, sections }: AboutSectionProps) {
  return (
    <section id="about" className="glass-card rounded-[2rem] p-8 lg:p-10">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">Technical Sandbox</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.heading} className="rounded-[1.15rem] border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2">
              <span className="text-fuchsia-300">{sectionIconMap[section.heading as keyof typeof sectionIconMap]}</span>
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">{section.heading}</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {section.items.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-sm text-slate-200">
                  <span className="text-fuchsia-300">{itemIconMap[item] ?? <Code2 size={14} />}</span>
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
