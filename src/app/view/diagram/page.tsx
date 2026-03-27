'use client';

import { DiagramView } from '@/components/views/diagram-view';
import { useArchitecture, ArchitectureProvider } from '@/hooks/useArchitecture';

function DiagramPageContent() {
  const { architecture, isLoading } = useArchitecture();
  return <DiagramView architecture={architecture} isLoading={isLoading} />;
}

export default function DiagramPage() {
  return (
    <ArchitectureProvider>
      <DiagramPageContent />
    </ArchitectureProvider>
  );
}
