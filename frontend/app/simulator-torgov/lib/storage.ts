import type { AuctionLot, RoundAnswer } from "./types";

const KEY = "zemlytech.auctionSim.v1";

export type GameState = {
  lotIds: number[];
  currentIndex: number; // 0..lotIds.length
  answers: RoundAnswer[];
  startedAt: number;
};

export function loadGameState(): GameState | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || !Array.isArray(parsed.lotIds)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState) {
  sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function clearGameState() {
  sessionStorage.removeItem(KEY);
}

export function createNewGameState(lots: AuctionLot[], roundCount: number): GameState {
  const ids = lots.map((l) => l.id);
  // avoid heavy shuffles: pick indices then map to ids
  const indices = new Set<number>();
  while (indices.size < roundCount) {
    const x = crypto.getRandomValues(new Uint32Array(1))[0] % ids.length;
    indices.add(x);
  }
  const lotIds = Array.from(indices).map((i) => ids[i]);

  return {
    lotIds,
    currentIndex: 0,
    answers: [],
    startedAt: Date.now()
  };
}

