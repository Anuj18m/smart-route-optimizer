import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";

const sourceIcon = L.divIcon({
  className: "",
  html: '<div style="height:18px;width:18px;border-radius:999px;background:#22c55e;border:3px solid #ffffff;box-shadow:0 8px 16px rgba(16,185,129,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destinationIcon = L.divIcon({
  className: "",
  html: '<div style="height:18px;width:18px;border-radius:999px;background:#f97316;border:3px solid #ffffff;box-shadow:0 8px 16px rgba(249,115,22,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function MapView({
  nodes,
  route,
  alternatives,
  theme,
  source,
  destination,
  onDragSource,
  onDragDestination,
}) {
  const [revealCount, setRevealCount] = useState(0);

  const center = useMemo(() => {
    if (!nodes.length) return [12.9716, 77.5946];
    const meanLat = nodes.reduce((sum, n) => sum + n.lat, 0) / nodes.length;
    const meanLng = nodes.reduce((sum, n) => sum + n.lng, 0) / nodes.length;
    return [meanLat, meanLng];
  }, [nodes]);

  const sourceNode = nodes.find((n) => n.index === source);
  const destinationNode = nodes.find((n) => n.index === destination);

  const routePoints = route?.path_coordinates?.map((p) => [p.lat, p.lng]) || [];
  const revealedRoutePoints = routePoints.slice(0, Math.max(2, revealCount));

  const alternativesPoints = alternatives
    .map((alt) => alt.path.map((idx) => nodes.find((n) => n.index === idx)).filter(Boolean))
    .map((path) => path.map((node) => [node.lat, node.lng]));

  useEffect(() => {
    setRevealCount(2);
    if (routePoints.length <= 2) return;

    const timer = setInterval(() => {
      setRevealCount((current) => {
        if (current >= routePoints.length) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [route?.graph_signature, routePoints.length]);

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
      <TileLayer
        url={
          theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        }
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {nodes.map((node) => (
        <Marker key={node.index} position={[node.lat, node.lng]} opacity={0.6}>
          <Tooltip direction="top" offset={[0, -6]}>
            {node.id}
          </Tooltip>
        </Marker>
      ))}

      {sourceNode && (
        <Marker
          position={[sourceNode.lat, sourceNode.lng]}
          icon={sourceIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng();
              onDragSource(lat, lng);
            },
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]}>
            Source
          </Tooltip>
        </Marker>
      )}

      {destinationNode && (
        <Marker
          position={[destinationNode.lat, destinationNode.lng]}
          icon={destinationIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng();
              onDragDestination(lat, lng);
            },
          }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]}>
            Destination
          </Tooltip>
        </Marker>
      )}

      {alternativesPoints.map((path, idx) => (
        <Polyline
          key={`alt-${idx}`}
          positions={path}
          pathOptions={{ color: theme === "dark" ? "#c084fc" : "#a855f7", dashArray: "8 8", weight: 4, opacity: 0.5 }}
        />
      ))}

      {revealedRoutePoints.length >= 2 && (
        <>
          <Polyline
            positions={revealedRoutePoints}
            className={theme === "dark" ? "route-polyline-dark" : "route-polyline"}
            pathOptions={{ color: theme === "dark" ? "#38bdf8" : "#0a88f7", weight: 8, opacity: 0.25 }}
          />
          <Polyline
            positions={revealedRoutePoints}
            pathOptions={{ color: theme === "dark" ? "#7dd3fc" : "#0284c7", weight: 5, opacity: 0.96 }}
          />
        </>
      )}
    </MapContainer>
  );
}
