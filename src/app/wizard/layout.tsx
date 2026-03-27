'use client';

import { ArchitectureProvider } from '@/hooks/useArchitecture';
import { Stepper } from '@/components/wizard/stepper';
import { TechFreedomToggle } from '@/components/techfreedom/toggle';
import { LiveMapSidebar } from '@/components/wizard/live-map-sidebar';
import type { ReactNode } from 'react';

export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <ArchitectureProvider>
      <div className="min-h-screen bg-surface-50">
        <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
          <Stepper />
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <TechFreedomToggle />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
        <LiveMapSidebar />
      </div>
    </ArchitectureProvider>
  );
}
