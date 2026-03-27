'use client';

import { TechFreedomView } from '@/components/views/techfreedom-view';
import { useArchitecture, ArchitectureProvider } from '@/hooks/useArchitecture';

function TechFreedomPageContent() {
  const { architecture, isLoading } = useArchitecture();
  return <TechFreedomView architecture={architecture} isLoading={isLoading} />;
}

export default function TechFreedomPage() {
  return (
    <ArchitectureProvider>
      <TechFreedomPageContent />
    </ArchitectureProvider>
  );
}
