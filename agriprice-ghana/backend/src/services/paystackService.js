import { env } from "../config/env.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export async function initializePaystackTransaction({ amount, email, reference, metadata = {} }) {
  if (!env.paystackSecretKey) {
    const error = new Error("PAYSTACK_SECRET_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      email,
      reference,
      callback_url: env.paystackCallbackUrl,
      metadata
    })
  });

  const payload = await response.json();
  if (!response.ok || !payload.status) {
    const error = new Error(payload.message || "Failed to initialize Paystack transaction");
    error.statusCode = 400;
    throw error;
  }

  return payload.data;
}

export async function verifyPaystackTransaction(reference) {
  if (!env.paystackSecretKey) {
    const error = new Error("PAYSTACK_SECRET_KEY is not configured");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`
    }
  });

  const payload = await response.json();
  if (!response.ok || !payload.status) {
    const error = new Error(payload.message || "Failed to verify Paystack transaction");
    error.statusCode = 400;
    throw error;
  }

  return payload.data;
}
