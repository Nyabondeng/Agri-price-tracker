import { Donation } from "../models/Donation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { initializePaystackTransaction, verifyPaystackTransaction } from "../services/paystackService.js";

function createReference() {
  return `AGRIPRICE_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export const initializeDonation = asyncHandler(async (req, res) => {
  const { donorName = "Anonymous", email, amount } = req.body;

  const reference = createReference();
  const checkout = await initializePaystackTransaction({
    amount,
    email,
    reference,
    metadata: { donorName }
  });

  await Donation.create({
    donorName,
    email,
    amount,
    reference,
    status: "initialized",
    metadata: checkout
  });

  res.status(201).json({
    authorizationUrl: checkout.authorization_url,
    reference
  });
});

export const verifyDonation = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const result = await verifyPaystackTransaction(reference);

  const status = result.status === "success" ? "success" : "failed";
  const donation = await Donation.findOneAndUpdate(
    { reference },
    {
      status,
      metadata: result
    },
    { new: true }
  );

  if (!donation) {
    const error = new Error("Donation record not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ item: donation });
});
