import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    crop: {
      type: String,
      required: true,
      trim: true
    },
    region: {
      type: String,
      required: true,
      trim: true
    },
    thresholdPercent: {
      type: Number,
      default: 10,
      min: 1,
      max: 99
    }
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, crop: 1, region: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
