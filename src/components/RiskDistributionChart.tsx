import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const riskData = [
  { category: "Low", count: 18, color: "#14b8a6" },
  { category: "Medium", count: 27, color: "#38bdf8" },
  { category: "High", count: 14, color: "#fbbf24" },
  { category: "Critical", count: 6, color: "#f43f5e" },
]

function RiskDistributionChart() {
  return (
    <div className="w-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="category"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f8fafc",
                fontSize: "12px",
              }}
              cursor={{ fill: "rgba(51, 65, 85, 0.2)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-around border-t border-slate-800/80 pt-3 text-xs">
        {riskData.map((item) => (
          <div key={item.category} className="text-center">
            <span className="text-slate-500 block">{item.category}</span>
            <span className="font-bold text-slate-200">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RiskDistributionChart
