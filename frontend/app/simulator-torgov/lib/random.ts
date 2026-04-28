export function pickUniqueRandomIndices(total: number, count: number) {
  if (count > total) throw new Error("count > total");
  const pool = new Uint32Array(total);
  for (let i = 0; i < total; i += 1) pool[i] = i;

  // Fisher–Yates partial shuffle
  const rnd = new Uint32Array(total);
  crypto.getRandomValues(rnd);
  for (let i = 0; i < count; i += 1) {
    const j = i + (rnd[i] % (total - i));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  return Array.from(pool.slice(0, count));
}

