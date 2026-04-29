export type IdeaStatus = "pending" | "approved" | "rejected";

export type IdeaRow = {
  id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  lng: number;
  lat: number;
  created_at: string;
};

export const IDEA_TABLE_SQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS user_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location geometry(Point, 4326) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_seed_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_ideas_location_gist ON user_ideas USING GIST (location);
CREATE INDEX IF NOT EXISTS user_ideas_status_idx ON user_ideas (status);
`;

