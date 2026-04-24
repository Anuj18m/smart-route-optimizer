# Route Optimizer Pro

Production-grade Route Optimization System with a premium map-first UI and FastAPI backend.

## Stack

- Frontend: React (Vite), Tailwind CSS, Framer Motion, React Leaflet, Zustand, Recharts
- Backend: FastAPI, optimized Bellman-Ford and Floyd-Warshall

## Features

- Full-screen map-focused layout (80vh) with floating glass control panel
- Bellman-Ford and Floyd-Warshall route computation via REST APIs
- Animated route drawing with highlighted path and optional alternative route
- Live metrics cards: distance, execution time, active algorithm
- Algorithm comparison chart using real execution timings
- Dynamic traffic simulation through weighted edges
- Draggable source/destination map pins (snap to nearest node)
- Real-time route refresh mode (every 5 seconds)
- Dark/Light mode adaptation for both UI and map tiles
- Floyd-Warshall caching for fast repeated queries

## Project Structure

```text
backend/
  main.py
  algorithms/
    shortest_path.py
  services/
    graph_service.py
    sample_graph.json
  requirements.txt

frontend/
  package.json
  index.html
  tailwind.config.js
  src/
    components/
    hooks/
    pages/
    services/
    store/
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API endpoints:

- `GET /graph`
- `POST /route/bellman-ford`
- `POST /route/floyd-warshall`
- `POST /route/compare`

Example payload:

```json
{
  "source": 0,
  "destination": 3,
  "traffic_level": 0.35
}
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Optional environment file:

```bash
# frontend/.env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Run Full System

1. Start backend on `http://127.0.0.1:8000`
2. Start frontend on `http://localhost:5173`
3. Open browser and interact with route controls, traffic slider, and algorithm toggle

## Notes

- Graph data is exposed by `GET /graph` and mirrored in `backend/services/sample_graph.json`
- Floyd-Warshall results are memoized by traffic signature for performance
- Route animation reveals line segments progressively to improve algorithm visualization clarity
