import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { donationRoutes } from "./routes/donationRoutes.js";
import { priceRoutes } from "./routes/priceRoutes.js";
import { submissionRoutes } from "./routes/submissionRoutes.js";
import { subscriptionRoutes } from "./routes/subscriptionRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

export const app = express();

// Trust nginx reverse proxy
app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(helmet());
app.use(apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_, res) => {
  res.status(200).json({ ok: true, service: "agriprice-ghana-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);

// In production, serve the built React frontend as static files
if (env.nodeEnv === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicPath = path.join(__dirname, "..", "public");

  // Cache static assets (JS/CSS/images) but never cache index.html
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  }));

  // React Router fallback — serve index.html for all non-API routes
  app.get("*", (_, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(publicPath, "index.html"));
  });
} else {
  app.use(notFoundHandler);
}

app.use(errorHandler);
