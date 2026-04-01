import { PriceEntry } from "../models/PriceEntry.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { predictNextValue } from "../services/predictionService.js";

export const getLatestPrices = asyncHandler(async (req, res) => {
  const { crop, region, limit = 50 } = req.query;

  const filter = {};
  if (crop) {
    filter.crop = crop;
  }
  if (region) {
    filter.region = region;
  }

  const prices = await PriceEntry.find(filter)
    .sort({ _id: -1 })
    .limit(Number(limit))
    .populate("submittedBy", "fullName email");

  res.status(200).json({ items: prices });
});

export const getPriceHistory = asyncHandler(async (req, res) => {
  const { crop, region, days = 30 } = req.query;

  const filter = {};
  if (crop) {
    filter.crop = crop;
  }
  if (region) {
    filter.region = region;
  }

  const since = new Date();
  since.setDate(since.getDate() - Number(days));
  filter.createdAt = { $gte: since };

  const history = await PriceEntry.find(filter).sort({ _id: 1 });
  res.status(200).json({ items: history });
});

export const compareRegions = asyncHandler(async (req, res) => {
  const { crop } = req.query;

  if (!crop) {
    const error = new Error("Query parameter 'crop' is required");
    error.statusCode = 400;
    throw error;
  }

  const records = await PriceEntry.aggregate([
    { $match: { crop } },
    { $sort: { _id: -1 } },
    {
      $group: {
        _id: "$region",
        latestPrice: { $first: "$price" },
        market: { $first: "$market" },
        updatedAt: { $first: "$createdAt" }
      }
    },
    { $project: { _id: 0, region: "$_id", latestPrice: 1, market: 1, updatedAt: 1 } }
  ]);

  res.status(200).json({ items: records });
});

export const getPricePrediction = asyncHandler(async (req, res) => {
  const { crop, region } = req.query;

  if (!crop || !region) {
    const error = new Error("Query parameters 'crop' and 'region' are required");
    error.statusCode = 400;
    throw error;
  }

  const series = await PriceEntry.find({ crop, region }).sort({ _id: 1 }).limit(20);
  const predictedPrice = predictNextValue(series);

  if (predictedPrice === null) {
    const error = new Error("Not enough historical data for prediction");
    error.statusCode = 400;
    throw error;
  }

  res.status(200).json({
    crop,
    region,
    predictedPrice,
    basedOnRecords: series.length
  });
});