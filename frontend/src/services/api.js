import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 12000,
});

export async function fetchGraph() {
  const { data } = await api.get("/graph");
  return data;
}

export async function fetchRoute(algorithm, payload) {
  const endpoint = algorithm === "floyd-warshall" ? "/route/floyd-warshall" : "/route/bellman-ford";
  const { data } = await api.post(endpoint, payload);
  return data;
}

export async function fetchComparison(payload) {
  const { data } = await api.post("/route/compare", payload);
  return data;
}
