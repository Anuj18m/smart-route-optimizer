/**
 * ControlPanel.jsx
 * Floating glassmorphism control panel on the left side.
 * Allows selecting source/destination, algorithm, and triggering route-find.
 */

import { motion } from 'framer-motion'

const ALGORITHMS = [
  { value: 'bellman-ford',    label: 'Bellman-Ford' },
  { value: 'floyd-warshall',  label: 'Floyd-Warshall' },
  { value: 'compare',         label: 'Compare Both' },
]

export default function ControlPanel({
  nodes,
  source, setSource,
  destination, setDestination,
  algorithm, setAlgorithm,
  onFindRoute,
  loading,
  darkMode, toggleDarkMode,
}) {
  return (
    <motion.div
      className="glass-panel w-64 p-5 flex flex-col gap-4"
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-sky-400 tracking-wide">
            🗺 Route Optimizer
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Bellman-Ford &amp; Floyd-Warshall
          </p>
        </div>

        {/* Dark / Light toggle */}
        <button
          onClick={toggleDarkMode}
          title="Toggle dark/light mode"
          className="p-1.5 rounded-lg border border-slate-600 text-slate-300 hover:border-sky-400
                     hover:text-sky-400 transition-colors text-sm"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <hr className="border-slate-600/50" />

      {/* Source */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Start City
        </label>
        <select
          className="glass-input"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          End City
        </label>
        <select
          className="glass-input"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        >
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </div>

      {/* Algorithm selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Algorithm
        </label>
        <div className="flex flex-col gap-1.5">
          {ALGORITHMS.map((alg) => (
            <button
              key={alg.value}
              onClick={() => setAlgorithm(alg.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium border transition-all
                ${algorithm === alg.value
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'border-slate-600/50 text-slate-400 hover:border-slate-400 hover:text-slate-200'
                }`}
            >
              {alg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Find Route button */}
      <button
        className="btn-primary flex items-center justify-center gap-2 mt-1"
        onClick={onFindRoute}
        disabled={loading || !source || !destination || source === destination}
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30
                             border-t-white rounded-full" />
            Computing…
          </>
        ) : (
          '⚡ Find Route'
        )}
      </button>
    </motion.div>
  )
}
