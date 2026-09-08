/*
 * SIH26189 - Graph Filtering Utilities
 *
 * These functions prepare the investigation graph before it is
 * rendered by React Force Graph.
 *
 * Why filter before rendering?
 * Large investigation networks may contain hundreds or thousands
 * of nodes and relationships. Rendering only the relevant portion
 * keeps the graph readable and responsive.
 */

// ------------------------------------------------------------
// Filter nodes by selected SIH entity types
// ------------------------------------------------------------

export function filterNodes(nodes, activeFilters) {
  // If no filters are supplied, return the complete graph.
  if (!activeFilters || activeFilters.length === 0) {
    return nodes;
  }

  return nodes.filter((node) =>
    activeFilters.includes(node.entity_type)
  );
}

// ------------------------------------------------------------
// Filter relationships so that broken edges are never rendered
// ------------------------------------------------------------

export function filterLinks(links, filteredNodes) {
  // Create a Set for fast entity lookup.
  //
  // Set.has() is much faster than repeatedly searching through
  // the complete nodes array when the graph becomes large.
  const visibleNodeIds = new Set(
    filteredNodes.map((node) => node.id)
  );

  return links.filter((link) => {
    const sourceId =
      typeof link.source === "object"
        ? link.source.id
        : link.source;

    const targetId =
      typeof link.target === "object"
        ? link.target.id
        : link.target;

    return (
      visibleNodeIds.has(sourceId) &&
      visibleNodeIds.has(targetId)
    );
  });
}

// ------------------------------------------------------------
// Filter the complete graph
// ------------------------------------------------------------

export function filterGraph(graph, activeFilters) {
  const filteredNodes = filterNodes(
    graph.nodes,
    activeFilters
  );

  const filteredLinks = filterLinks(
    graph.links,
    filteredNodes
  );

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

// ------------------------------------------------------------
// Search entities by name, alias or ID
// ------------------------------------------------------------

export function searchNodes(nodes, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return nodes;
  }

  const search = searchTerm
    .trim()
    .toLowerCase();

  return nodes.filter((node) => {
    const name =
      node.canonical_name?.toLowerCase() || "";

    const id =
      node.id?.toLowerCase() || "";

    const aliases = (node.aliases || []).map(
      (alias) => alias.toLowerCase()
    );

    return (
      name.includes(search) ||
      id.includes(search) ||
      aliases.some((alias) =>
        alias.includes(search)
      )
    );
  });
}

// ------------------------------------------------------------
// Get statistics for the currently visible graph
// ------------------------------------------------------------

export function getGraphStatistics(graph) {
  const nodeTypeCounts = {};

  graph.nodes.forEach((node) => {
    const type = node.entity_type;

    nodeTypeCounts[type] =
      (nodeTypeCounts[type] || 0) + 1;
  });

  return {
    totalNodes: graph.nodes.length,
    totalLinks: graph.links.length,
    nodeTypeCounts,
  };
}