export function ZemlyTechBottomLinks() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#26CD94]/20 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/75"
      aria-label="Ссылки земли.тех"
    >
      <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-2 px-3 py-3">
        <a
          href="https://zemlyabot.ru/landplotbot"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[#26CD94]/25 bg-white px-2.5 py-2 text-center text-xs font-medium text-[#0B1B14] shadow-sm transition-colors hover:bg-[#26CD94]/10"
        >
          Проверить участок
        </a>
        <a
          href="https://zemlyabot.ru/realestate_deals_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[#26CD94]/25 bg-white px-2.5 py-2 text-center text-xs font-medium text-[#0B1B14] shadow-sm transition-colors hover:bg-[#26CD94]/10"
        >
          Оценить участок
        </a>
        <a
          href="https://zemlyabot.ru/torgibot"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-[#26CD94]/25 bg-white px-2.5 py-2 text-center text-xs font-medium text-[#0B1B14] shadow-sm transition-colors hover:bg-[#26CD94]/10"
        >
          Следить за торгами
        </a>
      </div>
    </nav>
  );
}

