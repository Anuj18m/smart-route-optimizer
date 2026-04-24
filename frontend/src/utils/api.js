/**
 * api.js – Axios-based API utilities for the Route Optimizer backend.
 * All requests go to http://localhost:8000
 */

import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Graph ──────────────────────────────────────────────────────────────────

/** Fetch all city nodes: [{ id, name, lat, lng }] */
export async function fetchNodes() {
  const { data } = await client.get('/graph/nodes')
  return data.nodes
}

// ── Routing ────────────────────────────────────────────────────────────────

/**
 * Run Bellman-Ford shortest path.
 * @param {string} source       city id
 * @param {string} destination  city id
 */
export async function runBellmanFord(source, destination) {
  const { data } = await client.post('/route/bellman-ford', { source, destination })
  return data
}

/**
 * Run Floyd-Warshall shortest path.
 */
export async function runFloydWarshall(source, destination) {
  const { data } = await client.post('/route/floyd-warshall', { source, destination })
  return data
}

/**
 * Compare both algorithms for the same source/destination.
 * Returns { source, destination, bellman_ford, floyd_warshall }
 */
export async function runCompare(source, destination) {
  const { data } = await client.post('/route/compare', { source, destination })
  return data
}

// ── Traffic ────────────────────────────────────────────────────────────────

/** Randomise traffic weights on the backend. Returns new multipliers. */
export async function updateTraffic() {
  const { data } = await client.post('/traffic/update')
  return data
}

/** Get current traffic state. */
export async function fetchTraffic() {
  const { data } = await client.get('/traffic/current')
  return data
}

// ── Health ─────────────────────────────────────────────────────────────────

export async function healthCheck() {
  const { data } = await client.get('/')
  return data
}
