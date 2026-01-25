'use client';

import { useState, useEffect } from 'react';
import { speechRecognition } from '@/lib/voice/speechRecognition';
import { parseVoiceCommand } from '@/lib/voice/parser';
import { ParsedVoiceCommand, Day, Shift, LessonType } from '@/lib/types';
import { saveLesson } from '@/lib/firebase/db';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface VoiceInputProps {
  onSuccess: () => void;
  compact?: boolean;
}

export default function VoiceInput({ onSuccess, compact = false }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceCommand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Browser support check - barcha qurilmalarda sinab ko'ramiz
  useEffect(() => {
    setIsSupported(speechRecognition.isSupported());
  }, []);

  const startListening = () => {
    setError(null);
    setSuccess(null);
    setTranscript('');
    setParsedResult(null);

    const started = speechRecognition.start({
      language: 'ru-RU',
      continuous: false,
      interimResults: true,
      onStart: () => setIsListening(true),
      onResult: (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setTextInput(text);
          const parsed = parseVoiceCommand(text);
          setParsedResult(parsed);
        }
      },
      onError: (err) => {
        setError(err);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    });

    if (!started) {
      setError("Ovozni tanib olishni boshlashda xatolik");
    }
  };

  const stopListening = () => {
    speechRecognition.stop();
    setIsListening(false);
  };

  // Matn kiritilganda parse qilish
  const handleTextChange = (text: string) => {
    setTextInput(text);
    setTranscript(text);
    if (text.trim().length > 10) {
      const parsed = parseVoiceCommand(text);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  };

  // Parse tugmasi
  const handleParse = () => {
    if (textInput.trim().length < 5) {
      setError("Matn juda qisqa");
      return;
    }
    setError(null);
    const parsed = parseVoiceCommand(textInput);
    setParsedResult(parsed);
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
      setTextInput('');
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
    setTextInput('');
    setParsedResult(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div>
      {!compact && (
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
          Tez kiritish (Ovoz / Matn)
        </h2>
      )}

      {/* Instructions */}
      {compact ? (
        <details className="mb-4">
          <summary className="text-sm font-medium text-[var(--foreground)] cursor-pointer select-none">
            Buyruq formati
          </summary>
          <Card variant="flat" className="p-4 mt-3">
            <p className="text-sm text-[var(--foreground-secondary)] mb-2">
              [Kun] [Bo'lim] [Para]-para [Fan nomi] [Xona] [Guruhlar] [O'qituvchi] [Turi]
            </p>
            <p className="text-sm text-[var(--accent-primary)]">
              Misol: Dushanba kunduzgi 1-para Matematika JM403 JM403 JM405 Karimov ma'ruza
            </p>
          </Card>
        </details>
      ) : (
        <Card variant="flat" className="p-4 mb-6">
          <h3 className="font-medium text-[var(--foreground)] mb-2">
            Buyruq formati:
          </h3>
          <p className="text-sm text-[var(--foreground-secondary)] mb-2">
            [Kun] [Bo'lim] [Para]-para [Fan nomi] [Xona] [Guruhlar] [O'qituvchi] [Turi]
          </p>
          <p className="text-sm text-[var(--accent-primary)]">
            Misol: Dushanba kunduzgi 1-para Matematika JM403 JM403 JM405 Karimov ma'ruza
          </p>
        </Card>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">!</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Matn input */}
      <div className="mb-4">
        <textarea
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Dushanba kunduzgi 1-para Matematika JM403 JM403 JM405 Karimov ma'ruza"
          className={`input-glass w-full resize-none ${compact ? 'min-h-[80px]' : 'min-h-[100px]'}`}
          rows={3}
        />
      </div>

      {/* Tugmalar */}
      <div className="flex gap-3 mb-6">
        {/* Mikrofon (faqat qo'llab-quvvatlansa) */}
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`
              neo-button p-4 rounded-xl flex items-center gap-2
              ${isListening ? 'bg-red-500 text-white' : 'text-[var(--foreground)]'}
            `}
            disabled={saving}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
            {isListening ? 'To\'xtat' : 'Ovoz'}
          </button>
        )}

        <Button
          variant="secondary"
          onClick={handleParse}
          disabled={textInput.trim().length < 5 || saving}
          className="flex-1"
        >
          Tahlil qilish
        </Button>
      </div>

      {/* Parsed result */}
      {parsedResult && (
        <Card variant="glass" className="p-4 mb-6">
          <h3 className="font-medium text-[var(--foreground)] mb-4">
            Aniqlangan ma'lumotlar:
          </h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={parsedResult.day ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.day ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Kun:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.day ? parsedResult.day.charAt(0).toUpperCase() + parsedResult.day.slice(1) : '-'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={parsedResult.shift ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.shift ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Bo'lim:</span>
              <span className="text-[var(--foreground)]">
                {parsedResult.shift ? parsedResult.shift.charAt(0).toUpperCase() + parsedResult.shift.slice(1) : '-'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={parsedResult.period ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.period ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Para:</span>
              <span className="text-[var(--foreground)]">{parsedResult.period || '-'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={parsedResult.type ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.type ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Turi:</span>
              <span className="text-[var(--foreground)]">{parsedResult.type || '-'}</span>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <span className={parsedResult.subject ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.subject ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Fan:</span>
              <span className="text-[var(--foreground)]">{parsedResult.subject || '-'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={parsedResult.room ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.room ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Xona:</span>
              <span className="text-[var(--foreground)]">{parsedResult.room || '-'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={parsedResult.teacher ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.teacher ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">O'qituvchi:</span>
              <span className="text-[var(--foreground)]">{parsedResult.teacher || '-'}</span>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <span className={parsedResult.groups?.length ? 'text-green-500' : 'text-red-500'}>
                {parsedResult.groups?.length ? '✓' : '✗'}
              </span>
              <span className="text-[var(--foreground-secondary)]">Guruhlar:</span>
              <span className="text-[var(--foreground)]">{parsedResult.groups?.join(', ') || '-'}</span>
            </div>
          </div>

          {/* Missing fields */}
          {!parsedResult.isComplete && (
            <div className="mt-4 p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
              <strong>Yetishmayapti:</strong> {parsedResult.missingFields.join(', ')}
            </div>
          )}
        </Card>
      )}

      {/* Action buttons */}
      {parsedResult && (
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            Tozalash
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
