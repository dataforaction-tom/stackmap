'use client';

import { useState, useCallback } from 'react';
import { ArchitectureProvider, useArchitecture } from '@/hooks/useArchitecture';
import { Stepper } from '@/components/wizard/stepper';
import { TechFreedomToggle } from '@/components/techfreedom/toggle';
import { LiveMapSidebar } from '@/components/wizard/live-map-sidebar';
import { ImportDialog } from '@/components/import/import-dialog';
import { mergeCsvIntoArchitecture } from '@/lib/import';
import type { CsvSystemRow } from '@/lib/import';
import type { ReactNode } from 'react';

function WizardHeader() {
  const { architecture, replaceArchitecture } = useArchitecture();
  const [showImport, setShowImport] = useState(false);

  const handleMergeCsv = useCallback((rows: CsvSystemRow[]) => {
    if (!architecture) return;
    const merged = mergeCsvIntoArchitecture(rows, architecture);
    replaceArchitecture(merged);
    setShowImport(false);
  }, [architecture, replaceArchitecture]);

  return (
    <>
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-end max-w-3xl mx-auto px-4 pt-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-surface-300 text-primary-700 hover:bg-surface-50 transition-colors"
          >
            Import
          </button>
        </div>
        <Stepper />
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <TechFreedomToggle />
        </div>
      </header>
      <ImportDialog
        open={showImport}
        mode="merge"
        onClose={() => setShowImport(false)}
        onImport={(arch) => {
          replaceArchitecture(arch);
          setShowImport(false);
        }}
        onMergeCsv={handleMergeCsv}
      />
    </>
  );
}

export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <ArchitectureProvider>
      <div className="min-h-screen bg-surface-50">
        <WizardHeader />
        <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
        <LiveMapSidebar />
      </div>
    </ArchitectureProvider>
  );
}
