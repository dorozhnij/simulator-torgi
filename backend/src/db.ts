import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST ?? "localhost",
        port: Number(process.env.PGPORT ?? 5432),
        database: process.env.PGDATABASE ?? "app",
        user: process.env.PGUSER ?? "app",
        password: process.env.PGPASSWORD ?? "app"
      }
);

