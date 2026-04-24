/**
 * TrafficPanel.jsx
 * Small floating panel for traffic simulation controls.
 * Shows current traffic description and a button to randomise weights.
 */

import { motion } from 'framer-motion'

export default function TrafficPanel({ traffic, onRandomise, loading }) {
  // Compute a rough "congestion level" label from average multiplier
  const avg = traffic?.multipliers
    ? Object.values(traffic.multipliers).reduce((a, b) => a + b, 0) /
      Math.max(Object.values(traffic.multipliers).length, 1)
    : 1

  const congestionLabel =
    avg < 0.85 ? { text: 'Low',    color: 'text-green-400' }
    : avg < 1.1 ? { text: 'Normal', color: 'text-yellow-400' }
    :             { text: 'Heavy',  color: 'text-red-400' }

  return (
    <motion.div
      className="glass-panel p-4 flex flex-col gap-3"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-base">🚦</span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Traffic Simulation
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">Congestion</span>
        <span className={`text-xs font-bold ${congestionLabel.color}`}>
          {congestionLabel.text}
        </span>
      </div>

      {traffic?.multipliers && Object.keys(traffic.multipliers).length > 0 ? (
        <div className="text-[10px] text-slate-500 leading-relaxed">
          Avg weight ×{avg.toFixed(3)} &nbsp;|&nbsp;
          {Object.keys(traffic.multipliers).length} edges adjusted
        </div>
      ) : (
        <div className="text-[10px] text-slate-500">
          No traffic active – using base distances
        </div>
      )}

      {/* Randomise button */}
      <button
        className="btn-secondary text-xs flex items-center justify-center gap-1.5"
        onClick={onRandomise}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-3 h-3 border-2
                             border-slate-400/30 border-t-slate-300 rounded-full" />
            Updating…
          </>
        ) : (
          '🔀 Randomise Traffic'
        )}
      </button>
    </motion.div>
  )
}
