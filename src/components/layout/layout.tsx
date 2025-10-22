import type { ReactNode } from "react";
import { Navigation } from "./navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-hexagon-pattern opacity-5 dark:opacity-10"></div>
      
      <Navigation />
      <main className="relative mx-auto max-w-7xl px-4 pt-24 pb-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
