"""
algorithms.py
Implements Bellman-Ford and Floyd-Warshall shortest-path algorithms.

Bellman-Ford  – O(V·E), supports negative-weight detection, works on directed graphs.
Floyd-Warshall – O(V³), all-pairs shortest paths, results are cached after first run.
"""

import math
import time
from typing import Optional

# ---------------------------------------------------------------------------
# Bellman-Ford
# ---------------------------------------------------------------------------

def bellman_ford(graph: dict, source: str, destination: str) -> dict:
    """
    Find the shortest path from *source* to *destination* using Bellman-Ford.

    Parameters
    ----------
    graph : dict  {node: {neighbour: weight}}
    source, destination : str  node IDs

    Returns
    -------
    dict with keys:
        path        – ordered list of node IDs  (empty if unreachable)
        distance    – total cost (float or math.inf)
        has_negative_cycle – bool
        execution_time_ms  – wall-clock time in milliseconds
    """
    t0 = time.perf_counter()

    nodes = list(graph.keys())
    n = len(nodes)

    # Flatten adjacency dict into edge list
    edges = []
    for u, neighbours in graph.items():
        for v, w in neighbours.items():
            edges.append((u, v, w))

    # Initialise distances
    dist = {node: math.inf for node in nodes}
    prev = {node: None for node in nodes}
    dist[source] = 0.0

    # Relax edges V-1 times
    for _ in range(n - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
                updated = True
        if not updated:
            break  # early exit – no changes in this pass

    # Detect negative-weight cycles (one more pass)
    has_negative_cycle = False
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            has_negative_cycle = True
            break

    # Reconstruct path
    path = []
    if dist[destination] < math.inf and not has_negative_cycle:
        node = destination
        while node is not None:
            path.append(node)
            node = prev[node]
        path.reverse()

    execution_time_ms = (time.perf_counter() - t0) * 1000

    return {
        "path": path if path and path[0] == source else [],
        "distance": dist[destination] if dist[destination] < math.inf else -1,
        "has_negative_cycle": has_negative_cycle,
        "execution_time_ms": round(execution_time_ms, 4),
    }


# ---------------------------------------------------------------------------
# Floyd-Warshall  (with memoisation / cache)
# ---------------------------------------------------------------------------

# Module-level cache: keyed by a frozenset snapshot of the graph weights
_fw_cache: Optional[dict] = None
_fw_cache_key: Optional[str] = None


def _graph_signature(graph: dict) -> str:
    """Produce a deterministic string key representing the current edge weights."""
    parts = []
    for u in sorted(graph.keys()):
        for v in sorted(graph[u].keys()):
            parts.append(f"{u}-{v}:{graph[u][v]:.4f}")
    return "|".join(parts)


def _run_floyd_warshall(graph: dict) -> dict:
    """
    Run full O(V³) Floyd-Warshall and return the dist/next matrices as dicts.
    """
    nodes = sorted(graph.keys())
    n = len(nodes)
    idx = {node: i for i, node in enumerate(nodes)}

    INF = math.inf
    dist = [[INF] * n for _ in range(n)]
    nxt  = [[None] * n for _ in range(n)]

    # Initialise with direct edges
    for i, u in enumerate(nodes):
        dist[i][i] = 0.0
        for v, w in graph[u].items():
            j = idx[v]
            dist[i][j] = float(w)
            nxt[i][j] = v

    # Relax through intermediate nodes
    for k in range(n):
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                new_d = dist[i][k] + dist[k][j]
                if new_d < dist[i][j]:
                    dist[i][j] = new_d
                    nxt[i][j] = nxt[i][k]

    return {"nodes": nodes, "idx": idx, "dist": dist, "nxt": nxt}


def floyd_warshall(graph: dict, source: str, destination: str) -> dict:
    """
    Find shortest path using Floyd-Warshall (with result caching).

    Returns same schema as bellman_ford().
    """
    global _fw_cache, _fw_cache_key

    t0 = time.perf_counter()

    sig = _graph_signature(graph)
    if _fw_cache_key != sig:
        # Cache miss – recompute
        _fw_cache = _run_floyd_warshall(graph)
        _fw_cache_key = sig

    fw = _fw_cache
    nodes, idx, dist, nxt = fw["nodes"], fw["idx"], fw["dist"], fw["nxt"]

    execution_time_ms = (time.perf_counter() - t0) * 1000

    si = idx.get(source)
    di = idx.get(destination)

    if si is None or di is None or dist[si][di] == math.inf:
        return {
            "path": [],
            "distance": -1,
            "has_negative_cycle": False,
            "execution_time_ms": round(execution_time_ms, 4),
        }

    # Reconstruct path via next-hop matrix
    path = [source]
    cur = source
    while cur != destination:
        cur = nxt[idx[cur]][di]
        if cur is None:
            path = []
            break
        path.append(cur)

    return {
        "path": path,
        "distance": round(dist[si][di], 2),
        "has_negative_cycle": False,
        "execution_time_ms": round(execution_time_ms, 4),
    }


def invalidate_fw_cache():
    """Call this whenever the graph weights change so FW is recomputed on next request."""
    global _fw_cache, _fw_cache_key
    _fw_cache = None
    _fw_cache_key = None
