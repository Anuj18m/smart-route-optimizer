"""
graph_data.py
Defines the city graph: nodes (cities with lat/lng) and weighted edges (road distances in miles).
~15 major US cities with realistic approximate coordinates and distances.
"""

# City nodes: id -> { name, lat, lng }
CITY_NODES = {
    "NYC": {"id": "NYC", "name": "New York",      "lat": 40.7128, "lng": -74.0060},
    "LAX": {"id": "LAX", "name": "Los Angeles",   "lat": 34.0522, "lng": -118.2437},
    "CHI": {"id": "CHI", "name": "Chicago",        "lat": 41.8781, "lng": -87.6298},
    "HOU": {"id": "HOU", "name": "Houston",        "lat": 29.7604, "lng": -95.3698},
    "PHX": {"id": "PHX", "name": "Phoenix",        "lat": 33.4484, "lng": -112.0740},
    "PHL": {"id": "PHL", "name": "Philadelphia",   "lat": 39.9526, "lng": -75.1652},
    "SAT": {"id": "SAT", "name": "San Antonio",    "lat": 29.4241, "lng": -98.4936},
    "SAN": {"id": "SAN", "name": "San Diego",      "lat": 32.7157, "lng": -117.1611},
    "DAL": {"id": "DAL", "name": "Dallas",         "lat": 32.7767, "lng": -96.7970},
    "SJC": {"id": "SJC", "name": "San Jose",       "lat": 37.3382, "lng": -121.8863},
    "AUS": {"id": "AUS", "name": "Austin",         "lat": 30.2672, "lng": -97.7431},
    "JAX": {"id": "JAX", "name": "Jacksonville",   "lat": 30.3322, "lng": -81.6557},
    "FTW": {"id": "FTW", "name": "Fort Worth",     "lat": 32.7555, "lng": -97.3308},
    "CMH": {"id": "CMH", "name": "Columbus",       "lat": 39.9612, "lng": -82.9988},
    "CLT": {"id": "CLT", "name": "Charlotte",      "lat": 35.2271, "lng": -80.8431},
}

# Directed edges: (source_id, destination_id, base_distance_miles)
# Each edge is added bidirectionally in build_graph(); weights represent approximate road miles.
BASE_EDGES = [
    # East Coast corridor
    ("NYC", "PHL",  95),
    ("PHL", "CMH", 460),
    ("CMH", "CHI", 355),
    ("NYC", "CMH", 510),
    ("PHL", "CLT", 485),
    ("CLT", "JAX", 380),
    ("CMH", "CLT", 420),

    # South / Gulf
    ("JAX", "HOU", 790),
    ("HOU", "SAT", 200),
    ("SAT", "AUS",  80),
    ("AUS", "DAL", 195),
    ("DAL", "FTW",  30),
    ("FTW", "DAL",  30),  # near neighbours
    ("DAL", "HOU", 240),

    # Central / Midwest
    ("CHI", "DAL", 920),
    ("CHI", "HOU",1090),

    # West Coast / Southwest
    ("PHX", "SAN", 355),
    ("SAN", "LAX", 120),
    ("LAX", "SJC", 345),
    ("SJC", "LAX", 345),
    ("PHX", "LAX", 370),
    ("PHX", "DAL", 1020),
    ("PHX", "HOU", 1175),

    # Cross-country
    ("LAX", "CHI", 2020),
    ("NYC", "CHI",  790),
    ("DAL", "AUS",  195),
    ("AUS", "SAT",   80),
    ("SJC", "PHX",  755),
    ("CLT", "CMH",  420),
]


def build_graph():
    """
    Build a bidirectional adjacency dict from BASE_EDGES.
    Returns: { node_id: { neighbour_id: weight, ... }, ... }
    Traffic multipliers are applied on top of these base weights at runtime.
    """
    graph = {node: {} for node in CITY_NODES}
    for src, dst, dist in BASE_EDGES:
        graph[src][dst] = dist
        # Only add reverse if it doesn't already exist (avoids overwriting explicit reverses)
        if src not in graph[dst]:
            graph[dst][src] = dist
    return graph


def get_all_edges(graph):
    """Return a flat list of (src, dst, weight) tuples from the adjacency dict."""
    edges = []
    seen = set()
    for src, neighbours in graph.items():
        for dst, w in neighbours.items():
            key = tuple(sorted([src, dst]))
            if key not in seen:
                seen.add(key)
                edges.append((src, dst, w))
    return edges
