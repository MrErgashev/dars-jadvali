'use client';

import React, { forwardRef } from 'react';
import { Lesson, Shift, TimeSlot, Day } from '@/lib/types';
import { DAYS } from '@/lib/constants';

interface ScheduleExportProps {
  lessons: Lesson[];
  shift: Shift;
  shiftLabel: string;
  times: TimeSlot[];
  weekRange: { start: string; end: string };
  generatedAt: string;
}

const shiftBadgeStyles: Record<Shift, { bg: string; text: string; dot: string }> = {
  kunduzgi: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
  },
  sirtqi: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
  },
  kechki: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-500',
    dot: 'bg-violet-500',
  },
};

const typeBadgeClasses: Record<Lesson['type'], string> = {
  "Ma'ruza": 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Amaliy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Seminar: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Laboratoriya: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const ScheduleExport = forwardRef<HTMLDivElement, ScheduleExportProps>(
  ({ lessons, shift, shiftLabel, times, weekRange, generatedAt }, ref) => {
    const getLesson = (day: Day, period: number): Lesson | null => {
      return (
        lessons.find(
          (lesson) => lesson.day === day && lesson.shift === shift && lesson.period === period
        ) || null
      );
    };

    const badge = shiftBadgeStyles[shift];

    return (
      <div
        ref={ref}
        className="w-[1200px] rounded-[32px] border border-[var(--glass-border)] bg-[var(--background-secondary)] p-8 text-[var(--foreground)] shadow-[0_24px_60px_rgba(15,23,42,0.15)]"
      >
        <div className="flex items-center justify-between gap-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Haftalik dars jadvali</h2>
              <p className="text-sm text-[var(--foreground-secondary)]">
                MrErgashev - {shiftLabel}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-secondary)]">
              Hafta
            </div>
            <div className="text-lg font-bold">
              {weekRange.start} - {weekRange.end}
            </div>
            <div
              className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              {shiftLabel}
            </div>
          </div>
        </div>

        <div
          className="schedule-grid"
          style={{
            gridTemplateColumns: '110px repeat(5, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          <div />
          {DAYS.map((day) => (
            <div
              key={day.value}
              className="text-center font-semibold text-sm py-3 px-2 rounded-xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
            >
              {day.label}
            </div>
          ))}

          {times.map((time) => (
            <React.Fragment key={`export-row-${time.period}`}>
              <div className="flex flex-col items-center justify-center py-2 px-3 rounded-xl bg-[var(--background)]/70 border border-[var(--glass-border)]">
                <span className="text-xs text-[var(--foreground-secondary)]">
                  {time.period}-para
                </span>
                <span className="text-sm font-semibold">{time.time}</span>
              </div>

              {DAYS.map((day) => {
                const lesson = getLesson(day.value, time.period);
                return (
                  <div key={`${day.value}-${time.period}`}>
                    {lesson ? (
                      <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--background-secondary)] p-3 min-h-[112px] shadow-sm">
                        <div className="text-sm font-semibold mb-2 line-clamp-2">
                          {lesson.subject}
                        </div>
                        <div className="space-y-1 text-xs text-[var(--foreground-secondary)]">
                          <div>
                            Xona:{' '}
                            <span className="font-medium text-[var(--foreground)]">
                              {lesson.room}
                            </span>
                          </div>
                          <div className="truncate">
                            O&apos;qituvchi:{' '}
                            <span className="font-medium text-[var(--foreground)]">
                              {lesson.teacher}
                            </span>
                          </div>
                          <div className="truncate">
                            Guruhlar:{' '}
                            <span className="font-medium text-[var(--foreground)]">
                              {lesson.groups.join(', ')}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium ${typeBadgeClasses[lesson.type]}`}
                        >
                          {lesson.type}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[var(--glass-border)] bg-[var(--background)]/50 p-3 min-h-[112px] flex items-center justify-center text-xs text-[var(--foreground-secondary)]">
                        Bo&apos;sh
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-5 text-xs text-[var(--foreground-secondary)] text-right">
          Yangilangan sana: {generatedAt}
        </div>
      </div>
    );
  }
);

ScheduleExport.displayName = 'ScheduleExport';

export default ScheduleExport;
