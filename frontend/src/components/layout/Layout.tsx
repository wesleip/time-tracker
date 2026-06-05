import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  title: string;
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function Layout({ title, children, headerExtra }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)}>
          {headerExtra}
        </Header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
