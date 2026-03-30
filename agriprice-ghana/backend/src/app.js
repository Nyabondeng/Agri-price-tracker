import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { donationRoutes } from "./routes/donationRoutes.js";
import { priceRoutes } from "./routes/priceRoutes.js";
import { submissionRoutes } from "./routes/submissionRoutes.js";
import { subscriptionRoutes } from "./routes/subscriptionRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";

export const app = express();

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

app.use(notFoundHandler);
app.use(errorHandler);
