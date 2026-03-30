import { Router } from "express";
import { body, query } from "express-validator";

import {
  compareRegions,
  getLatestPrices,
  getPriceHistory,
  getPricePrediction
} from "../controllers/priceController.js";
import { deletePriceEntry, updatePriceEntry } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

export const priceRoutes = Router();

priceRoutes.get(
  "/",
  query("limit").optional().isInt({ min: 1, max: 500 }),
  validateRequest,
  getLatestPrices
);
priceRoutes.get("/history", getPriceHistory);
priceRoutes.get("/compare", compareRegions);
priceRoutes.get("/predict", getPricePrediction);

priceRoutes.patch(
  "/:id",
  protect,
  authorize("admin"),
  body("crop").notEmpty(),
  body("region").notEmpty(),
  body("market").notEmpty(),
  body("unit").notEmpty(),
  body("price").isFloat({ min: 0 }),
  validateRequest,
  updatePriceEntry
);

priceRoutes.delete("/:id", protect, authorize("admin"), deletePriceEntry);
