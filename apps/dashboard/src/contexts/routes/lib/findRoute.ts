export type AdjacencyList = Record<string, string[]>;

export function findRoute(
  graph: AdjacencyList,
  start: string,
  target: string,
): string[] | undefined {
  const queue: string[] = [start];
  const seen = new Set<string>([start]);
  const cameFrom = new Map<string, string>();

  while (queue.length) {
    const current = queue.shift();
    if (current === undefined) {
      return;
    }

    if (current === target) {
      let cursor = target;
      const shortestPath = [target];
      while (cameFrom.has(cursor)) {
        const prev = cameFrom.get(cursor)!;
        shortestPath.push(prev);
        cursor = prev;
      }
      return shortestPath.reverse();
    }

    const neighbors = graph[current] ?? [];
    neighbors.forEach((id) => {
      if (seen.has(id)) {
        return;
      }

      seen.add(id);
      cameFrom.set(id, current);
      queue.push(id);
    });
  }

  return;
}
