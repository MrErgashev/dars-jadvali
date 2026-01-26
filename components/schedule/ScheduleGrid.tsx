'use client';

import { useState, useEffect } from 'react';
import { Lesson, Day, Shift } from '@/lib/types';
import { DAYS, SHIFTS } from '@/lib/constants';
import ShiftSection from './ShiftSection';

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
  end.setDate(start.getDate() + 4); // Juma

  return {
    start: formatDateDDMMYYYY(start),
    end: formatDateDDMMYYYY(end),
  };
};

interface ScheduleGridProps {
  lessons: Lesson[];
  isLoading?: boolean;
  onUpdate?: () => void;
}

export default function ScheduleGrid({ lessons, isLoading, onUpdate }: ScheduleGridProps) {
  const [selectedDay, setSelectedDay] = useState<Day>('dushanba');
  const [todayDay, setTodayDay] = useState<Day | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift>('kunduzgi');
  const [now, setNow] = useState<Date>(() => new Date());

  // Bugungi kunni topish va tanlash
  useEffect(() => {
    const getTodayDay = (): Day | null => {
      const today = new Date().getDay();
      const dayMap: Record<number, Day> = {
        1: 'dushanba',
        2: 'seshanba',
        3: 'chorshanba',
        4: 'payshanba',
        5: 'juma',
      };
      return dayMap[today] ?? null;
    };

    const timeoutId = window.setTimeout(() => {
      const initialToday = getTodayDay();
      setNow(new Date());
      setTodayDay(initialToday);
      if (initialToday) setSelectedDay(initialToday);
    }, 0);

    // Kunni avtomatik yangilash (tungi 00:00 dan keyin)
    const intervalId = window.setInterval(() => {
      setNow(new Date());
      setTodayDay(getTodayDay());
    }, 60 * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
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
  const weekRange = getWeekRangeForSchedule(now);
  const leftShift = SHIFTS[0];
  const rightShifts = SHIFTS.slice(1);

  const renderShiftButton = (shiftData: (typeof SHIFTS)[number]) => (
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
  );

  return (
    <div className="space-y-3">
      {/* Bo'lim Tab tugmalari */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl p-1.5 rounded-2xl bg-[var(--background-secondary)] neo">
          {/* Desktop: Sana menyu qatorining markazida */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              {leftShift && renderShiftButton(leftShift)}
            </div>
            <div className="flex-1 flex items-center justify-center px-3 py-1 rounded-xl neo-inset">
              <span className="text-xl lg:text-2xl font-extrabold gradient-text tracking-wide">
                {weekRange.start}
              </span>
              <span className="text-lg lg:text-xl font-bold text-[var(--foreground-secondary)] mx-3">
                -
              </span>
              <span className="text-xl lg:text-2xl font-extrabold gradient-text tracking-wide">
                {weekRange.end}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-end gap-2">
              {rightShifts.map(renderShiftButton)}
            </div>
          </div>

          {/* Mobile: Menyular markazda */}
          <div className="flex sm:hidden items-center justify-center gap-2">
            {SHIFTS.map(renderShiftButton)}
          </div>
        </div>
      </div>

      {/* Vaqt ko'rsatkichi */}
      <div className="text-center">
        <span className={`text-sm font-medium ${shiftColors[selectedShift].text}`}>
          <span className="hidden sm:inline">
            {currentShiftData?.times.map((t) => t.time).join(' / ')}
          </span>
          <span className="sm:hidden text-base font-semibold gradient-text">
            {weekRange.start} - {weekRange.end}
          </span>
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
          todayDay={todayDay}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
