import { Router } from "express";
import { body, query } from "express-validator";

import { listSubmissions, reviewSubmission, submitPrice } from "../controllers/submissionController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

export const submissionRoutes = Router();

submissionRoutes.post(
  "/",
  protect,
  body("crop").notEmpty(),
  body("region").notEmpty(),
  body("market").notEmpty(),
  body("unit").notEmpty(),
  body("price").isFloat({ min: 0 }),
  validateRequest,
  submitPrice
);

submissionRoutes.get(
  "/",
  protect,
  authorize("admin"),
  query("status").optional().isIn(["pending", "approved", "rejected", "all"]),
  validateRequest,
  listSubmissions
);

submissionRoutes.patch(
  "/:id/review",
  protect,
  authorize("admin"),
  body("decision").isIn(["approved", "rejected"]),
  body("reviewComment").optional().isString(),
  validateRequest,
  reviewSubmission
);
