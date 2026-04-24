/**
 * useRouteOptimizer.js
 * Custom React hook that encapsulates all API interactions for route finding,
 * node fetching and traffic simulation.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchNodes,
  runBellmanFord,
  runFloydWarshall,
  runCompare,
  updateTraffic,
  fetchTraffic,
} from '../utils/api'

export function useRouteOptimizer() {
  // ── State ──────────────────────────────────────────────────────────────
  const [nodes, setNodes]               = useState([])          // city list
  const [source, setSource]             = useState('')
  const [destination, setDestination]   = useState('')
  const [algorithm, setAlgorithm]       = useState('bellman-ford') // 'bellman-ford' | 'floyd-warshall' | 'compare'
  const [result, setResult]             = useState(null)         // last route result
  const [compareResult, setCompareResult] = useState(null)       // compare mode result
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [traffic, setTraffic]           = useState(null)
  const [trafficLoading, setTrafficLoading] = useState(false)

  // ── Load nodes on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchNodes()
      .then((data) => {
        setNodes(data)
        if (data.length >= 2) {
          setSource(data[0].id)
          setDestination(data[1].id)
        }
      })
      .catch((err) => setError(err.message))
  }, [])

  // ── Find route ─────────────────────────────────────────────────────────
  const findRoute = useCallback(async () => {
    if (!source || !destination) return
    if (source === destination) {
      setError('Source and destination must be different cities.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setCompareResult(null)

    try {
      if (algorithm === 'bellman-ford') {
        const data = await runBellmanFord(source, destination)
        setResult(data)
      } else if (algorithm === 'floyd-warshall') {
        const data = await runFloydWarshall(source, destination)
        setResult(data)
      } else {
        // 'compare'
        const data = await runCompare(source, destination)
        setCompareResult(data)
        // Show the BF route on map by default in compare mode
        setResult(data.bellman_ford)
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [source, destination, algorithm])

  // ── Randomise traffic ──────────────────────────────────────────────────
  const randomiseTraffic = useCallback(async () => {
    setTrafficLoading(true)
    try {
      const data = await updateTraffic()
      setTraffic(data)
      // Clear cached route so user re-runs with new weights
      setResult(null)
      setCompareResult(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setTrafficLoading(false)
    }
  }, [])

  // ── Fetch current traffic ──────────────────────────────────────────────
  const refreshTraffic = useCallback(async () => {
    try {
      const data = await fetchTraffic()
      setTraffic(data)
    } catch {
      // non-critical, ignore
    }
  }, [])

  useEffect(() => { refreshTraffic() }, [refreshTraffic])

  return {
    nodes,
    source, setSource,
    destination, setDestination,
    algorithm, setAlgorithm,
    result,
    compareResult,
    loading,
    error,
    traffic,
    trafficLoading,
    findRoute,
    randomiseTraffic,
  }
}
