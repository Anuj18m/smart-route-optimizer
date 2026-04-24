/**
 * App.jsx
 * Root application component.
 * Composes the full-viewport map with floating glassmorphism overlay panels.
 * Layout:
 *   - Map fills the entire viewport (z-index 0)
 *   - ControlPanel  – left, top
 *   - Right column  – TrafficPanel + PerformanceDashboard (right, top)
 *   - RouteInfo     – bottom-centre (or bottom-right of left panel)
 *   - Error toast   – bottom-centre
 */

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Map                  from './components/Map'
import ControlPanel         from './components/ControlPanel'
import PerformanceDashboard from './components/PerformanceDashboard'
import TrafficPanel         from './components/TrafficPanel'
import RouteInfo            from './components/RouteInfo'
import { useRouteOptimizer } from './hooks/useRouteOptimizer'

export default function App() {
  // ── Dark mode ────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [darkMode])

  // ── Route optimizer hook ─────────────────────────────────────────────
  const {
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
  } = useRouteOptimizer()

  return (
    // Full-viewport container – map lives here
    <div className="relative w-full h-screen overflow-hidden">

      {/* ── Map layer ── */}
      <Map nodes={nodes} result={result} darkMode={darkMode} />

      {/* ── Left: Control panel ── */}
      <div className="absolute left-4 top-4 z-[1000] flex flex-col gap-3">
        <ControlPanel
          nodes={nodes}
          source={source}           setSource={setSource}
          destination={destination} setDestination={setDestination}
          algorithm={algorithm}     setAlgorithm={setAlgorithm}
          onFindRoute={findRoute}
          loading={loading}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((d) => !d)}
        />

        {/* Route info directly below control panel */}
        <RouteInfo result={result} nodes={nodes} />
      </div>

      {/* ── Right: Traffic + Performance panels ── */}
      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-3 max-w-[290px]">
        <TrafficPanel
          traffic={traffic}
          onRandomise={randomiseTraffic}
          loading={trafficLoading}
        />

        <PerformanceDashboard
          result={result}
          compareResult={compareResult}
        />
      </div>

      {/* ── Error toast ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2000]
                       glass-panel px-5 py-3 text-sm text-red-300 flex items-center gap-2
                       max-w-[380px] text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3 }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
