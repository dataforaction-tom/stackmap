import type { KnownTool } from './types';

export function findMatchingTool(
  input: string,
  tools: KnownTool[],
): KnownTool | null {
  const query = input.trim().toLowerCase();
  if (query.length < 3) return null;

  // Exact name match (case-insensitive)
  const exact = tools.find((t) => t.name.toLowerCase() === query);
  if (exact) return exact;

  // Name contains query or query contains name
  const nameMatch = tools.find(
    (t) =>
      t.name.toLowerCase().includes(query) ||
      query.includes(t.name.toLowerCase()),
  );
  if (nameMatch) return nameMatch;

  // Slug match
  const slugMatch = tools.find(
    (t) => t.slug === query.replace(/\s+/g, '-'),
  );
  if (slugMatch) return slugMatch;

  // Provider match (only if query is long enough to be meaningful)
  if (query.length >= 5) {
    const providerMatch = tools.find((t) =>
      query.includes(t.provider.toLowerCase()),
    );
    if (providerMatch) return providerMatch;
  }

  return null;
}
