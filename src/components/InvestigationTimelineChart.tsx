import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const timelineData = [
  { date: "Jan", events: 4 },
  { date: "Feb", events: 7 },
  { date: "Mar", events: 5 },
  { date: "Apr", events: 11 },
  { date: "May", events: 8 },
  { date: "Jun", events: 15 },
]

function InvestigationTimelineChart() {
  return (
    <div className="w-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
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
            />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 5, fill: "#0ea5e9", stroke: "#0284c7", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#38bdf8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs text-slate-400">
        <span>6-Month Trend</span>
        <span className="font-semibold text-sky-400">+114% velocity increase in Jun</span>
      </div>
    </div>
  )
}

export default InvestigationTimelineChart
