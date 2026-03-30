import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";

function extractToken(header = "") {
  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.split(" ")[1];
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    const error = new Error("Unauthorized: Missing token");
    error.statusCode = 401;
    throw error;
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    const error = new Error("Unauthorized: Invalid token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.id).select("-passwordHash");
  if (!user) {
    const error = new Error("Unauthorized: User not found");
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    next();
  };
}
