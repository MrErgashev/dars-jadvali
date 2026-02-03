'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { copyLessonsToWeek } from '@/lib/firebase/db';
import {
  getCurrentWeekStart,
  formatDateISO,
  formatDateDDMMYYYY,
  getWeekRange,
  getPreviousWeekStart,
  getNextWeekStart,
} from '@/lib/utils/week';

interface WeekCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Hafta variantlarini generatsiya qilish (o'tgan 4 hafta + hozirgi + kelgusi 4 hafta)
function generateWeekOptions() {
  const options: { value: string; label: string; isCurrent: boolean; isLegacy?: boolean }[] = [];
  const currentWeek = getCurrentWeekStart();

  // Legacy (weekStart yo'q) - hozirgi hafta deb ko'rsatiladi
  const currentRange = getWeekRange(currentWeek);
  options.push({
    value: 'legacy',
    label: `${formatDateDDMMYYYY(currentRange.start)} - ${formatDateDDMMYYYY(currentRange.end)} (mavjud)`,
    isCurrent: false,
    isLegacy: true,
  });

  // O'tgan 4 hafta
  let week = currentWeek;
  for (let i = 0; i < 4; i++) {
    week = getPreviousWeekStart(week);
    const range = getWeekRange(week);
    options.unshift({
      value: formatDateISO(week),
      label: `${formatDateDDMMYYYY(range.start)} - ${formatDateDDMMYYYY(range.end)}`,
      isCurrent: false,
    });
  }

  // Hozirgi hafta
  options.push({
    value: formatDateISO(currentWeek),
    label: `${formatDateDDMMYYYY(currentRange.start)} - ${formatDateDDMMYYYY(currentRange.end)} (hozirgi)`,
    isCurrent: true,
  });

  // Kelgusi 4 hafta
  week = currentWeek;
  for (let i = 0; i < 4; i++) {
    week = getNextWeekStart(week);
    const range = getWeekRange(week);
    options.push({
      value: formatDateISO(week),
      label: `${formatDateDDMMYYYY(range.start)} - ${formatDateDDMMYYYY(range.end)}`,
      isCurrent: false,
    });
  }

  return options;
}

export default function WeekCopyModal({ isOpen, onClose, onSuccess }: WeekCopyModalProps) {
  const [sourceWeek, setSourceWeek] = useState<string>('legacy');
  const [targetWeek, setTargetWeek] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ copied: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekOptions = generateWeekOptions();

  const handleCopy = async () => {
    if (!targetWeek) {
      setError('Maqsad haftasini tanlang');
      return;
    }

    if (sourceWeek === targetWeek) {
      setError('Manba va maqsad haftasi bir xil bo\'lmasligi kerak');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const sourceValue = sourceWeek === 'legacy' ? null : sourceWeek;
      const copyResult = await copyLessonsToWeek(sourceValue, targetWeek);
      setResult(copyResult);

      if (copyResult.copied > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSourceWeek('legacy');
    setTargetWeek('');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Haftani ko'chirish">
      <div className="space-y-4">
        {/* Izoh */}
        <p className="text-sm text-[var(--foreground-secondary)]">
          Bir haftaning barcha darslarini boshqa haftaga ko&apos;chiring. Mavjud darslar o&apos;zgartirilmaydi.
        </p>

        {/* Manba hafta */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Qayerdan (manba hafta)
          </label>
          <select
            value={sourceWeek}
            onChange={(e) => setSourceWeek(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl neo-inset bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
            disabled={isLoading}
          >
            {weekOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Maqsad hafta */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Qayerga (maqsad hafta)
          </label>
          <select
            value={targetWeek}
            onChange={(e) => setTargetWeek(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl neo-inset bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
            disabled={isLoading}
          >
            <option value="">Tanlang...</option>
            {weekOptions
              .filter((opt) => !opt.isLegacy) // Legacy'ga ko'chirish mumkin emas
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>

        {/* Xatolik */}
        {error && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Natija */}
        {result && (
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
            <strong>{result.copied}</strong> ta dars ko&apos;chirildi
            {result.skipped > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                , <strong>{result.skipped}</strong> ta o&apos;tkazib yuborildi (mavjud)
              </span>
            )}
          </div>
        )}

        {/* Tugmalar */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Yopish
          </Button>
          <Button
            variant="primary"
            onClick={handleCopy}
            disabled={isLoading || !targetWeek}
            className="flex-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ko&apos;chirilmoqda...
              </span>
            ) : (
              "Ko'chirish"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
