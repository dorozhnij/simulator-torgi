import Link from "next/link";

export default function SimulatorStartPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col px-4 pb-28 pt-6">
      <section className="rounded-3xl border border-[#26CD94]/25 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold leading-tight">Симулятор торгов</h1>
        <p className="mt-3 text-base leading-relaxed text-[#0B1B14]/80">
          Игра для начинающих и опытных участников торгов по земельным участкам. Проверьте,
          насколько точно вы сможете оценить итоговую стоимость участка на аукционе. В игре —
          только аукционы продажи, которые реально были разыграны на площадке ГИС Торги в
          2024-2026 гг.
        </p>

        <div className="mt-5">
          <Link
            href="/simulator-torgov/play"
            className="btn btn--accent w-full py-4 text-base font-semibold"
          >
            Запустить игру
          </Link>
        </div>
      </section>
    </main>
  );
}
