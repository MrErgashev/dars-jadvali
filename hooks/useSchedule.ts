'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lesson } from '@/lib/types';
import { subscribeLessons, getAllLessons } from '@/lib/firebase/db';
import { formatDateISO, getCurrentWeekStart } from '@/lib/utils/week';

interface UseScheduleOptions {
  /** Tanlangan hafta boshlanishi (YYYY-MM-DD format) */
  weekStartISO?: string;
}

export function useSchedule(options: UseScheduleOptions = {}) {
  const { weekStartISO } = options;
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Real-time listener
    const unsubscribe = subscribeLessons((newLessons) => {
      setAllLessons(newLessons);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Hafta bo'yicha filter (client-side)
  // Agar lesson.weekStart yo'q bo'lsa - "hozirgi hafta" deb qabul qilinadi (backward compatibility)
  const lessons = useMemo(() => {
    if (!weekStartISO) {
      // Agar weekStartISO berilmagan bo'lsa, barcha lessons qaytariladi
      return allLessons;
    }

    const currentWeekISO = formatDateISO(getCurrentWeekStart());

    return allLessons.filter((lesson) => {
      if (!lesson.weekStart) {
        // Legacy data: weekStart yo'q bo'lsa, hozirgi haftaga tegishli deb hisoblaymiz
        return weekStartISO === currentWeekISO;
      }
      // weekStart mavjud - to'g'ridan-to'g'ri solishtirish
      return lesson.weekStart === weekStartISO;
    });
  }, [allLessons, weekStartISO]);

  // Manual refresh
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAllLessons();
      setAllLessons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return { lessons, loading, error, refresh };
}
