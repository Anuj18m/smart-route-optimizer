/**
 * RouteInfo.jsx
 * Displays the path nodes and total distance for the current route result.
 * Floats as a small glass pill above the performance dashboard.
 */

import { motion, AnimatePresence } from 'framer-motion'

export default function RouteInfo({ result, nodes }) {
  if (!result || !result.path || result.path.length === 0) return null

  const { path, path_names, distance, algorithm, execution_time_ms } = result

  return (
    <AnimatePresence>
      <motion.div
        key={path.join('-')}
        className="glass-panel p-4 flex flex-col gap-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35 }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
            Route Found
          </span>
          <span className="text-[10px] bg-sky-500/20 text-sky-300 rounded-full px-2 py-0.5 border border-sky-500/30">
            {algorithm}
          </span>
        </div>

        {/* Path */}
        <div className="flex flex-wrap items-center gap-1">
          {path_names.map((name, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border
                ${i === 0
                  ? 'bg-green-500/20 border-green-500/40 text-green-300'
                  : i === path_names.length - 1
                  ? 'bg-red-500/20 border-red-500/40 text-red-300'
                  : 'bg-slate-700/50 border-slate-600/40 text-slate-300'
                }`}>
                {name}
              </span>
              {i < path_names.length - 1 && (
                <span className="text-slate-500 text-xs">→</span>
              )}
            </span>
          ))}
        </div>

        {/* Metrics */}
        <div className="flex gap-4 mt-1">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Distance</p>
            <p className="text-sm font-bold text-white">
              {distance > 0 ? `${distance.toLocaleString()} mi` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Algo Time</p>
            <p className="text-sm font-bold text-white">{execution_time_ms} ms</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hops</p>
            <p className="text-sm font-bold text-white">{path.length - 1}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
