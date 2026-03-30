import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="card space-y-3 text-center">
      <h1 className="title-display text-4xl">404</h1>
      <p className="text-slate-700">This page does not exist.</p>
      <Link to="/" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">
        Back to Dashboard
      </Link>
    </section>
  );
}
