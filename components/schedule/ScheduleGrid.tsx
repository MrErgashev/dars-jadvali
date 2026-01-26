'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';
import { Lesson, Day, Shift } from '@/lib/types';
import { DAYS, SHIFTS } from '@/lib/constants';
import ShiftSection from './ShiftSection';
import ScheduleExport from './ScheduleExport';
import ScheduleExportAll from './ScheduleExportAll';

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
  const exportRef = useRef<HTMLDivElement | null>(null);
  const exportAllRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const currentShiftData = useMemo(
    () => SHIFTS.find((shiftData) => shiftData.shift === selectedShift),
    [selectedShift]
  );
  const weekRange = useMemo(() => getWeekRangeForSchedule(now), [now]);
  const generatedAt = useMemo(() => formatDateDDMMYYYY(now), [now]);

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

  type DownloadFormat = 'pdf' | 'jpeg';
  type DownloadScope = 'current' | 'all';

  const handleDownload = useCallback(
    async (format: DownloadFormat, scope: DownloadScope = 'current') => {
      if (isExporting) return;
      const targetRef = scope === 'all' ? exportAllRef.current : exportRef.current;
      if (!targetRef) {
        window.alert("Jadval hali yuklanmoqda. Iltimos, biroz kuting.");
        return;
      }

      const createFileName = (extension: DownloadFormat) => {
        const shiftLabel = currentShiftData?.label ?? 'jadval';
        const safeShift =
          scope === 'all' ? 'barchasi' : shiftLabel.toLowerCase().replace(/\s+/g, '-');
        const start = weekRange.start.replace(/\./g, '-');
        const end = weekRange.end.replace(/\./g, '-');
        return `dars-jadvali-${safeShift}-${start}-${end}.${extension}`;
      };

      const downloadDataUrl = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      setIsExporting(true);
      window.dispatchEvent(new CustomEvent('schedule-download-start'));

      let success = false;

      try {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const node = targetRef;
        const backgroundColor = window.getComputedStyle(node).backgroundColor || '#ffffff';
        const canvas = await toCanvas(node, {
          backgroundColor,
          pixelRatio: 3,
          cacheBust: true,
        });

        if (format === 'jpeg') {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
          downloadDataUrl(dataUrl, createFileName('jpeg'));
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(createFileName('pdf'));
        }

        success = true;
      } catch (error) {
        console.error('Schedule export failed', error);
        window.alert("Yuklab olishda xatolik yuz berdi.");
      } finally {
        setIsExporting(false);
        window.dispatchEvent(
          new CustomEvent('schedule-download-end', { detail: { success } })
        );
      }
    },
    [currentShiftData?.label, isExporting, weekRange.end, weekRange.start]
  );

  useEffect(() => {
    const handleRequest = (event: Event) => {
      const detail = (event as CustomEvent<{ format?: DownloadFormat; scope?: DownloadScope }>)
        .detail;
      if (!detail?.format) return;
      void handleDownload(detail.format, detail.scope ?? 'current');
    };

    window.addEventListener('schedule-download', handleRequest as EventListener);

    return () => {
      window.removeEventListener('schedule-download', handleRequest as EventListener);
    };
  }, [handleDownload]);

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

      {currentShiftData && (
        <div className="fixed left-[-10000px] top-0">
          <ScheduleExport
            ref={exportRef}
            lessons={lessons}
            shift={currentShiftData.shift}
            shiftLabel={currentShiftData.label}
            times={currentShiftData.times}
            weekRange={weekRange}
            generatedAt={generatedAt}
          />
          <ScheduleExportAll
            ref={exportAllRef}
            lessons={lessons}
            weekRange={weekRange}
            generatedAt={generatedAt}
          />
        </div>
      )}
    </div>
  );
}
