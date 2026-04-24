import { motion } from "framer-motion";
import { Navigation, Route, Waves } from "lucide-react";

export default function ControlPanel({
  nodes,
  source,
  destination,
  algorithm,
  trafficLevel,
  autoRefresh,
  onSource,
  onDestination,
  onAlgorithm,
  onTraffic,
  onAutoRefresh,
  onCompute,
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card floating-scroll absolute left-4 top-4 z-[450] w-[320px] rounded-card p-4"
    >
      <h2 className="mb-3 flex items-center gap-2 font-poppins text-lg font-semibold text-slate-900 dark:text-slate-100">
        <Route size={18} />
        Route Control
      </h2>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Source
      </label>
      <select
        value={source}
        onChange={(e) => onSource(Number(e.target.value))}
        className="mb-3 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
      >
        {nodes.map((node) => (
          <option key={node.index} value={node.index}>
            {node.id}
          </option>
        ))}
      </select>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Destination
      </label>
      <select
        value={destination}
        onChange={(e) => onDestination(Number(e.target.value))}
        className="mb-3 w-full rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100"
      >
        {nodes.map((node) => (
          <option key={node.index} value={node.index}>
            {node.id}
          </option>
        ))}
      </select>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Algorithm
      </label>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {[
          { value: "bellman-ford", label: "Bellman-Ford" },
          { value: "floyd-warshall", label: "Floyd-Warshall" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => onAlgorithm(item.value)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              algorithm === item.value
                ? "bg-brand-500 text-white"
                : "bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 dark:bg-slate-700/60 dark:text-slate-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><Waves size={13} />Traffic Simulation</span>
          <span>{Math.round(trafficLevel * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={trafficLevel}
          onChange={(e) => onTraffic(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
      </div>

      <label className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => onAutoRefresh(e.target.checked)}
          className="h-4 w-4 accent-brand-500"
        />
        Live updates every 5 seconds
      </label>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={onCompute}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
      >
        <Navigation size={16} />
        Find Route
      </motion.button>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        Tip: drag source/destination map pins to nearest intersections.
      </p>
    </motion.div>
  );
}
