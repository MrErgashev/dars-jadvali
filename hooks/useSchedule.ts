'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/lib/types';
import { subscribeLessons, getAllLessons } from '@/lib/firebase/db';

export function useSchedule() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Real-time listener
    const unsubscribe = subscribeLessons((newLessons) => {
      setLessons(newLessons);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Manual refresh
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAllLessons();
      setLessons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return { lessons, loading, error, refresh };
}
