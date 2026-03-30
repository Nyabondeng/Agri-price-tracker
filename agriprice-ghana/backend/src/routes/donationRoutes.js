import { Router } from "express";
import { body } from "express-validator";

import { initializeDonation, verifyDonation } from "../controllers/donationController.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

export const donationRoutes = Router();

donationRoutes.post(
  "/initialize",
  body("email").isEmail(),
  body("amount").isFloat({ min: 1 }),
  body("donorName").optional().isString(),
  validateRequest,
  initializeDonation
);

donationRoutes.get("/verify/:reference", verifyDonation);
