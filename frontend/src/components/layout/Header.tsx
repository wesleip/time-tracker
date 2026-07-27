import { NotificationBell } from "../notifications/NotificationBell";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export function Header({ title, children, onMenuClick, onSidebarToggle, sidebarCollapsed }: HeaderProps) {
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
        <button
          onClick={onSidebarToggle}
          className="hidden md:flex p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors cursor-pointer"
          aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        {children}
      </div>
    </header>
  );
}
