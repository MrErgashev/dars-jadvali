'use client';

import React from 'react';
import { Lesson, Day, Shift, TimeSlot } from '@/lib/types';
import { DAYS } from '@/lib/constants';
import LessonCard from './LessonCard';

interface ShiftSectionProps {
  shift: Shift;
  label: string;
  times: TimeSlot[];
  lessons: Lesson[];
  selectedDay?: Day; // Mobile uchun
  todayDay?: Day | null; // Bugungi kun highlight uchun
  onUpdate?: () => void; // Admin edit uchun
}

export default function ShiftSection({
  shift,
  label,
  times,
  lessons,
  selectedDay,
  todayDay,
  onUpdate,
}: ShiftSectionProps) {
  // Aniq kun va vaqt uchun darsni topish
  const getLesson = (day: Day, period: number): Lesson | null => {
    return (
      lessons.find(
        (l) => l.day === day && l.shift === shift && l.period === period
      ) || null
    );
  };

  // Shift uchun rang
  const shiftColors = {
    kunduzgi: 'var(--shift-kunduzgi)',
    sirtqi: 'var(--shift-sirtqi)',
    kechki: 'var(--shift-kechki)',
  };

  return (
    <div className={`shift-${shift} mb-6`}>
      {/* Bo'lim sarlavhasi */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-8 rounded-full"
          style={{ backgroundColor: shiftColors[shift] }}
        />
        <h3
          className="text-lg font-bold"
          style={{ color: shiftColors[shift] }}
        >
          {label}
        </h3>
      </div>

      {/* Desktop: Grid ko'rinish */}
      <div className="hidden sm:block">
        <div className="schedule-grid">
          {/* Bo'sh cell (header uchun) */}
          <div />

          {/* Kun headerlari */}
          {DAYS.map((day, index) => (
            <div
              key={day.value}
              className={`
                text-center font-bold text-sm py-3 px-2 rounded-xl
                bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/10
                border border-[var(--accent-primary)]/20
                text-[var(--accent-primary)]
                shadow-sm
                ${todayDay === day.value ? 'animate-pulse-glow' : ''}
              `}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {day.label}
            </div>
          ))}

          {/* Har bir para uchun row */}
          {times.map((time) => (
            <React.Fragment key={`row-${time.period}`}>
              {/* Vaqt cell */}
              <div className="flex flex-col items-center justify-center py-2 px-3">
                <span className="text-xs text-[var(--foreground-secondary)]">
                  {time.period}-para
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {time.time}
                </span>
              </div>

              {/* Har bir kun uchun dars */}
              {DAYS.map((day) => (
                <div key={`${day.value}-${time.period}`}>
                  <LessonCard lesson={getLesson(day.value, time.period)} onUpdate={onUpdate} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile: Tanlangan kun bo'yicha */}
      <div className="sm:hidden space-y-3">
        {times.map((time) => {
          const lesson = selectedDay
            ? getLesson(selectedDay, time.period)
            : null;
          return (
            <div key={time.period} className="flex gap-3">
              {/* Vaqt */}
              <div className="flex flex-col items-center justify-center min-w-[60px]">
                <span className="text-xs text-[var(--foreground-secondary)]">
                  {time.period}-para
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {time.time}
                </span>
              </div>
              {/* Dars kartochkasi */}
              <div className="flex-1">
                <LessonCard lesson={lesson} isEmpty={!selectedDay} onUpdate={onUpdate} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
