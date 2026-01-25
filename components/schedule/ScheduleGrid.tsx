'use client';

import { useState, useEffect } from 'react';
import { Lesson, Day } from '@/lib/types';
import { DAYS, SHIFTS } from '@/lib/constants';
import ShiftSection from './ShiftSection';

interface ScheduleGridProps {
  lessons: Lesson[];
  isLoading?: boolean;
}

export default function ScheduleGrid({ lessons, isLoading }: ScheduleGridProps) {
  const [selectedDay, setSelectedDay] = useState<Day>('dushanba');

  // Bugungi kunni topish va tanlash
  useEffect(() => {
    const today = new Date().getDay();
    // 0 = Yakshanba, 1 = Dushanba, ...
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
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="skeleton h-8 w-32 rounded-lg" />
            <div className="grid grid-cols-6 gap-4">
              {[...Array(18)].map((_, j) => (
                <div key={j} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: Kun tanlash */}
      <div className="mobile-day-selector mb-4">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => setSelectedDay(day.value)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                selectedDay === day.value
                  ? 'gradient-primary text-white'
                  : 'neo-button text-[var(--foreground)]'
              }
            `}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Jadval bo'limlari */}
      <div className="space-y-8">
        {SHIFTS.map((shiftData) => (
          <ShiftSection
            key={shiftData.shift}
            shift={shiftData.shift}
            label={shiftData.label}
            times={shiftData.times}
            lessons={lessons}
            selectedDay={selectedDay}
          />
        ))}
      </div>
    </div>
  );
}
