# Route Optimizer Pro

A production-grade route optimization platform that demonstrates and compares two classic shortest-path algorithms, Bellman-Ford and Floyd-Warshall, in a modern map-first web experience.

The project combines:
- A FastAPI backend for high-performance route computation
- A premium React frontend with animated map visualization
- Traffic-aware dynamic edge weighting
- Real-time algorithm performance comparison

---

## Table of Contents

- Overview
- Key Features
- Tech Stack
- System Architecture
- Repository Structure
- Getting Started
- Configuration
- API Reference
- Algorithm Notes
- UI/UX and Interaction Design
- Performance Considerations
- Troubleshooting
- Roadmap

---

## Overview

Route Optimizer Pro is designed to move beyond an academic demonstration and provide a practical, polished experience similar to modern mobility and navigation products.

Users can:
- Select source and destination nodes
- Switch between Bellman-Ford and Floyd-Warshall
- Simulate traffic intensity dynamically
- Visualize computed routes directly on a map
- Compare runtime performance of both algorithms
- Inspect route alternatives and key metrics

---

## Key Features

### Core Routing Capabilities
- Bellman-Ford endpoint for single-source shortest path
- Floyd-Warshall endpoint for all-pairs shortest path
- Route path, distance, and execution time returned from API
- Alternative route suggestion via first-leg penalization strategy

### Simulation and Realism
- Deterministic traffic simulation through dynamic edge weighting
- Graph coordinates mapped to Bengaluru city landmarks for realism
- Draggable source and destination markers on map

### Premium Frontend Experience
- Full-screen map-first layout (80vh)
- Floating glassmorphism control panel
- Smooth route reveal animation
- Dark and light theme support with adaptive tile styles
- Live metrics cards and algorithm comparison chart
- Debounced UI interactions for smoother computation flow

### Engineering and Performance
- Floyd-Warshall memoization via traffic signature cache
- Optimized Bellman-Ford early-exit behavior
- Centralized state management with Zustand
- API integration using Axios

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- React Leaflet + Leaflet
- Zustand
- Recharts
- Axios

### Backend
- FastAPI
- Pydantic
- Uvicorn

### Runtime
- Node.js 18+ (recommended)
- Python 3.12+ (3.14 supported with current dependency ranges)

---

## System Architecture

1. Frontend initializes by requesting graph metadata.
2. User interactions (source, destination, algorithm, traffic level) update global UI state.
3. Route requests are sent to the selected algorithm endpoint.
4. Backend computes route, path geometry, alternatives, and timing metrics.
5. Frontend animates route drawing and displays metrics + comparison chart.

---

## Repository Structure

```text
route-optimizer/
  backend/
    algorithms/
      __init__.py
      shortest_path.py
    services/
      __init__.py
      graph_service.py
      sample_graph.json
    main.py
    requirements.txt

  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      store/
    index.html
    package.json
    tailwind.config.js
    vite.config.js

  Screenshots/
  .gitignore
  README.md
```

---

## Getting Started

## 1) Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend will start at:
- http://127.0.0.1:8000

Health check:
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/health
```

---

## 2) Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend will start at:
- http://localhost:5173

---

## 3) Run Full Application

- Start backend first
- Start frontend second
- Open the frontend URL and interact with controls

---

## Configuration

Frontend reads API base URL from Vite env:

```env
# frontend/.env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If omitted, frontend defaults to http://127.0.0.1:8000.

---

## API Reference

Base URL: `http://127.0.0.1:8000`

### GET /health
Returns service health.

Sample response:
```json
{ "status": "ok" }
```

### GET /graph
Returns graph nodes and edges.

Sample response shape:
```json
{
  "nodes": [
    { "index": 0, "id": "MG Road", "lat": 12.9756, "lng": 77.6069 }
  ],
  "edges": [
    { "from": 0, "to": 1, "distance": 4.2 }
  ]
}
```

### POST /route/bellman-ford
Computes route using Bellman-Ford.

### POST /route/floyd-warshall
Computes route using cached Floyd-Warshall results when traffic signature matches.

### POST /route/compare
Returns execution times for both algorithms and selects a winner.

Shared request body:
```json
{
  "source": 0,
  "destination": 3,
  "traffic_level": 0.35
}
```

Route response shape:
```json
{
  "algorithm": "bellman-ford",
  "path": [0, 2, 3],
  "path_labels": ["MG Road", "Koramangala", "Electronic City"],
  "path_coordinates": [
    { "lat": 12.9756, "lng": 77.6069 },
    { "lat": 12.9352, "lng": 77.6245 },
    { "lat": 12.8399, "lng": 77.677 }
  ],
  "distance": 20.4,
  "execution_time_ms": 0.1284,
  "alternatives": [
    { "path": [0, 7, 2, 3], "distance": 22.1 }
  ],
  "graph_signature": "graph-v1-t0.35"
}
```

Compare response shape:
```json
{
  "source": 0,
  "destination": 3,
  "traffic_level": 0.35,
  "bellman_ford_ms": 0.1284,
  "floyd_warshall_ms": 0.0621,
  "winner": "floyd-warshall"
}
```

---

## Algorithm Notes

### Bellman-Ford
- Suitable for single-source shortest path
- Works with negative edge weights (if no negative cycle)
- In this project, optimized with early stop if no updates occur in an iteration

### Floyd-Warshall
- Computes all-pairs shortest paths in one run
- Higher upfront complexity but valuable when many source-destination queries are requested
- Cached by traffic signature to avoid repeated recomputation

---

## UI/UX and Interaction Design

- Floating glass control panel for primary interactions
- Animated route reveal for better algorithm comprehension
- Route glow and contrast layers for map readability
- Theme-aware map tiles in dark/light mode
- Real-time metrics and comparison chart for educational + analytical insights
- Optional auto-refresh mode for continuously evolving traffic simulation

---

## Performance Considerations

- Debounced input triggers reduce noisy API calls
- Cached Floyd-Warshall matrix improves repeated request performance
- Deterministic traffic factor prevents random cache invalidation
- Frontend state centralized with lightweight store patterns

---

## Troubleshooting

### Backend does not start
- Confirm Python version and dependencies are installed
- Ensure port 8000 is free
- Verify backend command is run inside backend directory

### Frontend cannot reach backend
- Check VITE_API_BASE_URL in frontend/.env
- Ensure backend is running on expected host and port
- Confirm no firewall/proxy is blocking localhost

### Frontend build warnings about chunk size
- This project currently bundles map + chart dependencies into a large chunk during production build.
- The warning is non-blocking; app remains functional.
- To optimize, introduce lazy loading for heavy visualization modules.

---

## Roadmap

- Multi-criteria routing (time, distance, congestion score)
- Real map routing provider integration (Mapbox Directions/OSRM)
- User-defined graph editing from UI
- Persistent scenarios and saved route sessions
- Authentication and role-based access for multi-user environments

---

Built for algorithm visualization, performance comparison, and production-style UX quality.
