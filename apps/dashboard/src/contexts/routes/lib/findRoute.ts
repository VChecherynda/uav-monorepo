export type Edge = {
  id: string;
  weight: number;
};

export type Candidate = {
  id: string;
  prev?: string;
  distance: number;
};

export type AdjacencyList = Record<string, Edge[]>;

const cutItem = (queue: Candidate[]) => {
  let minIndex = 0;
  let minDistance = Infinity;

  queue.forEach((c, idx) => {
    if (minDistance > c.distance) {
      minDistance = c.distance;
      minIndex = idx;
    }
  });

  const minCandidate = queue[minIndex];
  queue.splice(minIndex, 1);
  return minCandidate;
};

export function findRoute(
  graph: AdjacencyList,
  start: Candidate,
  target: string,
): string[] | undefined {
  // Priority queue
  const queue: Candidate[] = [start];
  const seen = new Set<string>();
  const cameFrom = new Map<string, string>();

  while (queue.length) {
    const current = cutItem(queue);
    if (seen.has(current.id)) {
      continue;
    } else {
      seen.add(current.id);
      if (current.prev) {
        cameFrom.set(current.id, current.prev);
      }
      const neighbors = graph[current.id] ?? [];
      neighbors.forEach((n) => {
        queue.push({
          id: n.id,
          distance: n.weight + current.distance,
          prev: current.id,
        });
      });
    }

    if (current.id === target) {
      let cursor = target;
      const shortestPath = [target];
      while (cameFrom.has(cursor)) {
        const prev = cameFrom.get(cursor)!;
        shortestPath.push(prev);
        cursor = prev;
      }
      return shortestPath.reverse();
    }
  }

  return;
}
