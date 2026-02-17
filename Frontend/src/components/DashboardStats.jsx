import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardStats({ bugs }) {
  const open = bugs.filter((b) => b.status === "open").length;
  const assigned = bugs.filter((b) => b.status === "assigned").length;
  const inProgress = bugs.filter((b) => b.status === "in-progress").length;
  const fixed = bugs.filter((b) => b.status === "fixed").length;

  const data = [
    { name: "Open", value: open },
    { name: "Assigned", value: assigned },
    { name: "In Progress", value: inProgress },
    { name: "Fixed", value: fixed },
  ];

  const COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981"];

  return (
    <div className="mb-12 space-y-10">
      
      {/* 🔥 STATUS CARDS */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-red-100 p-4 rounded-xl text-center shadow">
          <p className="text-sm text-slate-500">Open</p>
          <h3 className="text-2xl font-bold text-red-600">{open}</h3>
        </div>

        <div className="bg-blue-100 p-4 rounded-xl text-center shadow">
          <p className="text-sm text-slate-500">Assigned</p>
          <h3 className="text-2xl font-bold text-blue-600">{assigned}</h3>
        </div>

        <div className="bg-yellow-100 p-4 rounded-xl text-center shadow">
          <p className="text-sm text-slate-500">In Progress</p>
          <h3 className="text-2xl font-bold text-yellow-600">{inProgress}</h3>
        </div>

        <div className="bg-green-100 p-4 rounded-xl text-center shadow">
          <p className="text-sm text-slate-500">Fixed</p>
          <h3 className="text-2xl font-bold text-green-600">{fixed}</h3>
        </div>
      </div>

      {/* 🥧 PIE CHART */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-6">
          Bug Status Overview
        </h2>

        <div className="flex justify-center">
          <div className="w-72 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
