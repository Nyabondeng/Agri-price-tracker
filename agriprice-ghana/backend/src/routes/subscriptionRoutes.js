import { Router } from "express";
import { body } from "express-validator";

import {
  createSubscription,
  deleteSubscription,
  getSubscriptions
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

export const subscriptionRoutes = Router();

subscriptionRoutes.get("/", protect, getSubscriptions);

subscriptionRoutes.post(
  "/",
  protect,
  body("crop").notEmpty(),
  body("region").notEmpty(),
  body("thresholdPercent").optional().isFloat({ min: 1, max: 99 }),
  validateRequest,
  createSubscription
);

subscriptionRoutes.delete("/:id", protect, deleteSubscription);
