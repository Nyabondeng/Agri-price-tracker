import { useEffect, useState } from "react";

import api from "../services/api";

const defaults = { crop: "Maize", region: "Accra", thresholdPercent: 10 };

export default function AlertsPage() {
  const [form, setForm] = useState(defaults);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/subscriptions");
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.response?.data?.message || "Failed to load alerts"));
  }, []);

  async function create(event) {
    event.preventDefault();
    await api.post("/subscriptions", { ...form, thresholdPercent: Number(form.thresholdPercent) });
    setMessage("Subscription saved");
    setForm(defaults);
    await load();
  }

  async function remove(id) {
    await api.delete(`/subscriptions/${id}`);
    await load();
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <h1 className="title-display text-3xl">Price Alerts</h1>
        <p className="text-slate-700">Subscribe to get notified when crop prices shift sharply in your region.</p>
        <form onSubmit={create} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <input className="rounded-xl border border-slate-200 px-3 py-2" value={form.crop} onChange={(e) => setForm((p) => ({ ...p, crop: e.target.value }))} placeholder="Crop" required />
          <input className="rounded-xl border border-slate-200 px-3 py-2" value={form.region} onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))} placeholder="Region" required />
          <input className="rounded-xl border border-slate-200 px-3 py-2" value={form.thresholdPercent} type="number" min="1" max="99" onChange={(e) => setForm((p) => ({ ...p, thresholdPercent: e.target.value }))} placeholder="Threshold %" required />
          <button className="col-span-2 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white md:col-span-1" type="submit">Add Alert</button>
        </form>
        {message && <p className="text-sm text-slate-700">{message}</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="title-display text-2xl">My Subscriptions</h2>
        {!items.length && <p>No active alerts yet.</p>}
        {items.map((item) => (
          <div key={item._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <p>{item.crop} in {item.region} ({item.thresholdPercent}% threshold)</p>
            <button className="rounded bg-rose-700 px-3 py-1 text-white" onClick={() => remove(item._id)}>Remove</button>
          </div>
        ))}
      </section>
    </div>
  );
}
