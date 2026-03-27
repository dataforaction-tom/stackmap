import { describe, it, expect } from 'vitest';
import {
  STANDARD_FUNCTIONS,
  getStandardFunctions,
  getStandardFunctionByType,
  createCustomFunction,
} from '@/lib/functions';
import type { StandardFunction, OrgFunction } from '@/lib/types';

describe('Standard Functions Data', () => {
  describe('STANDARD_FUNCTIONS', () => {
    it('should contain all 8 standard function definitions', () => {
      expect(STANDARD_FUNCTIONS).toHaveLength(8);
    });

    it('should have unique types for each function', () => {
      const types = STANDARD_FUNCTIONS.map((f) => f.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(8);
    });

    it('should have all expected standard function types', () => {
      const types = STANDARD_FUNCTIONS.map((f) => f.type);
      const expected: StandardFunction[] = [
        'finance', 'governance', 'people', 'fundraising',
        'communications', 'service_delivery', 'operations', 'data_reporting',
      ];
      for (const t of expected) {
        expect(types).toContain(t);
      }
    });

    it('each function should have a name and description', () => {
      for (const fn of STANDARD_FUNCTIONS) {
        expect(fn.name).toBeTruthy();
        expect(fn.description).toBeTruthy();
        expect(fn.name.length).toBeGreaterThan(0);
        expect(fn.description.length).toBeGreaterThan(0);
      }
    });

    it('each function should have typicalSystems as a non-empty array', () => {
      for (const fn of STANDARD_FUNCTIONS) {
        expect(Array.isArray(fn.typicalSystems)).toBe(true);
        expect(fn.typicalSystems.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getStandardFunctions()', () => {
    it('should return OrgFunction objects with isActive true by default', () => {
      const functions = getStandardFunctions();
      expect(functions).toHaveLength(8);
      for (const fn of functions) {
        expect(fn.isActive).toBe(true);
        expect(fn.id).toBeTruthy();
        expect(fn.name).toBeTruthy();
      }
    });

    it('should return objects matching the OrgFunction interface', () => {
      const functions = getStandardFunctions();
      for (const fn of functions) {
        // Check required OrgFunction fields exist
        expect(fn).toHaveProperty('id');
        expect(fn).toHaveProperty('name');
        expect(fn).toHaveProperty('type');
        expect(fn).toHaveProperty('isActive');
      }
    });

    it('should generate unique ids for each function', () => {
      const functions = getStandardFunctions();
      const ids = functions.map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(8);
    });
  });

  describe('getStandardFunctionByType()', () => {
    it('should return the matching function definition', () => {
      const finance = getStandardFunctionByType('finance');
      expect(finance).toBeDefined();
      expect(finance!.type).toBe('finance');
      expect(finance!.name).toBeTruthy();
    });

    it('should return undefined for non-existent type', () => {
      const result = getStandardFunctionByType('nonexistent' as StandardFunction);
      expect(result).toBeUndefined();
    });

    it('should return correct data for each standard type', () => {
      const types: StandardFunction[] = [
        'finance', 'governance', 'people', 'fundraising',
        'communications', 'service_delivery', 'operations', 'data_reporting',
      ];
      for (const t of types) {
        const fn = getStandardFunctionByType(t);
        expect(fn).toBeDefined();
        expect(fn!.type).toBe(t);
      }
    });
  });

  describe('createCustomFunction()', () => {
    it('should create a custom OrgFunction with a generated id', () => {
      const fn = createCustomFunction('Volunteer Management', 'Managing volunteers');
      expect(fn.name).toBe('Volunteer Management');
      expect(fn.description).toBe('Managing volunteers');
      expect(fn.type).toBe('custom');
      expect(fn.isActive).toBe(true);
      expect(fn.id).toBeTruthy();
    });

    it('should create a function without description', () => {
      const fn = createCustomFunction('Special Projects');
      expect(fn.name).toBe('Special Projects');
      expect(fn.description).toBeUndefined();
      expect(fn.type).toBe('custom');
    });

    it('should generate unique ids for different calls', () => {
      const fn1 = createCustomFunction('Func 1');
      const fn2 = createCustomFunction('Func 2');
      expect(fn1.id).not.toBe(fn2.id);
    });
  });
});
