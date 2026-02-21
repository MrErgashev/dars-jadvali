'use client';

import { useState, useEffect, useCallback } from 'react';
import { speechRecognition } from '@/lib/voice/speechRecognition';
import { parseVoiceCommand } from '@/lib/voice/parser';
import { translateToUzbek, hasEnglishTerms, VOICE_LANGUAGES, VoiceLanguage } from '@/lib/voice/translate';
import { ParsedVoiceCommand, Day, Shift, LessonType } from '@/lib/types';
import { saveLesson } from '@/lib/firebase/db';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type TranscriptCandidate = {
  text: string;
  confidence?: number;
  score: number;
  parsed: ParsedVoiceCommand;
};

interface VoiceInputProps {
  onSuccess: () => void;
  compact?: boolean;
  weekStartISO: string;
}

export default function VoiceInput({ onSuccess, compact = false, weekStartISO }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceCommand | null>(null);
  const [candidates, setCandidates] = useState<TranscriptCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('en');

  // Browser support check
  useEffect(() => {
    setIsSupported(speechRecognition.isSupported());
  }, []);

  /**
   * Matnni tarjima qilish va parse qilish
   * Inglizcha bo'lsa avval translateToUzbek() orqali o'tkaziladi
   */
  const parseWithTranslation = useCallback((text: string): { parsed: ParsedVoiceCommand; translated: string | null } => {
    let textForParsing = text;
    let translated: string | null = null;

    // Inglizcha so'zlar bor bo'lsa, avval tarjima qilish
    if (voiceLang === 'en' || hasEnglishTerms(text)) {
      const translatedResult = translateToUzbek(text);
      if (translatedResult !== text) {
        translated = translatedResult;
        textForParsing = translatedResult;
      }
    }

    const parsed = parseVoiceCommand(textForParsing);
    return { parsed, translated };
  }, [voiceLang]);

  const startListening = () => {
    setError(null);
    setSuccess(null);
    setTranscript('');
    setTranslatedText(null);
    setParsedResult(null);
    setCandidates([]);

    const selectedLang = VOICE_LANGUAGES.find((l) => l.code === voiceLang);
    const speechLang = selectedLang?.speechLang || 'en-US';

    // Til fallback'lari
    const languageFallbacks = voiceLang === 'en'
      ? ['en-US', 'en-GB']
      : voiceLang === 'ru'
        ? ['ru-RU']
        : ['uz-UZ', 'tr-TR', 'ru-RU'];

    const started = speechRecognition.start({
      languages: [speechLang, ...languageFallbacks],
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
      onStart: () => setIsListening(true),
      onResult: (text, isFinal, alternatives) => {
        if (isFinal) {
          const normalizedPrimary = text.trim().replace(/\s+/g, ' ');
          const mergedCandidates = new Map<string, TranscriptCandidate>();

          const scoreParsed = (parsed: ParsedVoiceCommand) => {
            let score = 0;
            if (parsed.day) score += 2;
            if (parsed.shift) score += 2;
            if (parsed.period) score += 2;
            if (parsed.subject) score += 2;
            if (parsed.room) score += 2;
            if (parsed.groups && parsed.groups.length > 0) score += 2;
            if (parsed.teacher) score += 2;
            if (parsed.type) score += 1;
            if (parsed.isComplete) score += 3;
            return score;
          };

          const addCandidate = (candidateText: string, confidence?: number) => {
            const normalized = candidateText.trim().replace(/\s+/g, ' ');
            if (!normalized) return;
            const { parsed, translated } = parseWithTranslation(normalized);
            const score = scoreParsed(parsed);
            const existing = mergedCandidates.get(normalized);
            if (!existing || score > existing.score) {
              mergedCandidates.set(normalized, {
                text: translated || normalized,
                confidence,
                score,
                parsed,
              });
            }
          };

          addCandidate(normalizedPrimary);
          alternatives?.forEach((alt) => addCandidate(alt.transcript, alt.confidence));

          const sortedCandidates = Array.from(mergedCandidates.values()).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (b.confidence ?? 0) - (a.confidence ?? 0);
          });

          const topCandidates = sortedCandidates.slice(0, 3);
          const bestCandidate = topCandidates[0];

          if (bestCandidate) {
            setTranscript(normalizedPrimary);
            setTextInput(bestCandidate.text);
            setParsedResult(bestCandidate.parsed);
            // Tarjima bo'lgan bo'lsa ko'rsatish
            if (bestCandidate.text !== normalizedPrimary) {
              setTranslatedText(bestCandidate.text);
            }
          } else {
            setTranscript(normalizedPrimary);
            setTextInput(normalizedPrimary);
            const { parsed, translated } = parseWithTranslation(normalizedPrimary);
            setParsedResult(parsed);
            setTranslatedText(translated);
          }

          setCandidates(topCandidates);
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
    setTranslatedText(null);
    setCandidates([]);
    if (text.trim().length > 10) {
      const { parsed, translated } = parseWithTranslation(text);
      setParsedResult(parsed);
      setTranslatedText(translated);
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
    const { parsed, translated } = parseWithTranslation(textInput);
    setParsedResult(parsed);
    setTranslatedText(translated);
    setCandidates([]);
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
        weekStart: weekStartISO,
      });

      setSuccess("Dars muvaffaqiyatli saqlandi!");
      setTranscript('');
      setTextInput('');
      setTranslatedText(null);
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
    setTranslatedText(null);
    setParsedResult(null);
    setCandidates([]);
    setError(null);
    setSuccess(null);
  };

  const handleCandidateSelect = (candidate: TranscriptCandidate) => {
    setTextInput(candidate.text);
    setTranscript(candidate.text);
    setTranslatedText(null);
    setParsedResult(candidate.parsed);
    setError(null);
  };

  const currentLang = VOICE_LANGUAGES.find((l) => l.code === voiceLang);
  const exampleText = voiceLang === 'en'
    ? 'Monday morning first period Mathematics JM403 JM403 JM405 Karimov lecture'
    : voiceLang === 'ru'
      ? 'Понедельник утренний 1-пара Математика JM403 JM403 JM405 Каримов лекция'
      : 'Dushanba kunduzgi 1-para Matematika JM403 JM403 JM405 Karimov ma\'ruza';

  return (
    <div>
      {!compact && (
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
          Tez kiritish (Ovoz / Matn)
        </h2>
      )}

      {/* Ovoz tili tanlash */}
      {isSupported && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-2">
            Ovoz tili:
          </div>
          <div className="flex gap-2">
            {VOICE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setVoiceLang(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  voiceLang === lang.code
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
                disabled={isListening}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {voiceLang === 'en' && (
            <p className="text-xs text-[var(--accent-primary)] mt-1.5">
              Inglizcha gapiring — avtomatik tarjima qilinadi
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      {compact ? (
        <details className="mb-4">
          <summary className="text-sm font-medium text-[var(--foreground)] cursor-pointer select-none">
            Buyruq formati
          </summary>
          <Card variant="flat" className="p-4 mt-3">
            <p className="text-sm text-[var(--foreground-secondary)] mb-2">
              {voiceLang === 'en'
                ? '[Day] [Shift] [Period] period [Subject] [Room] [Groups] [Teacher] [Type]'
                : '[Kun] [Bo\'lim] [Para]-para [Fan nomi] [Xona] [Guruhlar] [O\'qituvchi] [Turi]'}
            </p>
            <p className="text-sm text-[var(--accent-primary)]">
              {voiceLang === 'en' ? 'Example' : 'Misol'}: {exampleText}
            </p>
          </Card>
        </details>
      ) : (
        <Card variant="flat" className="p-4 mb-6">
          <h3 className="font-medium text-[var(--foreground)] mb-2">
            Buyruq formati:
          </h3>
          <p className="text-sm text-[var(--foreground-secondary)] mb-2">
            {voiceLang === 'en'
              ? '[Day] [Shift] [Period] period [Subject] [Room] [Groups] [Teacher] [Type]'
              : '[Kun] [Bo\'lim] [Para]-para [Fan nomi] [Xona] [Guruhlar] [O\'qituvchi] [Turi]'}
          </p>
          <p className="text-sm text-[var(--accent-primary)]">
            {voiceLang === 'en' ? 'Example' : 'Misol'}: {exampleText}
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

      {/* Tarjima natijasi (inglizchadan o'zbekchaga) */}
      {translatedText && transcript && translatedText !== transcript && (
        <Card variant="flat" className="p-3 mb-4">
          <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-1">
            Aniqlangan matn:
          </div>
          <div className="text-sm text-[var(--foreground)] mb-2">{transcript}</div>
          <div className="text-xs font-semibold text-[var(--accent-primary)] mb-1">
            Tarjima:
          </div>
          <div className="text-sm text-[var(--foreground)]">{translatedText}</div>
        </Card>
      )}

      {/* Matn input */}
      <div className="mb-4">
        <textarea
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={exampleText}
          className={`input-glass w-full resize-none ${compact ? 'min-h-[80px]' : 'min-h-[100px]'}`}
          rows={3}
        />
      </div>

      {candidates.length > 1 && (
        <Card variant="flat" className="p-3 mb-4">
          <div className="text-xs font-semibold text-[var(--foreground-secondary)] mb-2">
            Variantlar:
          </div>
          <div className="flex flex-col gap-2">
            {candidates.map((candidate, index) => (
              <button
                key={`${candidate.text}-${index}`}
                type="button"
                onClick={() => handleCandidateSelect(candidate)}
                className={`text-left px-3 py-2 rounded-xl border transition-colors ${
                  index === 0
                    ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10'
                    : 'border-[var(--glass-border)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                <div className="text-sm font-medium text-[var(--foreground)]">
                  {index + 1}. {candidate.text}
                </div>
                <div className="text-xs text-[var(--foreground-secondary)]">
                  Aniqlik:{' '}
                  {candidate.confidence !== undefined
                    ? `${Math.round(candidate.confidence * 100)}%`
                    : '-'}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

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
            {isListening ? 'To\'xtat' : `Ovoz (${currentLang?.label || "O'zbekcha"})`}
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
