'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWeek } from '@/context/WeekContext';
import { useSchedule } from '@/hooks/useSchedule';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ManualForm from '@/components/admin/ManualForm';
import VoiceInput from '@/components/admin/VoiceInput';
import WeekCopyModal from '@/components/admin/WeekCopyModal';
import { Lesson } from '@/lib/types';

type EditMode = 'manual' | 'voice';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { weekStartISO } = useWeek();
  const { lessons, loading: lessonsLoading, refresh } = useSchedule({ weekStartISO });

  const [editMode, setEditMode] = useState<EditMode>('manual');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isWeekCopyOpen, setIsWeekCopyOpen] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setEditMode('manual');
  };

  const handleNewLesson = () => {
    setEditingLesson(null);
  };

  // Loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--accent-primary)] border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Admin Panel</h1>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  Dars jadvalini boshqarish
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Haftani ko'chirish tugmasi */}
              <button
                onClick={() => setIsWeekCopyOpen(true)}
                className="neo-button p-3 text-[var(--foreground)] hover:text-[var(--accent-primary)]"
                title="Haftani ko'chirish"
              >
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
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                  />
                </svg>
              </button>

              <Link
                href="/"
                className="neo-button p-3 text-[var(--foreground)] hover:text-[var(--accent-primary)]"
                title="Bosh sahifa"
              >
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
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </Link>

              <ThemeToggle />

              <button
                onClick={handleLogout}
                className="neo-button p-3 text-[var(--foreground)] hover:text-red-500"
                title="Chiqish"
              >
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
                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol panel: Tahrirlash */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode tanlash */}
            <Card variant="glass" className="p-4">
              <div className="flex gap-2">
                <Button
                  variant={editMode === 'manual' ? 'primary' : 'secondary'}
                  onClick={() => setEditMode('manual')}
                  className="flex-1"
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
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  Qo'lda
                </Button>
                <Button
                  variant={editMode === 'voice' ? 'primary' : 'secondary'}
                  onClick={() => setEditMode('voice')}
                  className="flex-1"
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
                      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                    />
                  </svg>
                  Ovozda
                </Button>
              </div>
            </Card>

            {/* Form */}
            <Card variant="glass" className="p-6">
              {editMode === 'manual' ? (
                <ManualForm
                  editingLesson={editingLesson}
                  onSuccess={handleNewLesson}
                  weekStartISO={weekStartISO}
                />
              ) : (
                <VoiceInput onSuccess={handleNewLesson} weekStartISO={weekStartISO} />
              )}
            </Card>
          </div>

          {/* O'ng panel: Mavjud darslar ro'yxati */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Mavjud darslar ({lessons.length})
            </h2>

            {lessonsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : lessons.length === 0 ? (
              <Card variant="flat" className="p-6 text-center">
                <p className="text-[var(--foreground-secondary)]">
                  Hali dars yo'q
                </p>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {lessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    variant="flat"
                    className="p-4 cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
                    onClick={() => handleEditLesson(lesson)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[var(--foreground)] text-sm">
                          {lesson.subject}
                        </h3>
                        <p className="text-xs text-[var(--foreground-secondary)] mt-1">
                          {lesson.day.charAt(0).toUpperCase() + lesson.day.slice(1)} •{' '}
                          {lesson.shift} • {lesson.period}-para
                        </p>
                        <p className="text-xs text-[var(--foreground-secondary)]">
                          {lesson.room} • {lesson.groups.join(', ')}
                        </p>
                      </div>
                      <span
                        className={`
                          px-2 py-0.5 rounded-full text-xs font-medium
                          ${lesson.shift === 'kunduzgi' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : ''}
                          ${lesson.shift === 'sirtqi' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                          ${lesson.shift === 'kechki' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                        `}
                      >
                        {lesson.shift}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Haftani ko'chirish modali */}
      <WeekCopyModal
        isOpen={isWeekCopyOpen}
        onClose={() => setIsWeekCopyOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
