import { describe, it, expect } from 'vitest';
import { ServiceSchema } from '@/lib/schema';

describe('ServiceSchema', () => {
  it('accepts a service with beneficiaries field', () => {
    const result = ServiceSchema.safeParse({
      id: 's1',
      name: 'Youth mentoring',
      description: 'Supports young people',
      status: 'active',
      functionIds: ['f1'],
      systemIds: [],
      beneficiaries: 'Young people aged 16-25',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.beneficiaries).toBe('Young people aged 16-25');
    }
  });

  it('accepts a service without beneficiaries field', () => {
    const result = ServiceSchema.safeParse({
      id: 's1',
      name: 'Food parcels',
      status: 'active',
      functionIds: [],
      systemIds: [],
    });
    expect(result.success).toBe(true);
  });
});
