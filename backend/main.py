"""
main.py
FastAPI application – Route Optimisation System backend.

Endpoints:
  GET  /                     health check / API info
  POST /route/bellman-ford   shortest path via Bellman-Ford
  POST /route/floyd-warshall shortest path via Floyd-Warshall
  POST /route/compare        run both algorithms and compare
  GET  /graph/nodes          city list with lat/lng
  POST /traffic/update       randomise traffic weights
  GET  /traffic/current      current traffic multiplier state
"""

import random
import time
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from graph_data import CITY_NODES, build_graph
from algorithms import bellman_ford, floyd_warshall, invalidate_fw_cache

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Smart Route Optimizer",
    description="Shortest-path routing using Bellman-Ford and Floyd-Warshall algorithms.",
    version="1.0.0",
)

# Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mutable graph state (base graph + per-edge traffic multipliers)
# ---------------------------------------------------------------------------

# Base graph rebuilt once at startup
_base_graph = build_graph()

# Traffic multipliers per directed edge key "SRC->DST"  (default 1.0 = no traffic)
_traffic_multipliers: dict[str, float] = {}


def _build_traffic_graph() -> dict:
    """
    Return a copy of the base graph with traffic multipliers applied.
    Each edge weight = base_weight * multiplier.
    """
    graph = {}
    for src, neighbours in _base_graph.items():
        graph[src] = {}
        for dst, base_w in neighbours.items():
            key = f"{src}->{dst}"
            mult = _traffic_multipliers.get(key, 1.0)
            graph[src][dst] = base_w * mult
    return graph


def _current_graph() -> dict:
    return _build_traffic_graph()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class RouteRequest(BaseModel):
    source: str
    destination: str

    @field_validator("source", "destination")
    @classmethod
    def must_be_known_city(cls, v: str) -> str:
        if v not in CITY_NODES:
            raise ValueError(f"Unknown city id '{v}'. Valid ids: {list(CITY_NODES.keys())}")
        return v


class RouteResponse(BaseModel):
    algorithm: str
    source: str
    destination: str
    path: list[str]
    path_names: list[str]
    distance: float          # miles
    execution_time_ms: float
    has_negative_cycle: bool


class CompareResponse(BaseModel):
    source: str
    destination: str
    bellman_ford: RouteResponse
    floyd_warshall: RouteResponse


class TrafficState(BaseModel):
    multipliers: dict[str, float]
    description: str


class TrafficUpdateResponse(BaseModel):
    message: str
    multipliers: dict[str, float]


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _route_response(algorithm: str, source: str, destination: str, result: dict) -> RouteResponse:
    path = result["path"]
    return RouteResponse(
        algorithm=algorithm,
        source=source,
        destination=destination,
        path=path,
        path_names=[CITY_NODES[n]["name"] for n in path],
        distance=result["distance"],
        execution_time_ms=result["execution_time_ms"],
        has_negative_cycle=result["has_negative_cycle"],
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    """Health check – returns API metadata."""
    return {
        "service": "Smart Route Optimizer",
        "version": "1.0.0",
        "status": "ok",
        "algorithms": ["bellman-ford", "floyd-warshall"],
        "cities": len(CITY_NODES),
    }


@app.get("/graph/nodes", tags=["Graph"])
def get_nodes():
    """Return all city nodes with their id, name, latitude and longitude."""
    return {"nodes": list(CITY_NODES.values())}


@app.post("/route/bellman-ford", response_model=RouteResponse, tags=["Routing"])
def route_bellman_ford(req: RouteRequest):
    """Compute shortest path from source to destination using Bellman-Ford."""
    if req.source == req.destination:
        raise HTTPException(status_code=400, detail="Source and destination must differ.")
    graph = _current_graph()
    result = bellman_ford(graph, req.source, req.destination)
    if not result["path"]:
        raise HTTPException(status_code=404, detail="No path found between the selected cities.")
    return _route_response("Bellman-Ford", req.source, req.destination, result)


@app.post("/route/floyd-warshall", response_model=RouteResponse, tags=["Routing"])
def route_floyd_warshall(req: RouteRequest):
    """Compute shortest path from source to destination using Floyd-Warshall (cached)."""
    if req.source == req.destination:
        raise HTTPException(status_code=400, detail="Source and destination must differ.")
    graph = _current_graph()
    result = floyd_warshall(graph, req.source, req.destination)
    if not result["path"]:
        raise HTTPException(status_code=404, detail="No path found between the selected cities.")
    return _route_response("Floyd-Warshall", req.source, req.destination, result)


@app.post("/route/compare", response_model=CompareResponse, tags=["Routing"])
def route_compare(req: RouteRequest):
    """Run both algorithms and return side-by-side results for comparison."""
    if req.source == req.destination:
        raise HTTPException(status_code=400, detail="Source and destination must differ.")
    graph = _current_graph()

    bf_result = bellman_ford(graph, req.source, req.destination)
    fw_result = floyd_warshall(graph, req.source, req.destination)

    if not bf_result["path"] and not fw_result["path"]:
        raise HTTPException(status_code=404, detail="No path found between the selected cities.")

    return CompareResponse(
        source=req.source,
        destination=req.destination,
        bellman_ford=_route_response("Bellman-Ford", req.source, req.destination, bf_result),
        floyd_warshall=_route_response("Floyd-Warshall", req.source, req.destination, fw_result),
    )


@app.post("/traffic/update", response_model=TrafficUpdateResponse, tags=["Traffic"])
def update_traffic():
    """
    Randomise traffic multipliers for all edges (±30% variation around 1.0).
    Invalidates the Floyd-Warshall cache so the next FW request recomputes.
    """
    global _traffic_multipliers
    new_mult = {}
    for src, neighbours in _base_graph.items():
        for dst in neighbours:
            key = f"{src}->{dst}"
            # Multiplier in range [0.70, 1.30]
            new_mult[key] = round(random.uniform(0.70, 1.30), 4)
    _traffic_multipliers = new_mult
    invalidate_fw_cache()
    return TrafficUpdateResponse(
        message="Traffic weights updated successfully.",
        multipliers=new_mult,
    )


@app.get("/traffic/current", response_model=TrafficState, tags=["Traffic"])
def get_traffic():
    """Return current traffic multipliers for all edges."""
    if not _traffic_multipliers:
        desc = "No traffic simulation active – using base distances."
    else:
        avg = sum(_traffic_multipliers.values()) / len(_traffic_multipliers)
        desc = f"Traffic active. Average multiplier: {avg:.3f}"
    return TrafficState(multipliers=_traffic_multipliers, description=desc)
