import fs from "node:fs/promises";
import path from "node:path";

const SHEET_ID = "1Z5PjyJxJgOrtfQDM4W-c0PIEiH0K-Rm6qaettFuzMJU";
const SHEET_GID = process.env.SHEET_GID ?? "636145318"; // sale
const MAX_LOTS = Number.parseInt(process.env.MAX_LOTS ?? "84", 10);
const DOWNLOAD_IMAGES = (process.env.DOWNLOAD_IMAGES ?? "0") === "1";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

function parseCsv(text) {
  /** Minimal RFC4180-ish parser, supports quotes/newlines/commas. */
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      pushCell();
      i += 1;
      continue;
    }
    if (ch === "\n") {
      pushCell();
      pushRow();
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }

    cell += ch;
    i += 1;
  }

  pushCell();
  pushRow();

  // Drop trailing empty line if present
  while (rows.length && rows[rows.length - 1].every((c) => c === "")) rows.pop();

  return rows;
}

function digitsToInt(value) {
  const s = String(value ?? "");
  const digits = s.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}

function keyByHeader(headers) {
  const map = new Map();
  headers.forEach((h, idx) => map.set(normalizeText(h).toLowerCase(), idx));
  return (name) => {
    const idx = map.get(name.toLowerCase());
    if (typeof idx !== "number") throw new Error(`Missing column: ${name}`);
    return idx;
  };
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function extFromContentType(contentType) {
  const ct = (contentType || "").toLowerCase();
  if (ct.includes("image/jpeg")) return "jpg";
  if (ct.includes("image/png")) return "png";
  if (ct.includes("image/webp")) return "webp";
  if (ct.includes("image/avif")) return "avif";
  return "jpg";
}

async function downloadImage(url, destPathBase) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0" },
    signal: ctrl.signal
  }).finally(() => clearTimeout(t));
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  const ext = extFromContentType(ct);
  const destPath = `${destPathBase}.${ext}`;
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(destPath, buf);
  return { ext, destPath };
}

async function mapLimit(items, limit, fn) {
  const ret = new Array(items.length);
  let idx = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx;
      idx += 1;
      ret[cur] = await fn(items[cur], cur);
    }
  });

  await Promise.all(workers);
  return ret;
}

async function resolveLocalImageUrl(publicImagesDir, id) {
  const destBase = path.join(publicImagesDir, String(id));
  const known = ["jpg", "png", "webp", "avif"].map((e) => `${destBase}.${e}`);
  for (const p of known) {
    try {
      await fs.access(p);
      const ext = path.extname(p).slice(1) || "jpg";
      return `/simulator-torgov/images/${id}.${ext}`;
    } catch {
      // continue
    }
  }
  return null;
}

async function main() {
  const res = await fetch(CSV_URL, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);
  const csvText = await res.text();
  const rows = parseCsv(csvText);
  if (rows.length < 2) throw new Error("CSV has no data rows");

  const headers = rows[0];
  const col = keyByHeader(headers);

  const idxLotUrl = col("ссылка");
  const idxImageUrl = col("фото");
  const idxTitle = null;
  const idxAreaM2 = col("площадь");
  const idxAreaSotok = col("площадь, соток");
  const idxUse = col("Назначение");
  const idxCadastral = col("кадастровй номер");
  const idxDistrictName = col("название района");
  const idxStart = col("стартовая");
  const idxFinal = col("итоговая");

  const outRaw = [];
  const seen = new Set();

  const publicImagesDir = path.join(process.cwd(), "public", "simulator-torgov", "images");
  if (DOWNLOAD_IMAGES) await ensureDir(publicImagesDir);

  for (const r of rows.slice(1)) {
    const lotUrl = normalizeText(r[idxLotUrl]);
    if (!lotUrl) continue;
    if (seen.has(lotUrl)) continue;
    seen.add(lotUrl);

    const finalPrice = digitsToInt(r[idxFinal]);
    const startPrice = digitsToInt(r[idxStart]);
    if (finalPrice == null || startPrice == null) continue;

    outRaw.push({
      id: outRaw.length + 1,
      lotUrl,
      imageUrl: normalizeText(r[idxImageUrl]),
      title: idxTitle == null ? "" : normalizeText(r[idxTitle]),
      areaM2: digitsToInt(r[idxAreaM2]),
      areaSotok: digitsToInt(r[idxAreaSotok]),
      districtName: normalizeText(r[idxDistrictName]),
      purpose: normalizeText(r[idxUse]),
      cadastralNumber: normalizeText(r[idxCadastral]),
      startPriceRub: startPrice,
      finalPriceRub: finalPrice
    });

    if (outRaw.length >= MAX_LOTS) break;
  }

  if (outRaw.length < 40) {
    throw new Error(`Too few lots parsed (${outRaw.length}). Check sheet format/permissions.`);
  }

  const out = await mapLimit(outRaw, 6, async (lot) => {
    const existingLocal = await resolveLocalImageUrl(publicImagesDir, lot.id);
    if (existingLocal) return { ...lot, imageUrl: existingLocal };

    if (!DOWNLOAD_IMAGES) return { ...lot, imageUrl: "/simulator-torgov/placeholder.svg" };

    const remoteImageUrl = lot.imageUrl;
    if (!remoteImageUrl) return { ...lot, imageUrl: "/simulator-torgov/placeholder.svg" };

    try {
      const destBase = path.join(publicImagesDir, String(lot.id));
      const { ext } = await downloadImage(remoteImageUrl, destBase);
      return { ...lot, imageUrl: `/simulator-torgov/images/${lot.id}.${ext}` };
    } catch {
      return { ...lot, imageUrl: "/simulator-torgov/placeholder.svg" };
    }
  });

  const outPath = path.join(process.cwd(), "app", "simulator-torgov", "data", "lots.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  console.log(`Wrote ${out.length} lots to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

