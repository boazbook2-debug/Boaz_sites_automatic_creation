// Shared helpers for querying properties.js — kept separate from the raw data
// so components never need to know how filtering/matching is implemented.

export function getAgentById(agents, id) {
  return agents.find((agent) => agent.id === id) ?? null;
}

export function getSimilarProperties(current, allProperties, limit = 6) {
  return allProperties
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      if (p.location === current.location) score += 2;
      if (p.type === current.type) score += 1;
      if (p.status === current.status) score += 1;
      return { property: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.property);
}

export function uniqueSorted(values) {
  return Array.from(new Set(values)).sort((a, b) =>
    String(a).localeCompare(String(b), "he")
  );
}

// Faceted filtering: OR within a facet (e.g. rooms 3 or 4), AND across facets.
// An empty/absent selection for a facet means "no restriction" on that facet.
export function filterProperties(allProperties, filters) {
  const { status, types = [], rooms = [], locations = [] } = filters;

  return allProperties.filter((p) => {
    if (status && p.status !== status) return false;
    if (types.length > 0 && !types.includes(p.type)) return false;
    if (rooms.length > 0 && !rooms.includes(String(p.rooms))) return false;
    if (locations.length > 0 && !locations.includes(p.location)) return false;
    return true;
  });
}
