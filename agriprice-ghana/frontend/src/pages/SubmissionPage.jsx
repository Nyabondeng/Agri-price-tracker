import { useState } from "react";

import api from "../services/api";

const initialForm = {
  crop: "Maize",
  region: "Accra",
  market: "",
  unit: "kg",
  price: ""
};

export default function SubmissionPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Submitting...");

    try {
      await api.post("/submissions", { ...form, price: Number(form.price) });
      setStatus("Submitted successfully. Waiting for admin approval.");
      setForm(initialForm);
    } catch (error) {
      setStatus(error.response?.data?.message || "Submission failed");
    }
  }

  return (
    <section className="mx-auto max-w-2xl card space-y-4">
      <h1 className="title-display text-3xl">Submit a Market Price</h1>
      <p className="text-slate-700">Registered users can submit prices from their local market for admin verification.</p>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="space-y-1 text-sm font-medium text-slate-700">
            {key[0].toUpperCase() + key.slice(1)}
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              value={value}
              onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              required
            />
          </label>
        ))}
        <button className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white md:col-span-2" type="submit">
          Submit for Approval
        </button>
      </form>
      {status && <p className="text-sm font-medium text-slate-700">{status}</p>}
    </section>
  );
}
