import { describe, it, expect } from 'vitest';
import { findMatchingTool } from '@/lib/techfreedom/match';
import { KNOWN_TOOLS } from '@/lib/techfreedom/tools';

describe('KNOWN_TOOLS', () => {
  it('has at least 20 tools', () => {
    expect(KNOWN_TOOLS.length).toBeGreaterThanOrEqual(20);
  });

  it('each tool has required fields', () => {
    for (const tool of KNOWN_TOOLS) {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.provider).toBeTruthy();
      expect(tool.score.jurisdiction).toBeGreaterThanOrEqual(1);
      expect(tool.score.jurisdiction).toBeLessThanOrEqual(5);
    }
  });

  it('each tool has scores in valid 1-5 range for all dimensions', () => {
    const dimensions = [
      'jurisdiction',
      'continuity',
      'surveillance',
      'lockIn',
      'costExposure',
    ] as const;
    for (const tool of KNOWN_TOOLS) {
      for (const dim of dimensions) {
        expect(tool.score[dim]).toBeGreaterThanOrEqual(1);
        expect(tool.score[dim]).toBeLessThanOrEqual(5);
      }
    }
  });

  it('each tool has a non-empty keyRisks string', () => {
    for (const tool of KNOWN_TOOLS) {
      expect(tool.keyRisks).toBeTruthy();
    }
  });

  it('each tool has a non-empty category', () => {
    for (const tool of KNOWN_TOOLS) {
      expect(tool.category).toBeTruthy();
    }
  });

  it('has unique slugs', () => {
    const slugs = KNOWN_TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('findMatchingTool', () => {
  it('matches exact name case-insensitively', () => {
    const match = findMatchingTool('xero', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.name).toBe('Xero');
  });

  it('matches partial name', () => {
    const match = findMatchingTool('Microsoft 365', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.slug).toBe('microsoft-365');
  });

  it('matches by provider', () => {
    const match = findMatchingTool('Google Sheets', KNOWN_TOOLS);
    expect(match).not.toBeNull();
  });

  it('returns null for unknown tool', () => {
    expect(findMatchingTool('Totally Unknown App XYZ', KNOWN_TOOLS)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(findMatchingTool('', KNOWN_TOOLS)).toBeNull();
  });

  it('returns null for very short input', () => {
    expect(findMatchingTool('ab', KNOWN_TOOLS)).toBeNull();
  });

  it('matches common abbreviations', () => {
    const match = findMatchingTool('Salesforce', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.slug).toBe('salesforce');
  });

  it('matches slug format input', () => {
    const match = findMatchingTool('proton-mail', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.slug).toBe('proton-mail');
  });

  it('matches when query contains tool name', () => {
    const match = findMatchingTool('we use Slack for comms', KNOWN_TOOLS);
    expect(match).not.toBeNull();
    expect(match!.slug).toBe('slack');
  });
});
