import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  title: string;
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function Layout({ title, children, headerExtra }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title}>{headerExtra}</Header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
