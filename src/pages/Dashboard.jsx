import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", value: 12 },
  { name: "Tue", value: 10 },
  { name: "Wed", value: 15 },
  { name: "Thu", value: 18 },
  { name: "Fri", value: 16 },
  { name: "Sat", value: 30 },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Cards */}
        <div className="bg-white shadow rounded p-4">
          <p>Used Space</p>
          <h2 className="text-xl font-semibold">49/50 GB</h2>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p>Revenue</p>
          <h2 className="text-xl font-semibold">$34,245</h2>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p>Fixed Issues</p>
          <h2 className="text-xl font-semibold">75</h2>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded p-4 mt-6">
        <p className="mb-2">Daily Sales</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4ade80" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
