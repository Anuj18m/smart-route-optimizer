import { motion } from "framer-motion";

export default function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[500] grid place-items-center bg-slate-900/30 backdrop-blur-[2px]"
    >
      <div className="glass-card rounded-card flex items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-100">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        Computing optimal route...
      </div>
    </motion.div>
  );
}
