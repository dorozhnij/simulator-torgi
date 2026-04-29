import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import type { Feature, FeatureCollection, Point } from "geojson";
import { pool } from "../db";
import { type IdeaRow } from "../models/Idea";

const ideasRouter = Router();

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

ideasRouter.post("/ideas", async (req: Request, res: Response, next: NextFunction) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const description =
    typeof req.body?.description === "string" ? req.body.description.trim() : null;
  const status = "approved";

  const lng = req.body?.location?.lng;
  const lat = req.body?.location?.lat;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  if (!isFiniteNumber(lng) || !isFiniteNumber(lat)) {
    return res.status(400).json({ error: "location{lng,lat} must be numbers" });
  }
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return res.status(400).json({ error: "location{lng,lat} out of range" });
  }

  try {
    const result = await pool.query<IdeaRow>(
      `
      INSERT INTO user_ideas (title, description, location, status)
      VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326), $5)
      RETURNING
        id,
        title,
        description,
        status,
        ST_X(location)::float8 AS lng,
        ST_Y(location)::float8 AS lat,
        created_at::text
      `,
      [title, description, lng, lat, status]
    );

    return res.status(201).json({ idea: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

ideasRouter.get("/ideas", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query<IdeaRow>(
      `
      SELECT
        id,
        title,
        description,
        status,
        ST_X(location)::float8 AS lng,
        ST_Y(location)::float8 AS lat,
        created_at::text
      FROM user_ideas
      WHERE status = 'approved'
      ORDER BY created_at DESC
      `
    );

    return res.json({ ideas: result.rows });
  } catch (error) {
    return next(error);
  }
});

ideasRouter.get("/export", async (req: Request, res: Response, next: NextFunction) => {
  const formatRaw = typeof req.query.format === "string" ? req.query.format : "geojson";
  const format = formatRaw.toLowerCase();

  try {
    const result = await pool.query<IdeaRow>(
      `
      SELECT
        id,
        title,
        description,
        status,
        ST_X(location)::float8 AS lng,
        ST_Y(location)::float8 AS lat,
        created_at::text
      FROM user_ideas
      WHERE status = 'approved'
      ORDER BY created_at DESC
      `
    );

    if (format === "csv") {
      res.setHeader("content-type", "text/csv; charset=utf-8");
      res.setHeader("content-disposition", "attachment; filename=ideas.csv");
      const header = ["id", "title", "description", "status", "lng", "lat", "created_at"];
      const lines = [header.join(",")];

      for (const row of result.rows) {
        const cells = [
          row.id,
          row.title,
          row.description ?? "",
          row.status,
          String(row.lng),
          String(row.lat),
          row.created_at
        ].map((v) => `"${String(v).replaceAll('"', '""')}"`);
        lines.push(cells.join(","));
      }

      return res.send(lines.join("\n"));
    }

    const features: Array<Feature<Point, Omit<IdeaRow, "lng" | "lat">>> = result.rows.map(
      (row) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [row.lng, row.lat]
        },
        properties: {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          created_at: row.created_at
        }
      })
    );

    const fc: FeatureCollection = {
      type: "FeatureCollection",
      features
    };

    return res.json(fc);
  } catch (error) {
    return next(error);
  }
});

export default ideasRouter;

