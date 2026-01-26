'use client';

import { useEffect, useRef, useState } from 'react';

type DownloadFormat = 'pdf' | 'jpeg';
type DownloadScope = 'current' | 'all';

const MENU_ITEMS: {
  format: DownloadFormat;
  scope: DownloadScope;
  title: string;
  subtitle: string;
}[] = [
  {
    format: 'pdf',
    scope: 'current',
    title: 'PDF',
    subtitle: "Joriy bo'lim uchun yuqori sifatli",
  },
  {
    format: 'jpeg',
    scope: 'current',
    title: 'JPEG',
    subtitle: "Joriy bo'lim rasm ko'rinishida",
  },
  {
    format: 'pdf',
    scope: 'all',
    title: 'PDF',
    subtitle: "Barcha bo'limlar bitta sahifada",
  },
  {
    format: 'jpeg',
    scope: 'all',
    title: 'JPEG',
    subtitle: "Barcha bo'limlar bitta sahifada",
  },
];

export default function DownloadScheduleButton() {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const handleStart = () => setIsBusy(true);
    const handleEnd = () => setIsBusy(false);

    window.addEventListener('schedule-download-start', handleStart as EventListener);
    window.addEventListener('schedule-download-end', handleEnd as EventListener);

    return () => {
      window.removeEventListener('schedule-download-start', handleStart as EventListener);
      window.removeEventListener('schedule-download-end', handleEnd as EventListener);
    };
  }, []);

  const requestDownload = (format: DownloadFormat, scope: DownloadScope) => {
    window.dispatchEvent(
      new CustomEvent('schedule-download', {
        detail: { format, scope },
      })
    );
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="neo-button p-3 text-[var(--foreground)] hover:text-[var(--accent-primary)]"
        aria-label="Jadvalni yuklab olish"
        title="Jadvalni yuklab olish"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={isBusy}
      >
        {isBusy ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 animate-spin"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-30"
            />
            <path
              d="M21 12a9 9 0 0 1-9 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 glass-strong rounded-2xl p-2 border border-[var(--glass-border)] shadow-xl animate-scale-in"
        >
          <div className="px-3 py-2 text-xs font-semibold text-[var(--foreground-secondary)]">
            Yuklab olish
          </div>
          {MENU_ITEMS.map((item) => (
            <button
              key={`${item.format}-${item.scope}`}
              type="button"
              onClick={() => requestDownload(item.format, item.scope)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
              role="menuitem"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">{item.title}</span>
                <span className="text-[10px] uppercase tracking-wide text-[var(--foreground-secondary)]">
                  {item.format}
                </span>
              </div>
              <div className="text-xs text-[var(--foreground-secondary)]">{item.subtitle}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
