import { Router } from "express";
import { body } from "express-validator";

import { listUsers, updateUserRole } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

export const userRoutes = Router();

userRoutes.get("/", protect, authorize("admin"), listUsers);
userRoutes.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  body("role").isIn(["user", "admin"]),
  validateRequest,
  updateUserRole
);
