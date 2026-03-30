import bcrypt from "bcryptjs";

import { verifyFirebaseToken } from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import { createToken } from "../utils/token.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    createdAt: user.createdAt
  };
}

async function upsertFirebaseUser(decoded, fallbackFullName = "") {
  const email = decoded.email?.toLowerCase();
  if (!email) {
    const error = new Error("Firebase account email is required");
    error.statusCode = 400;
    throw error;
  }

  let user = await User.findOne({ email });
  const resolvedName = fallbackFullName || decoded.name || email.split("@")[0];

  if (!user) {
    user = await User.create({
      fullName: resolvedName,
      email,
      role: "user",
      authProvider: decoded.firebase?.sign_in_provider === "google.com" ? "google" : "local",
      firebaseUid: decoded.uid
    });
  }

  if (!user.firebaseUid) {
    user.firebaseUid = decoded.uid;
    await user.save();
  }

  return user;
}

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    role: "user",
    authProvider: "local"
  });

  res.status(201).json({
    token: createToken(user._id.toString()),
    user: sanitizeUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    token: createToken(user._id.toString()),
    user: sanitizeUser(user)
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const decoded = await verifyFirebaseToken(idToken);
  const user = await upsertFirebaseUser(decoded);

  res.status(200).json({
    token: createToken(user._id.toString()),
    user: sanitizeUser(user)
  });
});

export const firebaseAuthExchange = asyncHandler(async (req, res) => {
  const { idToken, fullName = "" } = req.body;
  const decoded = await verifyFirebaseToken(idToken);
  const user = await upsertFirebaseUser(decoded, fullName);

  res.status(200).json({
    token: createToken(user._id.toString()),
    user: sanitizeUser(user)
  });
});

export const profile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: sanitizeUser(req.user) });
});
