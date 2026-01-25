'use client';

import { useEffect, useState } from 'react';
import { Lesson } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { LESSON_TYPES } from '@/lib/constants';
import { deleteLesson, saveLesson } from '@/lib/firebase/db';
import Button from '@/components/ui/Button';

interface LessonCardProps {
  lesson: Lesson | null;
  isEmpty?: boolean;
  onUpdate?: () => void;
}

export default function LessonCard({ lesson, isEmpty, onUpdate }: LessonCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [groups, setGroups] = useState('');
  const [type, setType] = useState<Lesson['type']>('Ma\'ruza');
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = !!user;

  useEffect(() => {
    if (!lesson || isEditing) return;
    setSubject(lesson.subject);
    setRoom(lesson.room);
    setTeacher(lesson.teacher);
    setGroups(lesson.groups.join(', '));
    setType(lesson.type);
  }, [lesson?.id, lesson, isEditing]);

  const handleSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const resetDraft = () => {
    if (!lesson) return;
    setSubject(lesson.subject);
    setRoom(lesson.room);
    setTeacher(lesson.teacher);
    setGroups(lesson.groups.join(', '));
    setType(lesson.type);
    setError(null);
    setDeleteArmed(false);
  };

  const handleSave = async () => {
    if (!lesson?.id) return;
    setLoading(true);
    setError(null);
    setDeleteArmed(false);

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
        day: lesson.day,
        shift: lesson.shift,
        period: lesson.period,
        subject,
        room,
        teacher,
        groups: groupsArray,
        type,
      });

      handleSuccess();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson?.id) return;
    setDeleteArmed(false);
    setLoading(true);
    setError(null);

    try {
      await deleteLesson(lesson.id);
      handleSuccess();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "O'chirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (isEmpty || !lesson) {
    return (
      <div className="glass-subtle rounded-xl p-3 min-h-[100px] flex items-center justify-center">
        <span className="text-[var(--foreground-secondary)] text-sm">Bo'sh</span>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (!isAdmin || isEditing) return;
        setIsEditing(true);
        setError(null);
        setDeleteArmed(false);
      }}
      className={`
        lesson-card glass rounded-xl p-3 min-h-[100px] relative
        ${isAdmin && !isEditing ? 'cursor-pointer hover:ring-2 hover:ring-[var(--accent-primary)] hover:ring-offset-2 hover:ring-offset-transparent' : ''}
      `}
    >
      {error && (
        <div className="mb-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2">
          <input
            className="input-glass w-full px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Fan nomi"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input-glass w-full px-3 py-2 text-xs"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Xona"
              onClick={(e) => e.stopPropagation()}
            />
            <input
              className="input-glass w-full px-3 py-2 text-xs"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="O'qituvchi"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <input
            className="input-glass w-full px-3 py-2 text-xs"
            value={groups}
            onChange={(e) => setGroups(e.target.value)}
            placeholder="Guruhlar (JM403, JM405)"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex flex-wrap gap-1">
            {LESSON_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setType(t);
                }}
                className={`
                  px-2 py-1 rounded-full text-[11px] font-medium transition-all
                  ${type === t ? 'gradient-primary text-white' : 'neo-button text-[var(--foreground)]'}
                `}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                if (!deleteArmed) {
                  setDeleteArmed(true);
                  return;
                }
                void handleDelete();
              }}
              disabled={loading}
              className="flex-shrink-0"
            >
              {deleteArmed ? "Tasdiqlash" : "O'chirish"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                resetDraft();
                setIsEditing(false);
              }}
              disabled={loading}
              className="flex-1"
            >
              Bekor
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                void handleSave();
              }}
              isLoading={loading}
              disabled={loading}
              className="flex-1"
            >
              Saqlash
            </Button>
          </div>
        </div>
      ) : (
        <>

        {/* Fan nomi */}
        <h4 className="font-semibold text-[var(--foreground)] text-sm mb-2 line-clamp-2">
          {lesson.subject}
        </h4>

        {/* Xona */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <span>{lesson.room}</span>
        </div>

        {/* O'qituvchi */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span className="truncate">{lesson.teacher}</span>
        </div>

        {/* Guruhlar */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
            />
          </svg>
          <span className="truncate">{lesson.groups.join(', ')}</span>
        </div>

        {/* Turi */}
        <span
          className={`
            inline-block px-2 py-0.5 rounded-full text-xs font-medium
            ${lesson.type === "Ma'ruza" ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}
            ${lesson.type === 'Amaliy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
            ${lesson.type === 'Seminar' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}
            ${lesson.type === 'Laboratoriya' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
          `}
        >
          {lesson.type}
        </span>
        </>
      )}
    </div>
  );
}
