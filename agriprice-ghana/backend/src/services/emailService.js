import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  return transporter;
}

export async function sendPriceAlertEmail({ to, crop, region, previousPrice, currentPrice }) {
  const mailer = getTransporter();
  if (!mailer) {
    return;
  }

  await mailer.sendMail({
    from: env.smtpFrom,
    to,
    subject: `AgriPrice Alert: ${crop} price update in ${region}`,
    text: `Price changed from GHS ${previousPrice} to GHS ${currentPrice} for ${crop} in ${region}.`
  });
}
