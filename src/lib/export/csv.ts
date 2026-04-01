import type { Architecture, System } from '@/lib/types';
import { getImportanceTier } from '@/lib/importance';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatType(type: string): string {
  return type
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function annualCost(system: System): string {
  if (!system.cost) return '';
  if (system.cost.model === 'free') return '0';
  const annual = system.cost.period === 'monthly'
    ? system.cost.amount * 12
    : system.cost.amount;
  return String(Math.round(annual));
}

export function generateCsvExport(arch: Architecture): string {
  const headers = [
    'System',
    'Type',
    'Vendor',
    'Hosting',
    'Status',
    'Shadow',
    'Importance',
    'Importance Tier',
    'Annual Cost (GBP)',
    'Cost Model',
    'Functions',
    'Services',
    'Owner',
    'Notes',
  ];

  const rows = arch.systems.map(system => {
    const tier = getImportanceTier(system.importance);
    const functionNames = system.functionIds
      .map(id => arch.functions.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join('; ');
    const serviceNames = system.serviceIds
      .map(id => arch.services.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join('; ');
    const ownerName = system.ownerId
      ? arch.owners.find(o => o.id === system.ownerId)?.name ?? ''
      : '';

    return [
      system.name,
      formatType(system.type),
      system.vendor ?? '',
      formatType(system.hosting),
      formatType(system.status),
      system.isShadow ? 'Yes' : 'No',
      system.importance !== undefined ? String(system.importance) : '',
      tier?.label ?? '',
      annualCost(system),
      system.cost?.model ? formatType(system.cost.model) : '',
      functionNames,
      serviceNames,
      ownerName,
      system.notes ?? '',
    ];
  });

  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(',')),
  ];

  return lines.join('\n');
}
