from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class Node:
    id: str
    lat: float
    lng: float


# Coordinates are around central Bengaluru to resemble real-world city routing.
NODES: List[Node] = [
    Node("MG Road", 12.9756, 77.6069),
    Node("Indiranagar", 12.9719, 77.6412),
    Node("Koramangala", 12.9352, 77.6245),
    Node("Electronic City", 12.8399, 77.6770),
    Node("Whitefield", 12.9698, 77.7499),
    Node("Hebbal", 13.0358, 77.5970),
    Node("Yeshwantpur", 13.0290, 77.5547),
    Node("Jayanagar", 12.9250, 77.5938),
]

# Base directed edges in kilometers.
BASE_EDGES: List[Tuple[int, int, float]] = [
    (0, 1, 4.2), (1, 0, 4.2),
    (0, 2, 5.1), (2, 0, 5.1),
    (2, 7, 3.6), (7, 2, 3.6),
    (2, 3, 14.5), (3, 2, 14.5),
    (1, 4, 12.8), (4, 1, 12.8),
    (4, 3, 19.4), (3, 4, 19.4),
    (0, 5, 8.0), (5, 0, 8.0),
    (5, 6, 5.2), (6, 5, 5.2),
    (6, 7, 13.1), (7, 6, 13.1),
    (0, 7, 6.8), (7, 0, 6.8),
    (5, 1, 10.4), (1, 5, 10.4),
]


def get_graph_data() -> Dict[str, List[Dict[str, float]]]:
    return {
        "nodes": [
            {"index": index, "id": node.id, "lat": node.lat, "lng": node.lng}
            for index, node in enumerate(NODES)
        ],
        "edges": [
            {
                "from": u,
                "to": v,
                "distance": distance,
            }
            for u, v, distance in BASE_EDGES
        ],
    }


def _traffic_factor(traffic_level: float, edge_index: int) -> float:
    # Deterministic variation gives dynamic-feeling traffic without random cache busting.
    wave = ((edge_index % 5) - 2) * 0.03
    return max(0.85, 1.0 + traffic_level * 0.25 + wave)


def build_weighted_edges(traffic_level: float) -> List[Tuple[int, int, float]]:
    weighted: List[Tuple[int, int, float]] = []
    for idx, (u, v, d) in enumerate(BASE_EDGES):
        factor = _traffic_factor(traffic_level, idx)
        weighted.append((u, v, round(d * factor, 3)))
    return weighted


def graph_signature(traffic_level: float) -> str:
    return f"graph-v1-t{traffic_level:.2f}"
