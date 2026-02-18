'use client';

import { useState, useEffect } from 'react';
import { Lesson, Day, Shift, LessonType } from '@/lib/types';
import { DAYS, SHIFTS, LESSON_TYPES } from '@/lib/constants';
import { saveLesson, deleteLessonByTime } from '@/lib/firebase/db';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface ManualFormProps {
  editingLesson: Lesson | null;
  onSuccess: () => void;
  weekStartISO: string;
}

export default function ManualForm({ editingLesson, onSuccess, weekStartISO }: ManualFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [day, setDay] = useState<Day>('dushanba');
  const [shift, setShift] = useState<Shift>('kunduzgi');
  const [period, setPeriod] = useState<number>(1);
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [groups, setGroups] = useState('');
  const [type, setType] = useState<LessonType>("Ma'ruza");

  // Edit mode: formni to'ldirish
  useEffect(() => {
    if (editingLesson) {
      setDay(editingLesson.day);
      setShift(editingLesson.shift);
      setPeriod(editingLesson.period);
      setSubject(editingLesson.subject);
      setRoom(editingLesson.room);
      setTeacher(editingLesson.teacher);
      setGroups(editingLesson.groups.join(', '));
      setType(editingLesson.type);
    }
  }, [editingLesson]);

  // Tanlangan shift uchun para raqamlarini olish
  const getPeriodsForShift = (selectedShift: Shift) => {
    const shiftData = SHIFTS.find((s) => s.shift === selectedShift);
    return shiftData?.times.map((t) => ({
      value: t.period.toString(),
      label: `${t.period}-para (${t.time})`,
    })) || [];
  };

  const resetForm = () => {
    setDay('dushanba');
    setShift('kunduzgi');
    setPeriod(1);
    setSubject('');
    setRoom('');
    setTeacher('');
    setGroups('');
    setType("Ma'ruza");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Guruhlarni array'ga aylantirish
      const groupsArray = groups
        .split(/[,\s]+/)
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      if (groupsArray.length === 0) {
        throw new Error("Kamida bitta guruh kiriting");
      }

      await saveLesson({
        day,
        shift,
        period,
        subject,
        room,
        teacher,
        groups: groupsArray,
        type,
        weekStart: weekStartISO,
      });

      setSuccess("Dars muvaffaqiyatli saqlandi!");
      resetForm();
      onSuccess();

      // 3 soniyadan keyin success xabarini o'chirish
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingLesson) return;

    if (!confirm("Bu darsni o'chirishni xohlaysizmi?")) return;

    setLoading(true);
    setError(null);

    try {
      await deleteLessonByTime(editingLesson.day, editingLesson.shift, editingLesson.period);
      setSuccess("Dars o'chirildi!");
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "O'chirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Barcha kunlarga qo'llash
  const handleApplyToAllDays = async () => {
    if (!confirm("Bu dars Dushanba-Juma orasidagi barcha kunlarga saqlanadi. Davom etasizmi?")) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const groupsArray = groups
        .split(/[,\s]+/)
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      if (groupsArray.length === 0) {
        throw new Error("Kamida bitta guruh kiriting");
      }

      // Barcha kunlar uchun saqlash
      const allDays: Day[] = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma'];

      for (const d of allDays) {
        await saveLesson({
          day: d,
          shift,
          period,
          subject,
          room,
          teacher,
          groups: groupsArray,
          type,
          weekStart: weekStartISO,
        });
      }

      setSuccess("Dars 5 kunga muvaffaqiyatli saqlandi!");
      resetForm();
      onSuccess();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
        {editingLesson ? "Darsni tahrirlash" : "Yangi dars qo'shish"}
      </h2>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Kun va Bo'lim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Kun"
            value={day}
            onChange={(e) => setDay(e.target.value as Day)}
            options={DAYS.map((d) => ({ value: d.value, label: d.label }))}
          />

          <Select
            label="Bo'lim"
            value={shift}
            onChange={(e) => {
              setShift(e.target.value as Shift);
              setPeriod(1); // Reset period when shift changes
            }}
            options={SHIFTS.map((s) => ({ value: s.shift, label: s.label }))}
          />
        </div>

        {/* Para va Turi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Para"
            value={period.toString()}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            options={getPeriodsForShift(shift)}
          />

          <Select
            label="Dars turi"
            value={type}
            onChange={(e) => setType(e.target.value as LessonType)}
            options={LESSON_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        {/* Fan nomi */}
        <Input
          label="Fan nomi"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Masalan: Mediasavodxonlik"
          required
        />

        {/* Xona */}
        <Input
          label="Xona"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Masalan: JM403"
          required
        />

        {/* O'qituvchi */}
        <Input
          label="O'qituvchi"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          placeholder="Masalan: A. Karimov"
          required
        />

        {/* Guruhlar */}
        <Input
          label="Guruhlar (vergul bilan ajrating)"
          value={groups}
          onChange={(e) => setGroups(e.target.value)}
          placeholder="Masalan: JM403, JM405"
          required
        />

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          {editingLesson && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              O'chirish
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={loading}
          >
            Tozalash
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            isLoading={loading}
          >
            {editingLesson ? 'Yangilash' : 'Saqlash'}
          </Button>
        </div>

        {/* Barcha kunlarga qo'llash */}
        <div className="pt-2 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={loading || !subject || !room || !teacher || !groups}
            onClick={handleApplyToAllDays}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            Barcha kunlarga qo'llash (Dush-Juma)
          </Button>
          <p className="text-xs text-[var(--foreground-secondary)] mt-2 text-center">
            Bu darsni 5 kunga bir vaqtda saqlaydi
          </p>
        </div>
      </form>
    </div>
  );
}
