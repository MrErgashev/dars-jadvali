'use client';

import Header from '@/components/layout/Header';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import { useSchedule } from '@/hooks/useSchedule';

export default function Home() {
  const { lessons, loading, error } = useSchedule();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Xabar */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Jadval */}
        <ScheduleGrid lessons={lessons} isLoading={loading} />

        {/* Bo'sh jadval xabari */}
        {!loading && lessons.length === 0 && (
          <div className="text-center py-16">
            <div className="neo inline-block p-8 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-[var(--foreground-secondary)] mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Jadval bo'sh
            </h2>
            <p className="text-[var(--foreground-secondary)] mb-4">
              Hali hech qanday dars qo'shilmagan
            </p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Dars qo'shish
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[var(--foreground-secondary)]">
          <p>Dars Jadvali &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
