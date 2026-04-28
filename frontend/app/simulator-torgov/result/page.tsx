"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import lots from "../data/lots.json";
import type { AuctionLot, RoundAnswer } from "../lib/types";
import { clearGameState, createNewGameState, loadGameState, saveGameState } from "../lib/storage";
import { formatRub } from "../lib/format";

const ROUND_COUNT = 10;

export default function SimulatorResultPage() {
  const allLots = lots as AuctionLot[];
  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);

  useEffect(() => {
    setMounted(true);
    const state = loadGameState();
    setAnswers(state?.answers ?? []);
  }, []);

  const totalDelta = useMemo(() => {
    return answers.reduce((sum, a) => sum + a.deltaRub, 0);
  }, [answers]);

  const headline =
    totalDelta === 0
      ? "Идеально: вы попали точно в цену"
      : totalDelta > 0
        ? `Вы переплатили ${formatRub(totalDelta)}`
        : `Вы недоплатили ${formatRub(Math.abs(totalDelta))}`;

  const canShow = mounted && answers.length >= ROUND_COUNT;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col px-4 pb-28 pt-6">
      <section className="rounded-3xl border border-[#26CD94]/25 bg-white p-5 shadow-sm">
        <p className="text-base font-semibold">{headline}.</p>
        {!canShow ? (
          <p className="mt-2 text-sm text-[#0B1B14]/70">
            Похоже, игра еще не завершена. Вернитесь к раундам и пройдите все 10 лотов.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-[#0B1B14]/70">
            Вы все равно отличный эксперт! Предсказать цену сложно, в этом вам помогут наши
            сервисы, ссылка на них — внизу страницы.
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3">
          <Link href="/simulator-torgov/play" className="btn btn--secondary w-full py-3 text-base">
            Вернуться к игре
          </Link>
          <button
            className="btn btn--accent w-full py-4 text-base font-semibold"
            onClick={() => {
              clearGameState();
              const fresh = createNewGameState(allLots, ROUND_COUNT);
              saveGameState(fresh);
              window.location.href = "/simulator-torgov/play";
            }}
          >
            Сыграть ещё раз
          </button>
        </div>
      </section>
    </main>
  );
}

