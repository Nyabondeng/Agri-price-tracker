import { Subscription } from "../models/Subscription.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const createSubscription = asyncHandler(async (req, res) => {
  const { crop, region, thresholdPercent } = req.body;

  const item = await Subscription.findOneAndUpdate(
    {
      user: req.user._id,
      crop,
      region
    },
    {
      thresholdPercent
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  res.status(201).json({ item });
});

export const getSubscriptions = asyncHandler(async (req, res) => {
  const items = await Subscription.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ items });
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Subscription.findOneAndDelete({ _id: id, user: req.user._id });

  if (!deleted) {
    const error = new Error("Subscription not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ message: "Subscription removed" });
});
