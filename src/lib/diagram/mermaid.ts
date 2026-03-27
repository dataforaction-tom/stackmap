import type { Architecture } from '@/lib/types';

// ─── Label sanitisation ───

/**
 * Sanitise a string for use as a Mermaid node label.
 * Mermaid is sensitive to parentheses, quotes, semicolons, curly braces, etc.
 */
export function sanitiseLabel(label: string): string {
  return label
    .replace(/[(){}[\]"';#&]/g, '')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Integration type labels ───

const INTEGRATION_TYPE_LABELS: Record<string, string> = {
  api: 'API',
  file_transfer: 'File transfer',
  manual: 'Manual',
  webhook: 'Webhook',
  database_link: 'DB link',
  unknown: 'Integration',
};

function integrationLabel(description?: string, type?: string): string {
  if (description) return sanitiseLabel(description);
  return INTEGRATION_TYPE_LABELS[type ?? 'unknown'] ?? 'Integration';
}

// ─── Main diagram: functions as subgraphs, systems as nodes, integrations as edges ───

export function generateMermaidDiagram(arch: Architecture): string {
  const lines: string[] = ['graph TB'];

  const systemIdToFunctions = new Map<string, string[]>();
  for (const sys of arch.systems) {
    systemIdToFunctions.set(sys.id, sys.functionIds);
  }

  // Build function subgraphs
  const systemsPlaced = new Set<string>();

  for (const fn of arch.functions) {
    const fnLabel = sanitiseLabel(fn.name);
    lines.push(`  subgraph ${fnLabel}`);

    const fnSystems = arch.systems.filter((s) => s.functionIds.includes(fn.id));
    for (const sys of fnSystems) {
      const sysLabel = sanitiseLabel(sys.name);
      lines.push(`    ${sys.id}[${sysLabel}]`);
      systemsPlaced.add(sys.id);
    }

    lines.push('  end');
  }

  // Orphan systems (no function assignment)
  const orphans = arch.systems.filter((s) => !systemsPlaced.has(s.id));
  if (orphans.length > 0) {
    for (const sys of orphans) {
      const sysLabel = sanitiseLabel(sys.name);
      lines.push(`  ${sys.id}[${sysLabel}]`);
    }
  }

  // Data category annotations
  const systemDataCategories = new Map<string, string[]>();
  for (const dc of arch.dataCategories) {
    for (const sysId of dc.systemIds) {
      const existing = systemDataCategories.get(sysId) ?? [];
      existing.push(sanitiseLabel(dc.name));
      systemDataCategories.set(sysId, existing);
    }
  }

  for (const [sysId, categories] of systemDataCategories) {
    // Mermaid doesn't have native annotations, so we use a note-style node
    const noteId = `${sysId}_data`;
    const noteLabel = categories.join(', ');
    lines.push(`  ${noteId}[/${noteLabel}/]`);
    lines.push(`  ${sysId} -.- ${noteId}`);
  }

  // Integrations as edges
  for (const intg of arch.integrations) {
    const label = integrationLabel(intg.description, intg.type);
    if (intg.direction === 'two_way') {
      lines.push(`  ${intg.sourceSystemId} <-->|${label}| ${intg.targetSystemId}`);
    } else {
      lines.push(`  ${intg.sourceSystemId} -->|${label}| ${intg.targetSystemId}`);
    }
  }

  return lines.join('\n');
}

// ─── System diagram: flat nodes + integration edges (no function grouping) ───

export function generateSystemDiagram(arch: Architecture): string {
  const lines: string[] = ['graph TB'];

  // All systems as flat nodes
  for (const sys of arch.systems) {
    const sysLabel = sanitiseLabel(sys.name);
    lines.push(`  ${sys.id}[${sysLabel}]`);
  }

  // Integrations as edges
  for (const intg of arch.integrations) {
    const label = integrationLabel(intg.description, intg.type);
    if (intg.direction === 'two_way') {
      lines.push(`  ${intg.sourceSystemId} <-->|${label}| ${intg.targetSystemId}`);
    } else {
      lines.push(`  ${intg.sourceSystemId} -->|${label}| ${intg.targetSystemId}`);
    }
  }

  return lines.join('\n');
}

// ─── Function diagram: functions as subgraphs with systems, no integration edges ───

export function generateFunctionDiagram(arch: Architecture): string {
  const lines: string[] = ['graph TB'];

  const systemsPlaced = new Set<string>();

  for (const fn of arch.functions) {
    const fnLabel = sanitiseLabel(fn.name);
    lines.push(`  subgraph ${fnLabel}`);

    const fnSystems = arch.systems.filter((s) => s.functionIds.includes(fn.id));
    for (const sys of fnSystems) {
      const sysLabel = sanitiseLabel(sys.name);
      lines.push(`    ${sys.id}[${sysLabel}]`);
      systemsPlaced.add(sys.id);
    }

    lines.push('  end');
  }

  // Orphan systems
  const orphans = arch.systems.filter((s) => !systemsPlaced.has(s.id));
  for (const sys of orphans) {
    const sysLabel = sanitiseLabel(sys.name);
    lines.push(`  ${sys.id}[${sysLabel}]`);
  }

  return lines.join('\n');
}
