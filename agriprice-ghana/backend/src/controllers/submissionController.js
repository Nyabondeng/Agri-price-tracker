import { PriceEntry } from "../models/PriceEntry.js";
import { PriceSubmission } from "../models/PriceSubmission.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const submitPrice = asyncHandler(async (req, res) => {
  const { crop, region, market, unit, price } = req.body;

  const submission = await PriceSubmission.create({
    crop,
    region,
    market,
    unit,
    price,
    submittedBy: req.user._id,
    status: "pending"
  });

  res.status(201).json({ item: submission });
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const { status = "pending" } = req.query;

  const filter = status === "all" ? {} : { status };
  const items = await PriceSubmission.find(filter)
    .sort({ createdAt: -1 })
    .populate("submittedBy", "fullName email")
    .populate("reviewedBy", "fullName email");

  res.status(200).json({ items });
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, reviewComment = "" } = req.body;

  const submission = await PriceSubmission.findById(id);
  if (!submission) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  submission.status = decision;
  submission.reviewedBy = req.user._id;
  submission.reviewComment = reviewComment;
  await submission.save();

  if (decision === "approved") {
    await PriceEntry.create({
      crop: submission.crop,
      region: submission.region,
      market: submission.market,
      unit: submission.unit,
      price: submission.price,
      submittedBy: submission.submittedBy,
      approvedBy: req.user._id,
      source: "submission"
    });
  }

  res.status(200).json({ item: submission });
});
