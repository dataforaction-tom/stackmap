import type { Architecture } from '@/lib/types';

export function getTip(pathname: string, arch: Architecture): string {
  const { functions, systems, services, integrations, owners, dataCategories } = arch;

  // Functions step (function-first entry or service-first sub-step)
  if (
    pathname === '/wizard/functions' ||
    pathname === '/wizard/functions/' ||
    pathname === '/wizard/services/functions' ||
    pathname === '/wizard/services/functions/'
  ) {
    if (functions.length === 0) return 'Start by selecting the functions your organisation performs.';
    if (functions.length <= 3) return 'Good start. Most organisations select 5\u20136 functions.';
    if (functions.length >= 6) return 'Great coverage. Continue when you\u2019re happy with your selection.';
    return `${functions.length} functions selected so far.`;
  }

  // Systems step
  if (pathname.startsWith('/wizard/functions/systems') || pathname.startsWith('/wizard/services/systems')) {
    if (systems.length === 0) return 'What software does your team use? Add the tools you rely on.';
    if (systems.length <= 3) return 'Don\u2019t forget spreadsheets and manual processes \u2014 they count too.';
    return `${systems.length} systems mapped across your functions.`;
  }

  // Services step (function-first sub-step or service-first entry)
  if (
    pathname.startsWith('/wizard/functions/services') ||
    pathname === '/wizard/services' ||
    pathname === '/wizard/services/'
  ) {
    if (services.length === 0) return 'What do you deliver to your beneficiaries or customers? Add your programmes and activities here.';
    return `${services.length} service${services.length === 1 ? '' : 's'} mapped.`;
  }

  // Data step
  if (pathname.startsWith('/wizard/functions/data') || pathname.startsWith('/wizard/services/data')) {
    if (dataCategories.length === 0) return 'Flag anything containing personal data \u2014 it helps identify compliance priorities.';
    const personalSystems = new Set(
      dataCategories.filter((d) => d.containsPersonalData).flatMap((d) => d.systemIds),
    );
    if (personalSystems.size > 0)
      return `${personalSystems.size} system${personalSystems.size === 1 ? '' : 's'} hold${personalSystems.size === 1 ? 's' : ''} personal data \u2014 check their security and compliance.`;
    return `${dataCategories.length} data categor${dataCategories.length === 1 ? 'y' : 'ies'} mapped.`;
  }

  // Integrations step
  if (pathname.startsWith('/wizard/functions/integrations') || pathname.startsWith('/wizard/services/integrations')) {
    if (integrations.length === 0) return 'Many small organisations have few integrations \u2014 that\u2019s perfectly normal.';
    const manual = integrations.filter((i) => i.type === 'manual').length;
    if (manual > 0) return `${manual} manual integration${manual === 1 ? '' : 's'} \u2014 these are often the highest-risk areas.`;
    return `${integrations.length} integration${integrations.length === 1 ? '' : 's'} mapped.`;
  }

  // Owners step
  if (pathname.startsWith('/wizard/functions/owners') || pathname.startsWith('/wizard/services/owners')) {
    const unowned = systems.filter((s) => !s.ownerId).length;
    if (unowned > 0) return `${unowned} system${unowned === 1 ? '' : 's'} still need${unowned === 1 ? 's' : ''} an owner.`;
    if (systems.length > 0) return 'Every system has an owner \u2014 that\u2019s great accountability.';
    return 'Assign an owner to each system so responsibilities are clear.';
  }

  // Review step
  if (pathname.startsWith('/wizard/functions/review') || pathname.startsWith('/wizard/services/review')) {
    const retiring = systems.filter((s) => s.status === 'retiring').length;
    if (retiring > 0)
      return `${retiring} retiring system${retiring === 1 ? '' : 's'} \u2014 have you planned replacements?`;
    const parts = [];
    if (functions.length > 0) parts.push(`${functions.length} function${functions.length === 1 ? '' : 's'}`);
    if (systems.length > 0) parts.push(`${systems.length} system${systems.length === 1 ? '' : 's'}`);
    if (integrations.length > 0) parts.push(`${integrations.length} integration${integrations.length === 1 ? '' : 's'}`);
    return parts.length > 0 ? `Your map: ${parts.join(', ')}.` : '';
  }

  return '';
}
