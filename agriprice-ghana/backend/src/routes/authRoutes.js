import { Router } from "express";
import { body } from "express-validator";

import { googleLogin, login, profile, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  body("fullName").trim().isLength({ min: 2 }),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  validateRequest,
  register
);

authRoutes.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  validateRequest,
  login
);

authRoutes.post(
  "/google",
  body("idToken").notEmpty(),
  validateRequest,
  googleLogin
);

authRoutes.get("/me", protect, profile);
