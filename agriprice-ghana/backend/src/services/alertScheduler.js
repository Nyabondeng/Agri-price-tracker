import cron from "node-cron";

import { env } from "../config/env.js";
import { PriceEntry } from "../models/PriceEntry.js";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { sendPriceAlertEmail } from "./emailService.js";

async function evaluateAlerts() {
  const subscriptions = await Subscription.find().lean();

  for (const subscription of subscriptions) {
    const recent = await PriceEntry.find({
      crop: subscription.crop,
      region: subscription.region
    })
      .sort({ _id: -1 })
      .limit(2)
      .lean();

    if (recent.length < 2) {
      continue;
    }

    const [latest, previous] = recent;
    const percentChange = Math.abs(((latest.price - previous.price) / previous.price) * 100);
    const threshold = subscription.thresholdPercent || env.alertPriceChangePercent;

    if (percentChange < threshold) {
      continue;
    }

    const user = await User.findById(subscription.user).lean();
    if (!user?.email) {
      continue;
    }

    await sendPriceAlertEmail({
      to: user.email,
      crop: subscription.crop,
      region: subscription.region,
      previousPrice: previous.price,
      currentPrice: latest.price
    });
  }
}

export function startAlertScheduler() {
  cron.schedule("*/30 * * * *", async () => {
    try {
      await evaluateAlerts();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Alert scheduler failed:", error.message);
    }
  });
}