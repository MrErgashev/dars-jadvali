'use client';

import { useState } from 'react';
import { Lesson, Day, Shift, LessonType } from '@/lib/types';
import { DAYS, SHIFTS, LESSON_TYPES } from '@/lib/constants';
import { saveLesson, deleteLesson } from '@/lib/firebase/db';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface EditLessonModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditLessonModal({
  lesson,
  isOpen,
  onClose,
  onSuccess,
}: EditLessonModalProps) {
  const [day, setDay] = useState<Day>(lesson.day);
  const [shift, setShift] = useState<Shift>(lesson.shift);
  const [period, setPeriod] = useState(lesson.period);
  const [subject, setSubject] = useState(lesson.subject);
  const [room, setRoom] = useState(lesson.room);
  const [teacher, setTeacher] = useState(lesson.teacher);
  const [groups, setGroups] = useState(lesson.groups.join(', '));
  const [type, setType] = useState<LessonType>(lesson.type);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentShift = SHIFTS.find((s) => s.shift === shift);
  const periodOptions = currentShift?.times.map((t) => ({
    value: t.period.toString(),
    label: `${t.period}-para (${t.time})`,
  })) || [];

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const groupsArray = groups
        .split(/[,\s]+/)
        .map((g) => g.trim())
        .filter((g) => g.length > 0);

      if (groupsArray.length === 0) {
        throw new Error("Kamida bitta guruh kiriting");
      }

      await saveLesson({
        id: lesson.id,
        day,
        shift,
        period,
        subject,
        room,
        teacher,
        groups: groupsArray,
        type,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu darsni o'chirishni xohlaysizmi?")) return;

    setLoading(true);
    setError(null);

    try {
      if (lesson.id) {
        await deleteLesson(lesson.id);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "O'chirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Darsni tahrirlash">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Kun va Bo'lim */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Kun"
            value={day}
            onChange={(e) => setDay(e.target.value as Day)}
            options={DAYS.map((d) => ({ value: d.value, label: d.label }))}
          />
          <Select
            label="Bo'lim"
            value={shift}
            onChange={(e) => setShift(e.target.value as Shift)}
            options={SHIFTS.map((s) => ({ value: s.shift, label: s.label }))}
          />
        </div>

        {/* Para va Turi */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Para"
            value={period.toString()}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            options={periodOptions}
          />
          <Select
            label="Turi"
            value={type}
            onChange={(e) => setType(e.target.value as LessonType)}
            options={LESSON_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>

        {/* Fan */}
        <Input
          label="Fan nomi"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Masalan: Matematika"
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

        {/* Tugmalar */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            className="flex-shrink-0"
          >
            O'chirish
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Bekor
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            isLoading={loading}
            className="flex-1"
          >
            Saqlash
          </Button>
        </div>
      </div>
    </Modal>
  );
}
