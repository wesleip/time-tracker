interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-bg-secondary border-b border-primary-100">
      <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">{children}</div>
    </header>
  );
}
