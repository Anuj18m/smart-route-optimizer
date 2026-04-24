import { create } from "zustand";
import { fetchComparison, fetchGraph, fetchRoute } from "../services/api";

const defaultMetrics = {
  algorithm: "bellman-ford",
  distance: 0,
  execution_time_ms: 0,
  graph_signature: "",
};

const toChartData = (comparison) => [
  { name: "Bellman-Ford", time: Number(comparison?.bellman_ford_ms || 0) },
  { name: "Floyd-Warshall", time: Number(comparison?.floyd_warshall_ms || 0) },
];

const nearestNodeIndex = (nodes, lat, lng) => {
  if (!nodes.length) return 0;

  let bestIndex = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  nodes.forEach((node) => {
    const dx = node.lat - lat;
    const dy = node.lng - lng;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist) {
      bestDist = d2;
      bestIndex = node.index;
    }
  });

  return bestIndex;
};

export const useRouteStore = create((set, get) => ({
  theme: "light",
  nodes: [],
  edges: [],
  source: 0,
  destination: 3,
  algorithm: "bellman-ford",
  trafficLevel: 0.25,
  autoRefresh: false,
  loading: false,
  route: null,
  alternatives: [],
  metrics: defaultMetrics,
  comparison: null,
  chartData: toChartData(null),
  error: "",

  initialize: async () => {
    try {
      const graph = await fetchGraph();
      set({
        nodes: graph.nodes,
        edges: graph.edges,
        source: graph.nodes[0]?.index ?? 0,
        destination: graph.nodes[3]?.index ?? graph.nodes[0]?.index ?? 0,
      });
    } catch (error) {
      set({ error: "Failed to load graph data." });
    }
  },

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  setSource: (source) => set({ source }),
  setDestination: (destination) => set({ destination }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  setTrafficLevel: (trafficLevel) => set({ trafficLevel }),
  setAutoRefresh: (autoRefresh) => set({ autoRefresh }),

  dragSourceToNearest: (lat, lng) => {
    const index = nearestNodeIndex(get().nodes, lat, lng);
    set({ source: index });
  },

  dragDestinationToNearest: (lat, lng) => {
    const index = nearestNodeIndex(get().nodes, lat, lng);
    set({ destination: index });
  },

  computeRoute: async () => {
    const { source, destination, algorithm, trafficLevel } = get();
    set({ loading: true, error: "" });

    try {
      const payload = { source, destination, traffic_level: trafficLevel };
      const [route, comparison] = await Promise.all([
        fetchRoute(algorithm, payload),
        fetchComparison(payload),
      ]);

      set({
        route,
        alternatives: route.alternatives || [],
        metrics: {
          algorithm: route.algorithm,
          distance: route.distance,
          execution_time_ms: route.execution_time_ms,
          graph_signature: route.graph_signature,
        },
        comparison,
        chartData: toChartData(comparison),
      });
    } catch (error) {
      const detail = error?.response?.data?.detail;
      set({ error: detail || "Route calculation failed." });
    } finally {
      set({ loading: false });
    }
  },
}));
