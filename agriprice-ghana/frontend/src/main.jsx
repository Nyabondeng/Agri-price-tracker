import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore registration errors in local/dev scenarios.
      });
      return;
    }

    // Avoid stale cached content while developing locally.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if (window.caches) {
      caches.keys().then((keys) => {
        keys
          .filter((key) => key.startsWith("agriprice-cache-"))
          .forEach((key) => caches.delete(key));
      });
    }
  });
}
