import bcrypt from "bcryptjs";

import { connectDatabase } from "../config/database.js";
import { PriceEntry } from "../models/PriceEntry.js";
import { User } from "../models/User.js";

const seedPrices = [
  { crop: "Maize", region: "Accra", market: "Agbogbloshie", unit: "100kg bag", price: 780 },
  { crop: "Rice", region: "Kumasi", market: "Kejetia", unit: "50kg bag", price: 620 },
  { crop: "Cassava", region: "Tamale", market: "Aboabo", unit: "basket", price: 150 },
  { crop: "Yam", region: "Sunyani", market: "Central Market", unit: "tuber", price: 40 },
  { crop: "Tomatoes", region: "Accra", market: "Makola", unit: "crate", price: 320 },
  { crop: "Cocoa", region: "Kumasi", market: "Ejisu Depot", unit: "64kg bag", price: 1820 }
];

async function run() {
  await connectDatabase();

  await Promise.all([User.deleteMany({}), PriceEntry.deleteMany({})]);

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash = await bcrypt.hash("User123!", 10);

  const [admin] = await User.create([
    {
      fullName: "AgriPrice Admin",
      email: "admin@agripricegh.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      authProvider: "local"
    },
    {
      fullName: "Sample Farmer",
      email: "farmer@agripricegh.com",
      passwordHash: userPasswordHash,
      role: "user",
      authProvider: "local"
    }
  ]);

  await PriceEntry.insertMany(
    seedPrices.map((item) => ({
      ...item,
      submittedBy: admin._id,
      approvedBy: admin._id,
      source: "seed"
    }))
  );

  // eslint-disable-next-line no-console
  console.log("Seed complete. Admin: admin@agripricegh.com / Admin123!");
  // eslint-disable-next-line no-console
  console.log("User: farmer@agripricegh.com / User123!");

  process.exit(0);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
