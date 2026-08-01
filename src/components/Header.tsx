type HeaderProps = {
  name: string;
  tagline: string;
};

export default function Header({ name, tagline }: HeaderProps) {
  return (
    <header className="glass-card flex items-center justify-between rounded-full px-4 py-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">{name}</p>
        <p className="text-sm text-slate-400">{tagline}</p>
      </div>
      <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
        <a href="#about" className="transition hover:text-white">About</a>
        <a href="#projects" className="transition hover:text-white">Projects</a>
        <a href="#footer" className="transition hover:text-white">Socials</a>
      </nav>
    </header>
  );
}
