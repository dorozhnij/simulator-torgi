 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Всегда у верхнего края окна (совпадает с верхом hero-фото); контент ниже уезжает под шапку. */
export function SiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/simulator-torgov")) return null;

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-5 md:px-8">
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-b-3xl border border-white/20 bg-[var(--color-accent)] px-4 py-3 shadow-md sm:gap-4 sm:px-6 sm:py-3.5">
          <Link
            href="/"
            className="text-base font-semibold text-white transition-colors hover:text-white/90 sm:text-lg"
          >
            Мастер-план Димитровграда
          </Link>
          <nav
            className="flex flex-wrap items-center gap-4 sm:gap-6"
            aria-label="Основная навигация"
          >
            <Link
              href="/#map-section"
              className="rounded-full px-1 text-base text-white underline decoration-transparent transition-colors hover:bg-white/10 hover:text-white hover:underline sm:text-lg"
            >
              Карта идей
            </Link>
            <Link
              href="/#survey-section"
              className="rounded-full px-1 text-base text-white underline decoration-transparent transition-colors hover:bg-white/10 hover:text-white hover:underline sm:text-lg"
            >
              Пройти опрос
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
