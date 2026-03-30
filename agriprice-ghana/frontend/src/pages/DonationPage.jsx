import { useState } from "react";

import api from "../services/api";

export default function DonationPage() {
  const [form, setForm] = useState({ donorName: "", email: "", amount: "" });
  const [message, setMessage] = useState("");

  async function handleDonate(event) {
    event.preventDefault();
    setMessage("Initializing donation...");

    try {
      const { data } = await api.post("/donations/initialize", {
        donorName: form.donorName || "Anonymous",
        email: form.email,
        amount: Number(form.amount)
      });

      window.location.href = data.authorizationUrl;
    } catch (error) {
      setMessage(error.response?.data?.message || "Donation initialization failed");
    }
  }

  return (
    <section className="mx-auto max-w-xl card space-y-4">
      <h1 className="title-display text-3xl">Support AgriPrice Ghana</h1>
      <p className="text-slate-700">Donations help us keep market data free and available to farmers and traders.</p>
      <form className="space-y-3" onSubmit={handleDonate}>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Donor Name (optional)" value={form.donorName} onChange={(e) => setForm((p) => ({ ...p, donorName: e.target.value }))} />
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Amount (GHS)" type="number" min="1" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
        <button className="w-full rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-900" type="submit">Donate with Paystack</button>
      </form>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
