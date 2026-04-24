import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ComparisonChart from "../components/ComparisonChart";
import ControlPanel from "../components/ControlPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import MapView from "../components/MapView";
import MetricsPanel from "../components/MetricsPanel";
import ThemeToggle from "../components/ThemeToggle";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { useRouteStore } from "../store/useRouteStore";

export default function DashboardPage() {
  const {
    theme,
    nodes,
    source,
    destination,
    algorithm,
    trafficLevel,
    autoRefresh,
    route,
    alternatives,
    metrics,
    comparison,
    chartData,
    loading,
    error,
    initialize,
    toggleTheme,
    setSource,
    setDestination,
    setAlgorithm,
    setTrafficLevel,
    setAutoRefresh,
    computeRoute,
    dragSourceToNearest,
    dragDestinationToNearest,
  } = useRouteStore();

  const debouncedSource = useDebouncedValue(source, 250);
  const debouncedDestination = useDebouncedValue(destination, 250);
  const debouncedTraffic = useDebouncedValue(trafficLevel, 350);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!nodes.length) return;
    computeRoute();
  }, [nodes.length, debouncedSource, debouncedDestination, debouncedTraffic, algorithm]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      computeRoute();
    }, 5000);

    return () => clearInterval(timer);
  }, [autoRefresh, computeRoute]);

  return (
    <div className="min-h-screen px-3 py-3 md:px-6 md:py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-poppins text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Route Optimizer Pro
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bellman-Ford and Floyd-Warshall with live traffic simulation and visual route intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="glass-card rounded-card px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Drag pins to update source and destination
          </div>
        </div>
      </header>

      <section className="relative map-wrapper h-[80vh]">
        <MapView
          nodes={nodes}
          route={route}
          alternatives={alternatives}
          theme={theme}
          source={source}
          destination={destination}
          onDragSource={dragSourceToNearest}
          onDragDestination={dragDestinationToNearest}
        />

        <ControlPanel
          nodes={nodes}
          source={source}
          destination={destination}
          algorithm={algorithm}
          trafficLevel={trafficLevel}
          autoRefresh={autoRefresh}
          onSource={setSource}
          onDestination={setDestination}
          onAlgorithm={setAlgorithm}
          onTraffic={setTrafficLevel}
          onAutoRefresh={setAutoRefresh}
          onCompute={computeRoute}
        />

        <AnimatePresence>
          <LoadingOverlay show={loading} />
        </AnimatePresence>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <MetricsPanel metrics={metrics} />
          <div className="glass-card rounded-card mt-4 p-4 text-sm text-slate-700 dark:text-slate-100">
            <p className="font-semibold">Current Route</p>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {route?.path_labels?.length ? route.path_labels.join(" -> ") : "Route not computed yet."}
            </p>
            {alternatives.length > 0 && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Alternative suggestion: {alternatives[0].path.join(" -> ")} ({alternatives[0].distance} km)
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-card border border-rose-300/60 bg-rose-100/70 p-3 text-sm text-rose-700 dark:border-rose-600/50 dark:bg-rose-900/30 dark:text-rose-200">
              {error}
            </div>
          )}
        </div>

        <ComparisonChart data={chartData} winner={comparison?.winner} />
      </motion.section>
    </div>
  );
}
