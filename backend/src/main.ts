import "dotenv/config";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Client } from "pg";
import { migrate } from "./db/migrate";

import ideaRoutes from "./routes/ideas";

const app = express();
const port = Number(process.env.PORT ?? 4000);

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS policy"));
    }
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", ideaRoutes);
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled API error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function waitForDb(client: Client, maxAttempts = 30, delayMs = 2000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      await client.connect();
      await client.query("SELECT 1");
      await client.end();
      // eslint-disable-next-line no-console
      console.log("Database is ready");
      return;
    } catch {
      attempts++;
      // eslint-disable-next-line no-console
      console.log(`Waiting for database... (${attempts}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Database not ready after max attempts");
}

async function startServer() {
  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await waitForDb(dbClient);
  await migrate();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", err);
  process.exit(1);
});

