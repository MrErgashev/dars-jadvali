'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  getCurrentWeekStart,
  getPreviousWeekStart,
  getNextWeekStart,
  getWeekRangeFormatted,
  formatDateISO,
  parseISODate,
  getWeekStartForDate,
  isSameWeek,
} from '@/lib/utils/week';

interface WeekContextValue {
  /** Tanlangan hafta boshlanishi (Date) */
  weekStart: Date;
  /** Tanlangan hafta oralig'i (DD.MM.YYYY format) */
  weekRange: { start: string; end: string };
  /** Tanlangan hafta boshlanishi (YYYY-MM-DD format) */
  weekStartISO: string;
  /** Hozirgi haftami? */
  isCurrentWeek: boolean;
  /** Oldingi haftaga o'tish */
  goToPreviousWeek: () => void;
  /** Keyingi haftaga o'tish */
  goToNextWeek: () => void;
  /** Hozirgi haftaga qaytish */
  goToCurrentWeek: () => void;
  /** Aniq haftaga o'tish */
  goToWeek: (date: Date) => void;
}

const WeekContext = createContext<WeekContextValue | null>(null);

interface WeekProviderProps {
  children: ReactNode;
}

/**
 * URL query param'dan boshlang'ich haftani olish (client-side only)
 */
function getInitialWeekStart(): Date {
  if (typeof window === 'undefined') {
    return getCurrentWeekStart();
  }

  const params = new URLSearchParams(window.location.search);
  const weekParam = params.get('week');

  if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
    const parsed = parseISODate(weekParam);
    return getWeekStartForDate(parsed);
  }

  return getCurrentWeekStart();
}

export function WeekProvider({ children }: WeekProviderProps) {
  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart);

  // URL'ni yangilash (weekStart o'zgarganda)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentWeek = getCurrentWeekStart();
    const url = new URL(window.location.href);

    if (isSameWeek(weekStart, currentWeek)) {
      url.searchParams.delete('week');
    } else {
      url.searchParams.set('week', formatDateISO(weekStart));
    }

    window.history.replaceState({}, '', url.toString());
  }, [weekStart]);

  const weekRange = getWeekRangeFormatted(weekStart);
  const weekStartISO = formatDateISO(weekStart);
  const isCurrentWeek = isSameWeek(weekStart, getCurrentWeekStart());

  const goToPreviousWeek = useCallback(() => {
    setWeekStart((prev) => getPreviousWeekStart(prev));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => getNextWeekStart(prev));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekStart(getCurrentWeekStart());
  }, []);

  const goToWeek = useCallback((date: Date) => {
    setWeekStart(getWeekStartForDate(date));
  }, []);

  const value: WeekContextValue = {
    weekStart,
    weekRange,
    weekStartISO,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    goToWeek,
  };

  return <WeekContext.Provider value={value}>{children}</WeekContext.Provider>;
}

export function useWeek(): WeekContextValue {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error('useWeek must be used within a WeekProvider');
  }
  return context;
}
