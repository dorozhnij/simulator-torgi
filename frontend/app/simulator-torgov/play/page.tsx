"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import lots from "../data/lots.json";
import type { AuctionLot, RoundAnswer } from "../lib/types";
import { clearGameState, createNewGameState, loadGameState, saveGameState } from "../lib/storage";
import { formatRub, formatSotokWord } from "../lib/format";

const ROUND_COUNT = 10;
const SLIDER_STEP = 1000;
const SLIDER_NUDGE_KEY = "zemlytech.auctionSim.sliderNudge.v2";

type RevealState =
  | { status: "guessing"; guessRub: number }
  | { status: "revealed"; guessRub: number; answer: RoundAnswer };

export default function SimulatorPlayPage() {
  const allLots = lots as AuctionLot[];
  const [mounted, setMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const [lotIds, setLotIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [reveal, setReveal] = useState<RevealState | null>(null);

  useEffect(() => {
    setMounted(true);
    const existing = loadGameState();
    if (existing && existing.lotIds?.length === ROUND_COUNT) {
      setLotIds(existing.lotIds);
      setCurrentIndex(existing.currentIndex ?? 0);
      setAnswers(existing.answers ?? []);
      return;
    }
    const fresh = createNewGameState(allLots, ROUND_COUNT);
    saveGameState(fresh);
    setLotIds(fresh.lotIds);
    setCurrentIndex(0);
    setAnswers([]);
  }, [allLots]);

  const currentLot = useMemo(() => {
    const id = lotIds[currentIndex];
    return allLots.find((l) => l.id === id) ?? null;
  }, [allLots, lotIds, currentIndex]);

  useEffect(() => {
    if (!mounted) return;
    if (!currentLot) return;
    const min = currentLot.startPriceRub;
    const initial = clampToStep(min, SLIDER_STEP);
    setReveal({ status: "guessing", guessRub: initial });
    setImageFailed(false);
  }, [mounted, currentLot]);

  useEffect(() => {
    if (!mounted) return;
    if (!currentLot) return;
    if (currentIndex !== 0) return;
    if (reveal?.status !== "guessing") return;

    try {
      if (sessionStorage.getItem(SLIDER_NUDGE_KEY) === "1") return;
      sessionStorage.setItem(SLIDER_NUDGE_KEY, "1");
    } catch {
      // ignore
    }

    const min = currentLot.startPriceRub;
    const max = currentLot.startPriceRub * 3;
    const base = clampToStep(min, SLIDER_STEP);
    const span = Math.max(SLIDER_STEP * 8, Math.floor((max - min) * 0.18));
    const bumped = clampToStep(Math.min(max, base + span), SLIDER_STEP);

    const t1 = window.setTimeout(() => {
      setReveal((prev) => (prev?.status === "guessing" ? { status: "guessing", guessRub: bumped } : prev));
    }, 450);

    const t2 = window.setTimeout(() => {
      setReveal((prev) => (prev?.status === "guessing" ? { status: "guessing", guessRub: base } : prev));
    }, 1100);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mounted, currentLot, currentIndex, reveal?.status]);

  if (!mounted) {
    return <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-6" />;
  }

  if (!currentLot) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-6">
        <section className="rounded-3xl border border-[#26CD94]/25 bg-white p-5 shadow-sm">
          <p className="text-sm text-[#0B1B14]/80">Не удалось загрузить лот.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/simulator-torgov" className="btn btn--secondary w-full">
              На старт
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const progressText = `${Math.min(currentIndex + 1, ROUND_COUNT)}/${ROUND_COUNT}`;

  const min = currentLot.startPriceRub;
  const max = currentLot.startPriceRub * 3;

  const guessRub = reveal?.guessRub ?? min;

  const onStartAuction = () => {
    const actual = currentLot.finalPriceRub;
    const delta = guessRub - actual;
    const answer: RoundAnswer = {
      lotId: currentLot.id,
      guessRub,
      actualRub: actual,
      deltaRub: delta
    };
    setReveal({ status: "revealed", guessRub, answer });
  };

  const onNext = () => {
    if (!reveal || reveal.status !== "revealed") return;

    const nextAnswers = [...answers, reveal.answer];
    const nextIndex = currentIndex + 1;

    setAnswers(nextAnswers);
    setCurrentIndex(nextIndex);
    setReveal(null);

    const state = loadGameState();
    if (state) {
      const updated = { ...state, answers: nextAnswers, currentIndex: nextIndex };
      saveGameState(updated);
    }
  };

  const isLast = currentIndex >= ROUND_COUNT - 1;
  const isRevealed = reveal?.status === "revealed";

  return (
    <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-[#0B1B14]/75">Прогресс</div>
        <div className="text-sm font-semibold">{progressText}</div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#26CD94]/15">
        <div
          className="h-full rounded-full bg-[#26CD94] transition-[width] duration-300"
          style={{ width: `${((currentIndex + 1) / ROUND_COUNT) * 100}%` }}
        />
      </div>

      <section className="mt-4 overflow-hidden rounded-3xl border border-[#26CD94]/25 bg-white shadow-sm">
        <div className="relative aspect-[5/3] w-full bg-[#F2FFFA]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              imageFailed
                ? "/simulator-torgov/placeholder.svg"
                : currentLot.imageUrl.startsWith("/")
                  ? currentLot.imageUrl
                  : "/simulator-torgov/placeholder.svg"
            }
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </div>

        <div className="p-5">
          <h2 className="text-base font-semibold leading-snug">
            {currentLot.purpose}
            {currentLot.areaSotok != null ? `, ${formatSotokWord(currentLot.areaSotok)}` : ""}
            {currentLot.districtName ? ` — ${currentLot.districtName}` : ""}
          </h2>

          <div className="mt-4 rounded-2xl border border-[#26CD94]/20 bg-[#F6FFFC] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#0B1B14]/75">Стартовая цена</div>
              <div className="text-sm font-semibold">{formatRub(currentLot.startPriceRub)}</div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-[#0B1B14]/75">Ваша ставка</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{formatRub(guessRub)}</div>
              <input
                className="mt-3 w-full accent-[#26CD94]"
                type="range"
                min={min}
                max={max}
                step={SLIDER_STEP}
                value={guessRub}
                onChange={(e) =>
                  setReveal((prev) =>
                    prev?.status === "guessing"
                      ? { status: "guessing", guessRub: clampToStep(Number(e.target.value), SLIDER_STEP) }
                      : prev
                  )
                }
                disabled={isRevealed}
                aria-label="Выберите цену"
              />
            </div>
          </div>

          {!isRevealed ? (
            <button className="btn btn--accent mt-4 w-full py-4 text-base font-semibold" onClick={onStartAuction}>
              Проверить цену
            </button>
          ) : (
            <RevealBlock
              answer={(reveal as Extract<RevealState, { status: "revealed" }>).answer}
              lotUrl={currentLot.lotUrl}
            />
          )}

          {isRevealed ? (
            isLast ? (
              <Link
                href="/simulator-torgov/result"
                className="btn btn--accent mt-4 w-full py-4 text-base font-semibold"
                onClick={() => {
                  const state = loadGameState();
                  if (state && answers.length === currentIndex) {
                    const nextAnswers = [...answers, (reveal as any).answer as RoundAnswer];
                    saveGameState({ ...state, answers: nextAnswers, currentIndex: currentIndex + 1 });
                  }
                }}
              >
                Показать итог
              </Link>
            ) : (
              <button className="btn btn--accent mt-4 w-full py-4 text-base font-semibold" onClick={onNext}>
                Следующий лот
              </button>
            )
          ) : (
            <button
              className="btn btn--secondary mt-3 w-full py-3 text-base"
              onClick={() => {
                clearGameState();
                const fresh = createNewGameState(allLots, ROUND_COUNT);
                saveGameState(fresh);
                setLotIds(fresh.lotIds);
                setCurrentIndex(0);
                setAnswers([]);
                setReveal(null);
              }}
            >
              Начать заново
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function RevealBlock({ answer, lotUrl }: { answer: RoundAnswer; lotUrl: string }) {
  const abs = Math.abs(answer.deltaRub);
  const text =
    answer.deltaRub === 0
      ? "Вы попали точно в цену"
      : answer.deltaRub > 0
        ? `Вы указали сумму на ${formatRub(abs)} больше`
        : `Вы указали сумму на ${formatRub(abs)} меньше`;

  const borderClass =
    answer.deltaRub === 0
      ? "border-[#26CD94]"
      : answer.deltaRub > 0
        ? "border-red-500"
        : "border-[#0B1B14]";

  return (
    <div className={`mt-4 rounded-2xl border-2 bg-white p-4 shadow-sm ${borderClass}`}>
      <div className="text-sm text-[#0B1B14]/75">Правильный ответ</div>
      <div className="mt-1 text-xl font-semibold">{formatRub(answer.actualRub)}</div>
      <div className="mt-2 text-sm font-medium text-[#0B1B14]">{text}</div>
      <a
        href={lotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#26CD94]/25 bg-white px-4 py-2 text-sm font-medium text-[#0B1B14] transition-colors hover:bg-[#26CD94]/10"
      >
        Открыть лот
      </a>
    </div>
  );
}

function clampToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

