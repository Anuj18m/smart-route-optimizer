/**
 * Map.jsx
 * Full-viewport Leaflet map displaying city nodes and the calculated route.
 * Uses react-leaflet v4 with a dark tile layer by default.
 */

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// ── Custom city marker icon ──────────────────────────────────────────────
const cityIcon = (isOnRoute = false) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 14px; height: 14px;
        border-radius: 50%;
        background: ${isOnRoute ? '#22d3ee' : '#64748b'};
        border: 2.5px solid ${isOnRoute ? '#0ea5e9' : '#475569'};
        box-shadow: 0 0 ${isOnRoute ? '10px #22d3ee' : '4px #334155'};
        transition: all 0.3s;
      "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })

const sourceIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #4ade80;
        border: 3px solid #16a34a;
        box-shadow: 0 0 14px #4ade80;
      "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  })

const destIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #f87171;
        border: 3px solid #dc2626;
        box-shadow: 0 0 14px #f87171;
      "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  })

// ── Helper: auto-fit map bounds to route ────────────────────────────────
function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions && positions.length > 1) {
      map.fitBounds(positions, { padding: [60, 60], maxZoom: 7 })
    }
  }, [positions, map])
  return null
}

// ── Map component ────────────────────────────────────────────────────────
export default function Map({ nodes, result, darkMode }) {
  const routePath = result?.path ?? []
  const nodeMap   = Object.fromEntries(nodes.map((n) => [n.id, n]))

  // Convert path node ids to [lat, lng] pairs for the polyline
  const routePositions = routePath
    .map((id) => nodeMap[id])
    .filter(Boolean)
    .map((n) => [n.lat, n.lng])

  const routeSet = new Set(routePath)

  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <MapContainer
      center={[37.5, -96]}
      zoom={4}
      zoomControl={true}
      style={{ width: '100%', height: '100vh' }}
      attributionControl={true}
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      {/* City markers */}
      {nodes.map((node) => {
        const isSource = result?.source === node.id
        const isDest   = result?.destination === node.id
        const onRoute  = routeSet.has(node.id)

        const icon = isSource
          ? sourceIcon()
          : isDest
          ? destIcon()
          : cityIcon(onRoute)

        return (
          <Marker key={node.id} position={[node.lat, node.lng]} icon={icon}>
            <Popup>
              <div className="text-sm font-semibold">{node.name}</div>
              <div className="text-xs text-gray-500">
                {node.lat.toFixed(4)}, {node.lng.toFixed(4)}
              </div>
              {isSource && <div className="text-xs text-green-600 font-bold mt-1">▶ Start</div>}
              {isDest   && <div className="text-xs text-red-600 font-bold mt-1">⚑ End</div>}
            </Popup>
          </Marker>
        )
      })}

      {/* Animated route polyline */}
      {routePositions.length > 1 && (
        <>
          {/* Glow / background stroke */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#0ea5e9',
              weight: 6,
              opacity: 0.25,
            }}
          />
          {/* Animated dashed stroke */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#22d3ee',
              weight: 3,
              opacity: 0.95,
              dashArray: '14 8',
              className: 'animated-route-path',
            }}
          />
        </>
      )}

      {/* Auto-fit bounds when a route is available */}
      {routePositions.length > 1 && <FitBounds positions={routePositions} />}
    </MapContainer>
  )
}
