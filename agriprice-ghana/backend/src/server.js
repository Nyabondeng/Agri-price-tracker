import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { startAlertScheduler } from "./services/alertScheduler.js";

async function bootstrap() {
  await connectDatabase();
  startAlertScheduler();

  app.listen(env.port, () => {
    console.log(`AgriPrice backend running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
