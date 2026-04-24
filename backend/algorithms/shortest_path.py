from __future__ import annotations

import time
from typing import Dict, List, Sequence, Tuple


INF = float("inf")


def bellman_ford(
    edges: Sequence[Tuple[int, int, float]],
    vertex_count: int,
    src: int,
) -> Tuple[List[float], List[int], float]:
    dist = [INF] * vertex_count
    parent = [-1] * vertex_count
    dist[src] = 0.0

    start = time.perf_counter()

    for _ in range(vertex_count - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                updated = True
        if not updated:
            break

    exec_time_ms = (time.perf_counter() - start) * 1000
    return dist, parent, exec_time_ms


def reconstruct_bellman_path(parent: Sequence[int], dest: int) -> List[int]:
    path: List[int] = []
    current = dest

    while current != -1:
        path.append(current)
        current = parent[current]

    path.reverse()
    return path


def floyd_warshall(
    matrix: Sequence[Sequence[float]],
) -> Tuple[List[List[float]], List[List[int]], float]:
    vertex_count = len(matrix)
    dist = [list(row) for row in matrix]
    nxt = [[-1 for _ in range(vertex_count)] for _ in range(vertex_count)]

    for i in range(vertex_count):
        for j in range(vertex_count):
            if i != j and dist[i][j] != INF:
                nxt[i][j] = j

    start = time.perf_counter()

    for k in range(vertex_count):
        for i in range(vertex_count):
            dik = dist[i][k]
            if dik == INF:
                continue
            for j in range(vertex_count):
                alt = dik + dist[k][j]
                if alt < dist[i][j]:
                    dist[i][j] = alt
                    nxt[i][j] = nxt[i][k]

    exec_time_ms = (time.perf_counter() - start) * 1000
    return dist, nxt, exec_time_ms


def reconstruct_floyd_path(
    nxt: Sequence[Sequence[int]],
    src: int,
    dest: int,
) -> List[int]:
    if nxt[src][dest] == -1:
        return []

    path = [src]
    while src != dest:
        src = nxt[src][dest]
        if src == -1:
            return []
        path.append(src)
    return path


def to_adjacency_matrix(
    vertex_count: int,
    edges: Sequence[Tuple[int, int, float]],
) -> List[List[float]]:
    matrix = [[INF for _ in range(vertex_count)] for _ in range(vertex_count)]
    for i in range(vertex_count):
        matrix[i][i] = 0.0
    for u, v, w in edges:
        matrix[u][v] = min(matrix[u][v], w)
    return matrix


def alternative_path_from_parent(
    parent: Sequence[int],
    destination: int,
) -> List[int]:
    return reconstruct_bellman_path(parent, destination)
