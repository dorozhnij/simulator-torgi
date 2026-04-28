export function ZemlyTechHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold tracking-tight text-[#0B1B14]">
            Симулятор торгов
          </span>
          <a
            href="https://zemly.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-[#26CD94] underline decoration-transparent transition-colors hover:decoration-[#26CD94]"
          >
            земли.тех
          </a>
        </div>

        <nav className="flex items-center gap-2" aria-label="Навигация" />
      </div>
    </header>
  );
}

