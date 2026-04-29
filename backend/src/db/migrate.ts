import { pool } from "../db";

export async function migrate() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS user_ideas (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text,
      location geometry(Point, 4326) NOT NULL,
      status text NOT NULL DEFAULT 'pending',
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS user_ideas_location_gist ON user_ideas USING GIST (location);
    CREATE INDEX IF NOT EXISTS user_ideas_status_idx ON user_ideas (status);
  `);

  await pool.query(`
    ALTER TABLE user_ideas
    ADD COLUMN IF NOT EXISTS is_seed_demo boolean NOT NULL DEFAULT false;
  `);
}

if (require.main === module) {
  migrate()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log("Migrations completed.");
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

