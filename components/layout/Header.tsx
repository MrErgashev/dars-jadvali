'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import DownloadScheduleButton from '@/components/ui/DownloadScheduleButton';
import { useWeek } from '@/context/WeekContext';

export default function Header() {
  const {
    weekRange,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = useWeek();

  return (
    <header className="glass sticky top-0 z-50 mb-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 sm:h-16">
          {/* Logo va Sarlavha */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">MrErgashev</h1>
              <p className="text-xs text-[var(--foreground-secondary)] hidden sm:block">
                5 kunlik dars jadvali
              </p>
            </div>
          </Link>

          {/* Haftalik sana (Header markazi) - Week Filter */}
          {weekRange.start && weekRange.end && (
            <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 lg:gap-2">
              {/* Oldingi hafta tugmasi */}
              <button
                onClick={goToPreviousWeek}
                className="neo-button p-2 text-[var(--foreground)] hover:text-[var(--accent-primary)] transition-colors"
                title="Oldingi hafta"
                aria-label="Oldingi hafta"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 lg:w-5 lg:h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              {/* Hafta oralig'i */}
              <button
                onClick={goToCurrentWeek}
                disabled={isCurrentWeek}
                className={`px-3 lg:px-4 py-1.5 rounded-xl neo-inset flex items-center gap-2 lg:gap-3 transition-all ${
                  !isCurrentWeek
                    ? 'hover:bg-[var(--accent-primary)]/10 cursor-pointer'
                    : 'cursor-default'
                }`}
                title={isCurrentWeek ? 'Hozirgi hafta' : 'Hozirgi haftaga qaytish'}
              >
                <span className="text-base lg:text-lg font-extrabold gradient-text tracking-wide">
                  {weekRange.start}
                </span>
                <span className="text-sm lg:text-base font-bold text-[var(--foreground-secondary)]">
                  -
                </span>
                <span className="text-base lg:text-lg font-extrabold gradient-text tracking-wide">
                  {weekRange.end}
                </span>
                {!isCurrentWeek && (
                  <span className="ml-1 text-xs text-[var(--accent-primary)] font-medium">
                    ↻
                  </span>
                )}
              </button>

              {/* Keyingi hafta tugmasi */}
              <button
                onClick={goToNextWeek}
                className="neo-button p-2 text-[var(--foreground)] hover:text-[var(--accent-primary)] transition-colors"
                title="Keyingi hafta"
                aria-label="Keyingi hafta"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 lg:w-5 lg:h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Navigatsiya */}
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <DownloadScheduleButton />

            {/* Admin tugmasi */}
            <Link
              href="/admin"
              className="neo-button p-3 text-[var(--foreground)] hover:text-[var(--accent-primary)]"
              title="Admin panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
