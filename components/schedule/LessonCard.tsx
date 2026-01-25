'use client';

import { useState } from 'react';
import { Lesson } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import EditLessonModal from './EditLessonModal';

interface LessonCardProps {
  lesson: Lesson | null;
  isEmpty?: boolean;
  onUpdate?: () => void;
}

export default function LessonCard({ lesson, isEmpty, onUpdate }: LessonCardProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = !!user;

  const handleClick = () => {
    if (isAdmin && lesson) {
      setIsModalOpen(true);
    }
  };

  const handleSuccess = () => {
    if (onUpdate) {
      onUpdate();
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
    <>
      <div
        onClick={handleClick}
        className={`
          lesson-card glass rounded-xl p-3 min-h-[100px]
          ${isAdmin ? 'cursor-pointer hover:ring-2 hover:ring-[var(--accent-primary)] hover:ring-offset-2 hover:ring-offset-transparent' : ''}
        `}
      >
        {/* Admin badge */}
        {isAdmin && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 text-[var(--accent-primary)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </div>
        )}

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
      </div>

      {/* Edit Modal */}
      {isAdmin && lesson && (
        <EditLessonModal
          lesson={lesson}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
