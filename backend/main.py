from __future__ import annotations

from functools import lru_cache
from typing import Dict, List, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from algorithms.shortest_path import (
    bellman_ford,
    floyd_warshall,
    reconstruct_bellman_path,
    reconstruct_floyd_path,
    to_adjacency_matrix,
)
from services.graph_service import NODES, build_weighted_edges, get_graph_data, graph_signature


app = FastAPI(title="Route Optimizer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RouteRequest(BaseModel):
    source: int = Field(ge=0)
    destination: int = Field(ge=0)
    traffic_level: float = Field(default=0.0, ge=0.0, le=1.0)


class RouteSuggestion(BaseModel):
    path: List[int]
    distance: float


class RouteResponse(BaseModel):
    algorithm: Literal["bellman-ford", "floyd-warshall"]
    path: List[int]
    path_labels: List[str]
    path_coordinates: List[Dict[str, float]]
    distance: float
    execution_time_ms: float
    alternatives: List[RouteSuggestion]
    graph_signature: str


class CompareResponse(BaseModel):
    source: int
    destination: int
    traffic_level: float
    bellman_ford_ms: float
    floyd_warshall_ms: float
    winner: str


def _validate_indices(source: int, destination: int) -> None:
    max_index = len(NODES) - 1
    if source > max_index or destination > max_index:
        raise HTTPException(status_code=400, detail="Source or destination out of range")


@lru_cache(maxsize=64)
def _cached_floyd(traffic_signature: str):
    traffic_level = float(traffic_signature.split("t")[-1])
    edges = build_weighted_edges(traffic_level)
    matrix = to_adjacency_matrix(len(NODES), edges)
    return floyd_warshall(matrix)


def _path_details(path: List[int]) -> tuple[List[str], List[Dict[str, float]]]:
    labels = [NODES[i].id for i in path]
    coordinates = [{"lat": NODES[i].lat, "lng": NODES[i].lng} for i in path]
    return labels, coordinates


def _alternative_route(
    source: int,
    destination: int,
    edges: List[tuple[int, int, float]],
    primary_path: List[int],
) -> RouteSuggestion | None:
    if len(primary_path) < 2:
        return None

    penalized_edges = edges[:]
    first_leg = (primary_path[0], primary_path[1])

    for idx, (u, v, w) in enumerate(penalized_edges):
        if (u, v) == first_leg:
            penalized_edges[idx] = (u, v, w * 2.2)

    dist, parent, _ = bellman_ford(penalized_edges, len(NODES), source)
    alt_path = reconstruct_bellman_path(parent, destination)

    if not alt_path or alt_path == primary_path or dist[destination] == float("inf"):
        return None

    return RouteSuggestion(path=alt_path, distance=round(dist[destination], 3))


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/graph")
def graph():
    return get_graph_data()


@app.post("/route/bellman-ford", response_model=RouteResponse)
def route_bellman_ford(payload: RouteRequest):
    _validate_indices(payload.source, payload.destination)

    edges = build_weighted_edges(payload.traffic_level)
    dist, parent, execution_time_ms = bellman_ford(edges, len(NODES), payload.source)

    if dist[payload.destination] == float("inf"):
        raise HTTPException(status_code=404, detail="No route found")

    path = reconstruct_bellman_path(parent, payload.destination)
    labels, coordinates = _path_details(path)

    alternatives: List[RouteSuggestion] = []
    alt = _alternative_route(payload.source, payload.destination, edges, path)
    if alt is not None:
        alternatives.append(alt)

    return RouteResponse(
        algorithm="bellman-ford",
        path=path,
        path_labels=labels,
        path_coordinates=coordinates,
        distance=round(dist[payload.destination], 3),
        execution_time_ms=round(execution_time_ms, 4),
        alternatives=alternatives,
        graph_signature=graph_signature(payload.traffic_level),
    )


@app.post("/route/floyd-warshall", response_model=RouteResponse)
def route_floyd_warshall(payload: RouteRequest):
    _validate_indices(payload.source, payload.destination)

    signature = graph_signature(payload.traffic_level)
    dist, nxt, execution_time_ms = _cached_floyd(signature)

    if dist[payload.source][payload.destination] == float("inf"):
        raise HTTPException(status_code=404, detail="No route found")

    path = reconstruct_floyd_path(nxt, payload.source, payload.destination)
    labels, coordinates = _path_details(path)

    edges = build_weighted_edges(payload.traffic_level)
    alternatives: List[RouteSuggestion] = []
    alt = _alternative_route(payload.source, payload.destination, edges, path)
    if alt is not None:
        alternatives.append(alt)

    return RouteResponse(
        algorithm="floyd-warshall",
        path=path,
        path_labels=labels,
        path_coordinates=coordinates,
        distance=round(dist[payload.source][payload.destination], 3),
        execution_time_ms=round(execution_time_ms, 4),
        alternatives=alternatives,
        graph_signature=signature,
    )


@app.post("/route/compare", response_model=CompareResponse)
def compare_algorithms(payload: RouteRequest):
    _validate_indices(payload.source, payload.destination)

    edges = build_weighted_edges(payload.traffic_level)
    b_dist, _, bellman_ms = bellman_ford(edges, len(NODES), payload.source)

    signature = graph_signature(payload.traffic_level)
    f_dist, _, floyd_ms = _cached_floyd(signature)

    if b_dist[payload.destination] == float("inf") or f_dist[payload.source][payload.destination] == float("inf"):
        raise HTTPException(status_code=404, detail="No route found")

    winner = "bellman-ford" if bellman_ms <= floyd_ms else "floyd-warshall"

    return CompareResponse(
        source=payload.source,
        destination=payload.destination,
        traffic_level=payload.traffic_level,
        bellman_ford_ms=round(bellman_ms, 4),
        floyd_warshall_ms=round(floyd_ms, 4),
        winner=winner,
    )
