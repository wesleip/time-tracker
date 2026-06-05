interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Header({ title, children, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-bg-secondary border-b border-primary-100 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </header>
  );
}
