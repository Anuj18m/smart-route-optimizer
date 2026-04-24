/**
 * PerformanceDashboard.jsx
 * Right-side floating panel showing algorithm performance metrics.
 * In compare mode it renders a side-by-side bar chart via Recharts.
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

// ── Metric card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, highlight }) {
  return (
    <div
      className={`rounded-xl p-3 border flex flex-col gap-0.5
        ${highlight
          ? 'bg-sky-500/15 border-sky-500/30'
          : 'bg-slate-800/40 border-slate-700/40'}`}
    >
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Custom tooltip for the bar chart ──────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/90 border border-slate-600/50 rounded-lg px-3 py-2 text-xs">
        <p className="font-bold text-sky-300">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill }}>
            {p.name}: {p.value}
            {p.name.includes('ms') ? '' : ' mi'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PerformanceDashboard({ result, compareResult }) {
  const hasCompare = !!compareResult

  // Single-algorithm view
  if (!hasCompare && result) {
    const { algorithm, distance, execution_time_ms, path } = result
    return (
      <AnimatePresence>
        <motion.div
          key="single"
          className="glass-panel p-4 flex flex-col gap-3 w-64"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📊</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Performance
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Distance"
              value={`${distance > 0 ? distance.toLocaleString() : '—'} mi`}
              highlight
            />
            <MetricCard
              label="Time"
              value={`${execution_time_ms} ms`}
              sub="wall-clock"
            />
            <MetricCard
              label="Hops"
              value={path.length > 0 ? path.length - 1 : '—'}
              sub="intermediate stops"
            />
            <MetricCard
              label="Algorithm"
              value={algorithm === 'Bellman-Ford' ? 'BF' : 'FW'}
              sub={algorithm}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Compare view
  if (hasCompare) {
    const bf = compareResult.bellman_ford
    const fw = compareResult.floyd_warshall

    const distData = [
      { name: 'Distance (mi)', 'Bellman-Ford': bf.distance, 'Floyd-Warshall': fw.distance },
    ]
    const timeData = [
      { name: 'Time (ms)', 'Bellman-Ford': bf.execution_time_ms, 'Floyd-Warshall': fw.execution_time_ms },
    ]

    return (
      <AnimatePresence>
        <motion.div
          key="compare"
          className="glass-panel p-4 flex flex-col gap-3 w-72"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 32 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Algorithm Comparison
            </span>
          </div>

          {/* Summary rows */}
          <div className="grid grid-cols-3 gap-1 text-center">
            <div />
            <div className="text-[10px] font-semibold text-sky-400">Bellman-Ford</div>
            <div className="text-[10px] font-semibold text-violet-400">Floyd-Warshall</div>

            <div className="text-[10px] text-slate-400 text-left">Distance</div>
            <div className="text-xs font-bold text-white">{bf.distance} mi</div>
            <div className="text-xs font-bold text-white">{fw.distance} mi</div>

            <div className="text-[10px] text-slate-400 text-left">Time</div>
            <div className="text-xs font-bold text-white">{bf.execution_time_ms} ms</div>
            <div className="text-xs font-bold text-white">{fw.execution_time_ms} ms</div>

            <div className="text-[10px] text-slate-400 text-left">Hops</div>
            <div className="text-xs font-bold text-white">{bf.path.length - 1}</div>
            <div className="text-xs font-bold text-white">{fw.path.length - 1}</div>
          </div>

          {/* Distance chart */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Distance comparison
            </p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={distData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Bellman-Ford" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Floyd-Warshall" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time chart */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Execution time (ms)
            </p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={timeData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Bellman-Ford" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Floyd-Warshall" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}
