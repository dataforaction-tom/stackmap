import { describe, it, expect } from 'vitest';
import { SERVICE_TEMPLATES } from '@/lib/service-templates';

describe('SERVICE_TEMPLATES', () => {
  it('all templates have a non-empty name', () => {
    for (const template of SERVICE_TEMPLATES) {
      expect(template.name.trim().length).toBeGreaterThan(0);
    }
  });

  it('all templates have a non-empty description', () => {
    for (const template of SERVICE_TEMPLATES) {
      expect(template.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('all templates have at least 2 suggested tools', () => {
    for (const template of SERVICE_TEMPLATES) {
      expect(template.suggestedTools.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('has at least 5 templates', () => {
    expect(SERVICE_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it('all template names are unique', () => {
    const names = SERVICE_TEMPLATES.map((t) => t.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});
