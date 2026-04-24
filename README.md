# smart-route-optimizer
A Google Maps-like Route Optimization System using Bellman-Ford and Floyd-Warshall algorithms with interactive UI, real-time visualization, and performance comparison.

## Features

- 🗺 **Interactive Leaflet.js map** – city markers, animated route polyline, auto-fit bounds
- ⚡ **Two algorithms** – Bellman-Ford and Floyd-Warshall with side-by-side comparison
- 🚦 **Traffic simulation** – randomise edge weights ±30% in one click
- 📊 **Performance dashboard** – distance, execution time, hop count, Recharts bar charts
- 🎨 **Glassmorphism UI** – dark/light mode toggle, Framer Motion animations
- 🔄 **Floyd-Warshall caching** – results cached and invalidated on traffic update

## Project Structure

```
smart-route-optimizer/
├── backend/
│   ├── main.py          # FastAPI app (7 endpoints)
│   ├── algorithms.py    # Bellman-Ford + Floyd-Warshall implementations
│   ├── graph_data.py    # 15 US cities with lat/lng + road edges
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── Map.jsx
    │   │   ├── ControlPanel.jsx
    │   │   ├── PerformanceDashboard.jsx
    │   │   ├── TrafficPanel.jsx
    │   │   └── RouteInfo.jsx
    │   ├── hooks/useRouteOptimizer.js
    │   └── utils/api.js
    ├── package.json
    └── vite.config.js
```

## Setup & Running

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:3000`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| GET | `/graph/nodes` | List all city nodes |
| POST | `/route/bellman-ford` | Shortest path via Bellman-Ford |
| POST | `/route/floyd-warshall` | Shortest path via Floyd-Warshall (cached) |
| POST | `/route/compare` | Compare both algorithms |
| POST | `/traffic/update` | Randomise traffic weights |
| GET | `/traffic/current` | Current traffic state |

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, react-leaflet, Recharts, Axios  
**Backend:** Python FastAPI, Pydantic v2, Uvicorn
