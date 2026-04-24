import { Gauge, MapPinned, Timer } from "lucide-react";
import { motion } from "framer-motion";

const metricClass =
  "glass-card rounded-card flex items-start gap-3 p-4 text-slate-700 dark:text-slate-100";

export default function MetricsPanel({ metrics }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <motion.div whileHover={{ y: -3 }} className={metricClass}>
        <MapPinned className="mt-0.5" size={18} />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Distance</p>
          <p className="text-lg font-bold">{metrics.distance.toFixed(2)} km</p>
        </div>
      </motion.div>

      <motion.div whileHover={{ y: -3 }} className={metricClass}>
        <Timer className="mt-0.5" size={18} />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Execution</p>
          <p className="text-lg font-bold">{metrics.execution_time_ms.toFixed(4)} ms</p>
        </div>
      </motion.div>

      <motion.div whileHover={{ y: -3 }} className={metricClass}>
        <Gauge className="mt-0.5" size={18} />
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Algorithm</p>
          <p className="text-lg font-bold capitalize">{metrics.algorithm.replace("-", " ")}</p>
        </div>
      </motion.div>
    </div>
  );
}
