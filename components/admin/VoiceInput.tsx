'use client';

import { useState, useEffect } from 'react';
import { speechRecognition } from '@/lib/voice/speechRecognition';
import { parseVoiceCommand, formatParsedResult } from '@/lib/voice/parser';
import { ParsedVoiceCommand, Day, Shift, LessonType } from '@/lib/types';
import { saveLesson } from '@/lib/firebase/db';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface VoiceInputProps {
  onSuccess: () => void;
}

export default function VoiceInput({ onSuccess }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedLang, setSelectedLang] = useState('ru-RU');

  // Browser support check
  useEffect(() => {
    setIsSupported(speechRecognition.isSupported());
  }, []);

  const startListening = () => {
    setError(null);
    setSuccess(null);
    setTranscript('');
    setInterimTranscript('');
    setParsedResult(null);

    const started = speechRecognition.start({
      language: selectedLang, // Tanlangan til
      continuous: false,
      interimResults: true,
      onStart: () => {
        setIsListening(true);
      },
      onResult: (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimTranscript('');
          // Matnni tahlil qilish
          const parsed = parseVoiceCommand(text);
          setParsedResult(parsed);
        } else {
          setInterimTranscript(text);
        }
      },
      onError: (err) => {
        setError(err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setError("Ovozni tanib olishni boshlashda xatolik");
    }
  };

  const stopListening = () => {
    speechRecognition.stop();
    setIsListening(false);
  };

  const handleSave = async () => {
    if (!parsedResult || !parsedResult.isComplete) {
      setError("Ma'lumotlar to'liq emas");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveLesson({
        day: parsedResult.day as Day,
        shift: parsedResult.shift as Shift,
        period: parsedResult.period as number,
        subject: parsedResult.subject as string,
        room: parsedResult.room as string,
        teacher: parsedResult.teacher as string,
        groups: parsedResult.groups as string[],
        type: parsedResult.type as LessonType,
      });

      setSuccess("Dars muvaffaqiyatli saqlandi!");
      setTranscript('');
      setParsedResult(null);
      onSuccess();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setInterimTranscript('');
    setParsedResult(null);
    setError(null);
    setSuccess(null);
  };

  if (!isSupported) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Ovozli kiritish qo'llab-quvvatlanmaydi
        </h3>
        <p className="text-[var(--foreground-secondary)]">
          Bu brauzer ovozni tanib olish funksiyasini qo'llab-quvvatlamaydi.
          <br />
          Chrome yoki Edge brauzeridan foydalaning.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
        Ovozli kiritish
      </h2>

      {/* Til tanlash */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedLang('ru-RU')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            selectedLang === 'ru-RU'
              ? 'gradient-primary text-white'
              : 'neo-button text-[var(--foreground)]'
          }`}
        >
          Ruscha (tavsiya)
        </button>
        <button
          onClick={() => setSelectedLang('uz-UZ')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            selectedLang === 'uz-UZ'
              ? 'gradient-primary text-white'
              : 'neo-button text-[var(--foreground)]'
          }`}
        >
          O'zbekcha
        </button>
        <button
          onClick={() => setSelectedLang('en-US')}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            selectedLang === 'en-US'
              ? 'gradient-primary text-white'
              : 'neo-button text-[var(--foreground)]'
          }`}
        >
          Inglizcha
        </button>
      </div>

      {/* Instructions */}
      <Card variant="flat" className="p-4 mb-6">
        <h3 className="font-medium text-[var(--foreground)] mb-2">
          Buyruq formati:
        </h3>
        <p className="text-sm text-[var(--foreground-secondary)] mb-2">
          [Kun] [Bo'lim] [Para]-para [Fan nomi] [Xona] [Guruhlar] [O'qituvchi] [Turi]
        </p>
        <p className="text-sm text-[var(--accent-primary)]">
          Misol: "Dushanba kunduzgi 1-para Mediasavodxonlik JM403 JM403 JM405 Karimov Ma'ruza"
        </p>
        <p className="text-xs text-[var(--foreground-secondary)] mt-2">
          * Telefonda Chrome brauzeridan foydalaning. Safari qo'llab-quvvatlamaydi.
        </p>
      </Card>

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

      {/* Microphone button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`
            mic-button neo-button
            ${isListening ? 'recording' : 'gradient-primary'}
          `}
          disabled={saving}
        >
          {isListening ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-sm text-[var(--foreground-secondary)] mb-6">
        {isListening
          ? 'Tinglayapman... To\'xtatish uchun bosing'
          : 'Boshlash uchun mikrofon tugmasini bosing'}
      </p>

      {/* Interim transcript */}
      {interimTranscript && (
        <Card variant="flat" className="p-4 mb-4">
          <p className="text-[var(--foreground-secondary)] italic">
            {interimTranscript}...
          </p>
        </Card>
      )}

      {/* Final transcript */}
      {transcript && (
        <Card variant="flat" className="p-4 mb-6">
          <h3 className="font-medium text-[var(--foreground)] mb-2">
            Aytilgan matn:
          </h3>
          <p className="text-[var(--foreground)]">{transcript}</p>
        </Card>
      )}

      {/* Parsed result */}
      {parsedResult && (
        <Card variant="glass" className="p-4 mb-6">
          <h3 className="font-medium text-[var(--foreground)] mb-4">
            Aniqlangan ma'lumotlar:
          </h3>

          <div className="space-y-2">
            {/* Kun */}
            <div className="flex items-center gap-2">
              {parsedResult.day ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Kun:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.day
                  ? parsedResult.day.charAt(0).toUpperCase() + parsedResult.day.slice(1)
                  : 'Aniqlanmadi'}
              </span>
            </div>

            {/* Bo'lim */}
            <div className="flex items-center gap-2">
              {parsedResult.shift ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Bo'lim:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.shift
                  ? parsedResult.shift.charAt(0).toUpperCase() + parsedResult.shift.slice(1)
                  : 'Aniqlanmadi'}
              </span>
            </div>

            {/* Para */}
            <div className="flex items-center gap-2">
              {parsedResult.period ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Para:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.period || 'Aniqlanmadi'}
              </span>
            </div>

            {/* Fan */}
            <div className="flex items-center gap-2">
              {parsedResult.subject ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Fan:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.subject || 'Aniqlanmadi'}
              </span>
            </div>

            {/* Xona */}
            <div className="flex items-center gap-2">
              {parsedResult.room ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Xona:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.room || 'Aniqlanmadi'}
              </span>
            </div>

            {/* Guruhlar */}
            <div className="flex items-center gap-2">
              {parsedResult.groups && parsedResult.groups.length > 0 ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Guruhlar:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.groups?.join(', ') || 'Aniqlanmadi'}
              </span>
            </div>

            {/* O'qituvchi */}
            <div className="flex items-center gap-2">
              {parsedResult.teacher ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">O'qituvchi:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.teacher || 'Aniqlanmadi'}
              </span>
            </div>

            {/* Turi */}
            <div className="flex items-center gap-2">
              {parsedResult.type ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              <span className="text-[var(--foreground-secondary)]">Turi:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.type || 'Aniqlanmadi'}
              </span>
            </div>
          </div>

          {/* Missing fields warning */}
          {!parsedResult.isComplete && (
            <div className="mt-4 p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
              <strong>Yetishmayotgan maydonlar:</strong>{' '}
              {parsedResult.missingFields.join(', ')}
            </div>
          )}
        </Card>
      )}

      {/* Action buttons */}
      {parsedResult && (
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            Bekor qilish
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={!parsedResult.isComplete || saving}
            isLoading={saving}
          >
            Saqlash
          </Button>
        </div>
      )}
    </div>
  );
}
