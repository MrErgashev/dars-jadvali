'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import DownloadScheduleButton from '@/components/ui/DownloadScheduleButton';

export default function Header() {
  const [range, setRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    const formatDateDDMMYYYY = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const getWeekRangeForSchedule = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay(); // 0=Yakshanba ... 6=Shanba
      const isoDay = day === 0 ? 7 : day; // 1=Dushanba ... 7=Yakshanba

      if (isoDay > 5) {
        const daysToNextMonday = 8 - isoDay;
        d.setDate(d.getDate() + daysToNextMonday);
      } else {
        d.setDate(d.getDate() - (isoDay - 1));
      }

      const start = new Date(d);
      const end = new Date(d);
      end.setDate(start.getDate() + 4);

      return {
        start: formatDateDDMMYYYY(start),
        end: formatDateDDMMYYYY(end),
      };
    };

    const update = () => setRange(getWeekRangeForSchedule(new Date()));
    const timeoutId = window.setTimeout(update, 0);
    const intervalId = window.setInterval(update, 60 * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="glass sticky top-0 z-50 mb-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
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

          {/* Haftalik sana (Header markazi) */}
          {range.start && range.end && (
            <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 px-4 py-1 rounded-xl neo-inset">
              <span className="text-lg lg:text-xl font-extrabold gradient-text tracking-wide">
                {range.start}
              </span>
              <span className="text-base lg:text-lg font-bold text-[var(--foreground-secondary)]">
                -
              </span>
              <span className="text-lg lg:text-xl font-extrabold gradient-text tracking-wide">
                {range.end}
              </span>
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
