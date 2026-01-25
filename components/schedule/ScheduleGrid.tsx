'use client';

import { useState, useEffect } from 'react';
import { Lesson, Day, Shift } from '@/lib/types';
import { DAYS, SHIFTS } from '@/lib/constants';
import ShiftSection from './ShiftSection';

interface ScheduleGridProps {
  lessons: Lesson[];
  isLoading?: boolean;
}

export default function ScheduleGrid({ lessons, isLoading }: ScheduleGridProps) {
  const [selectedDay, setSelectedDay] = useState<Day>('dushanba');
  const [selectedShift, setSelectedShift] = useState<Shift>('kunduzgi');

  // Bugungi kunni topish va tanlash
  useEffect(() => {
    const today = new Date().getDay();
    const dayMap: Record<number, Day> = {
      1: 'dushanba',
      2: 'seshanba',
      3: 'chorshanba',
      4: 'payshanba',
      5: 'juma',
    };
    if (dayMap[today]) {
      setSelectedDay(dayMap[today]);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(18)].map((_, j) => (
            <div key={j} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Shift ranglari
  const shiftColors: Record<Shift, { bg: string; text: string; border: string; glow: string }> = {
    kunduzgi: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
    },
    sirtqi: {
      bg: 'from-amber-500/20 to-amber-600/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/20',
    },
    kechki: {
      bg: 'from-violet-500/20 to-violet-600/10',
      text: 'text-violet-400',
      border: 'border-violet-500/30',
      glow: 'shadow-violet-500/20',
    },
  };

  const currentShiftData = SHIFTS.find((s) => s.shift === selectedShift);

  return (
    <div className="space-y-3">
      {/* Bo'lim Tab tugmalari */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[var(--background-secondary)] neo">
          {SHIFTS.map((shiftData) => (
            <button
              key={shiftData.shift}
              onClick={() => setSelectedShift(shiftData.shift)}
              className={`
                relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  selectedShift === shiftData.shift
                    ? `bg-gradient-to-r ${shiftColors[shiftData.shift].bg} ${shiftColors[shiftData.shift].text} ${shiftColors[shiftData.shift].border} border shadow-lg ${shiftColors[shiftData.shift].glow}`
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }
              `}
            >
              <span className="relative z-10">{shiftData.label}</span>
              {selectedShift === shiftData.shift && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vaqt ko'rsatkichi */}
      <div className="text-center">
        <span className={`text-sm font-medium ${shiftColors[selectedShift].text}`}>
          {currentShiftData?.times.map((t) => t.time).join(' / ')}
        </span>
      </div>

      {/* Mobile: Kun tanlash */}
      <div className="mobile-day-selector mb-2">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => setSelectedDay(day.value)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                selectedDay === day.value
                  ? 'gradient-primary text-white shadow-lg'
                  : 'neo-button text-[var(--foreground)]'
              }
            `}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Tanlangan bo'lim jadvali */}
      {currentShiftData && (
        <ShiftSection
          shift={currentShiftData.shift}
          label={currentShiftData.label}
          times={currentShiftData.times}
          lessons={lessons}
          selectedDay={selectedDay}
        />
      )}
    </div>
  );
}
