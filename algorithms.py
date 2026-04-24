import time

def bellman_ford(edges, V, src):
    dist = [float("inf")] * V
    parent = [-1] * V
    dist[src] = 0

    start = time.time()

    for _ in range(V - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u

    exec_time = time.time() - start
    return dist, parent, exec_time


def floyd_warshall(matrix):
    V = len(matrix)
    dist = [row[:] for row in matrix]

    start = time.time()

    for k in range(V):
        for i in range(V):
            for j in range(V):
                dist[i][j] = min(dist[i][j],
                                 dist[i][k] + dist[k][j])

    exec_time = time.time() - start
    return dist, exec_time
