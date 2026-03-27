'use client';

import { usePathname } from 'next/navigation';
import { useArchitecture } from '@/hooks/useArchitecture';
import { getTip } from './tips';

export function ContextualTip() {
  const pathname = usePathname();
  const { architecture } = useArchitecture();

  if (!architecture) return null;

  const tip = getTip(pathname, architecture);
  if (!tip) return null;

  return (
    <p className="text-sm text-primary-600 leading-relaxed" role="status">
      {tip}
    </p>
  );
}
