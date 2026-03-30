import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navBase = "rounded-xl px-3 py-2 text-sm font-medium transition";

export default function Layout({ children }) {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <div className="page-shell">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="card fade-in flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="title-display text-2xl font-bold text-slate-900">
            AgriPrice Ghana
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-slate-700">
            <NavLink to="/" className={({ isActive }) => `${navBase} ${isActive ? "bg-slate-900 text-white" : "bg-white"}`}>
              Dashboard
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/submit"
                className={({ isActive }) => `${navBase} ${isActive ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                Submit Price
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/alerts"
                className={({ isActive }) => `${navBase} ${isActive ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                Alerts
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `${navBase} ${isActive ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                Admin
              </NavLink>
            )}
            <NavLink to="/donate" className={({ isActive }) => `${navBase} ${isActive ? "bg-slate-900 text-white" : "bg-white"}`}>
              Donate
            </NavLink>
            {!isAuthenticated ? (
              <NavLink to="/auth" className={({ isActive }) => `${navBase} ${isActive ? "bg-slate-900 text-white" : "bg-white"}`}>
                Login
              </NavLink>
            ) : (
              <button type="button" onClick={logout} className={`${navBase} bg-rose-100 text-rose-800`}>
                Logout
              </button>
            )}
          </nav>
        </header>
        <main className="fade-in">{children}</main>
      </div>
    </div>
  );
}
