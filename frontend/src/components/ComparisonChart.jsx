import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ComparisonChart({ data, winner }) {
  return (
    <div className="glass-card rounded-card h-[230px] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Algorithm Performance</h3>
        <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-sky-300">
          Winner: {winner || "-"}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
            formatter={(value) => [`${value} ms`, "Execution"]}
          />
          <Bar dataKey="time" fill="#0a88f7" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
