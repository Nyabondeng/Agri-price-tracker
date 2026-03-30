import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export default function PriceTrendChart({ history }) {
  const normalized = history.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString(),
    price: item.price,
    crop: item.crop,
    region: item.region
  }));

  return (
    <div className="card h-[350px]">
      <h2 className="title-display mb-3 text-2xl">Price Trend</h2>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={normalized} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#4f8a3f" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
