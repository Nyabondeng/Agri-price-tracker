import { useEffect, useState } from "react";

import api from "../services/api";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  async function loadData() {
    const [submissionRes, userRes] = await Promise.all([api.get("/submissions"), api.get("/users")]);
    setSubmissions(submissionRes.data.items || []);
    setUsers(userRes.data.items || []);
  }

  useEffect(() => {
    loadData().catch((error) => setMessage(error.response?.data?.message || "Failed to load admin data"));
  }, []);

  async function review(id, decision) {
    await api.patch(`/submissions/${id}/review`, { decision });
    await loadData();
  }

  async function updateRole(id, role) {
    await api.patch(`/users/${id}/role`, { role });
    await loadData();
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <h1 className="title-display text-3xl">Admin Panel</h1>
        <p className="text-slate-700">Approve market submissions, manage users, and control publication quality.</p>
        {message && <p className="text-sm text-rose-700">{message}</p>}
      </section>

      <section className="card space-y-3">
        <h2 className="title-display text-2xl">Pending Submissions</h2>
        {!submissions.length && <p>No pending submissions.</p>}
        {submissions.map((item) => (
          <div key={item._id} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="font-semibold">{item.crop} - GHS {item.price}</p>
            <p className="text-sm text-slate-600">{item.region} | {item.market} | {item.unit}</p>
            <div className="mt-2 flex gap-2">
              <button className="rounded bg-emerald-700 px-3 py-1 text-white" onClick={() => review(item._id, "approved")}>Approve</button>
              <button className="rounded bg-rose-700 px-3 py-1 text-white" onClick={() => review(item._id, "rejected")}>Reject</button>
            </div>
          </div>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="title-display text-2xl">User Management</h2>
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            <select className="rounded-xl border border-slate-200 px-3 py-2" value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </section>
    </div>
  );
}
