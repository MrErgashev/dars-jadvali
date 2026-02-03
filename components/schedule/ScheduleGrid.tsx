'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';
import { Lesson, Day, Shift } from '@/lib/types';
import { DAYS, SHIFTS } from '@/lib/constants';
import ShiftSection from './ShiftSection';
import ScheduleExport from './ScheduleExport';
import ScheduleExportAll from './ScheduleExportAll';
import { useWeek } from '@/context/WeekContext';
import { formatDateDDMMYYYY } from '@/lib/utils/week';

interface ScheduleGridProps {
  lessons: Lesson[];
  isLoading?: boolean;
  onUpdate?: () => void;
}

export default function ScheduleGrid({ lessons, isLoading, onUpdate }: ScheduleGridProps) {
  const [selectedDay, setSelectedDay] = useState<Day>('dushanba');
  const [todayDay, setTodayDay] = useState<Day | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift>('kunduzgi');
  const exportRef = useRef<HTMLDivElement | null>(null);
  const exportAllRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Tanlangan hafta oralig'i va navigatsiya (WeekContext'dan)
  const { weekRange, isCurrentWeek, goToPreviousWeek, goToNextWeek, goToCurrentWeek } = useWeek();

  const currentShiftData = useMemo(
    () => SHIFTS.find((shiftData) => shiftData.shift === selectedShift),
    [selectedShift]
  );
  // Export qilgan paytning sanasi
  const generatedAt = useMemo(() => formatDateDDMMYYYY(new Date()), []);

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
      setTodayDay(initialToday);
      if (initialToday) setSelectedDay(initialToday);
    }, 0);

    // Kunni avtomatik yangilash (tungi 00:00 dan keyin)
    const intervalId = window.setInterval(() => {
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
      <div className="space-y-4">
        {/* Shift tabs skeleton */}
        <div className="flex justify-center">
          <div className="skeleton h-12 w-64 sm:w-80 rounded-2xl" />
        </div>
        {/* Week nav skeleton (mobile) */}
        <div className="sm:hidden flex justify-center">
          <div className="skeleton h-11 w-48 rounded-xl" />
        </div>
        {/* Day selector skeleton (mobile) */}
        <div className="sm:hidden flex gap-2 overflow-hidden px-1">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="skeleton h-11 w-24 rounded-xl flex-shrink-0" />
          ))}
        </div>
        {/* Desktop grid skeleton */}
        <div className="hidden sm:grid grid-cols-6 gap-4">
          {[...Array(18)].map((_, j) => (
            <div key={j} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        {/* Mobile list skeleton */}
        <div className="sm:hidden space-y-3">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex gap-3">
              <div className="skeleton h-16 w-16 rounded-xl flex-shrink-0" />
              <div className="skeleton h-24 flex-1 rounded-xl" />
            </div>
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
      <div className="flex justify-center px-2 sm:px-0">
        <div className="inline-flex p-1.5 rounded-2xl bg-[var(--background-secondary)] neo max-w-full overflow-x-auto scrollbar-hide">
          {SHIFTS.map((shiftData) => (
            <button
              key={shiftData.shift}
              onClick={() => setSelectedShift(shiftData.shift)}
              className={`
                relative px-4 sm:px-6 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 active:scale-95
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

      {/* Vaqt ko'rsatkichi (Desktop) + Mobile hafta navigatsiya */}
      <div className="text-center">
        {/* Desktop: Vaqt slotlari */}
        <span className={`text-sm font-medium ${shiftColors[selectedShift].text} hidden sm:inline`}>
          {currentShiftData?.times.map((t) => t.time).join(' / ')}
        </span>

        {/* Mobile: Hafta navigatsiyasi */}
        <div className="sm:hidden flex items-center justify-center gap-3">
          <button
            onClick={goToPreviousWeek}
            className="neo-button p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:text-[var(--accent-primary)] active:scale-95 transition-transform"
            aria-label="Oldingi hafta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={goToCurrentWeek}
            disabled={isCurrentWeek}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl neo-inset text-sm font-semibold gradient-text transition-transform ${!isCurrentWeek ? 'active:scale-95' : ''}`}
          >
            {weekRange.start} - {weekRange.end}
            {!isCurrentWeek && <span className="ml-1.5 text-xs text-[var(--accent-primary)]">↻</span>}
          </button>
          <button
            onClick={goToNextWeek}
            className="neo-button p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--foreground)] hover:text-[var(--accent-primary)] active:scale-95 transition-transform"
            aria-label="Keyingi hafta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile: Kun tanlash */}
      <div className="mobile-day-selector mb-2 px-1">
        {DAYS.map((day) => (
          <button
            key={day.value}
            onClick={() => setSelectedDay(day.value)}
            className={`
              flex-shrink-0 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all active:scale-95
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
      {/* [MO-03] key forces remount on shift/day change for animation re-trigger */}
      {currentShiftData && (
        <ShiftSection
          key={`${currentShiftData.shift}-${selectedDay}`}
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
