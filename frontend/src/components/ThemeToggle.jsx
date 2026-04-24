import { MoonStar, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={onToggle}
      className="glass-card rounded-card border px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-brand-700 dark:text-slate-200 dark:hover:text-sky-300"
    >
      <span className="flex items-center gap-2">
        {theme === "light" ? <MoonStar size={16} /> : <Sun size={16} />}
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </span>
    </motion.button>
  );
}
