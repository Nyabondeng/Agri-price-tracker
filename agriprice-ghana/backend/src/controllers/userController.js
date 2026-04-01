import { PriceEntry } from "../models/PriceEntry.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("fullName email role authProvider createdAt").sort({ _id: -1 });
  res.status(200).json({ items: users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("fullName email role authProvider");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ item: user });
});

export const updatePriceEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { crop, region, market, unit, price } = req.body;

  const entry = await PriceEntry.findByIdAndUpdate(
    id,
    {
      crop,
      region,
      market,
      unit,
      price,
      source: "admin-edit"
    },
    { new: true }
  );

  if (!entry) {
    const error = new Error("Price entry not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ item: entry });
});

export const deletePriceEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await PriceEntry.findByIdAndDelete(id);

  if (!deleted) {
    const error = new Error("Price entry not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ message: "Price entry deleted" });
});