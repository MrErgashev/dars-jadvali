/**
 * Web Speech API wrapper for O'zbek tili
 * iOS-da qo'llab-quvvatlanmasin, lekin matn input fallback bor
 */

import { getDeviceInfo } from './deviceDetection';

// SpeechRecognition type declaration
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Window interface extension
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export interface SpeechRecognitionOptions {
  language?: string;
  languages?: string[];
  languageFallbacks?: string[];
  maxAlternatives?: number;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean, alternatives?: SpeechAlternative[]) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface SpeechAlternative {
  transcript: string;
  confidence: number;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  /**
   * Browser Web Speech API'ni qo'llab-quvvatlashini tekshirish
   * iOS-da Web Speech API ishlamaydi
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;

    // iOS-da Web Speech API ishlamaydi
    const deviceInfo = getDeviceInfo();
    if (deviceInfo.isIOS) {
      return false;
    }

    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Speech recognition'ni boshlash
   */
  start(options: SpeechRecognitionOptions = {}): boolean {
    // iOS uchun special fallback - native diktat ishlatamiz
    const deviceInfo = getDeviceInfo();
    if (deviceInfo.isIOS) {
      const message = 'iOS-da: Matn maydoniga bosing, keyin keyboard mikrofon ikonasini bosing va gap eting.';
      options.onError?.(message);
      return false;
    }

    if (!this.isSupported()) {
      options.onError?.('Speech recognition bu brauzerda qo\'llab-quvvatlanmaydi');
      return false;
    }

    // Agar allaqachon ishlayotgan bo'lsa, to'xtatish
    if (this.isListening) {
      this.stop();
    }

    try {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const languagesToTry = [
        ...(options.languages ?? []),
        ...(options.language ? [options.language] : []),
        ...(options.languageFallbacks ?? []),
      ].filter((lang, index, list) => lang && list.indexOf(lang) === index);

      const preferredLanguages =
        languagesToTry.length > 0
          ? languagesToTry
          : ['uz-UZ', 'ru-RU', 'tr-TR'];

      let languageIndex = 0;

      const setupRecognition = (language: string) => {
        this.recognition = new SpeechRecognitionAPI();

        // Sozlamalar
        this.recognition.lang = language;
        this.recognition.continuous = options.continuous ?? false;
        this.recognition.interimResults = options.interimResults ?? true;
        this.recognition.maxAlternatives = options.maxAlternatives ?? 3;

        // Event handlers
        this.recognition.onstart = () => {
          this.isListening = true;
          options.onStart?.();
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let finalAlternatives: SpeechAlternative[] | undefined;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
              finalAlternatives = Array.from(result).map((alt) => ({
                transcript: alt.transcript.trim(),
                confidence: alt.confidence,
              }));
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            options.onResult?.(finalTranscript.trim(), true, finalAlternatives);
          } else if (interimTranscript) {
            options.onResult?.(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          this.isListening = false;

          if (
            event.error === 'language-not-supported' &&
            languageIndex < preferredLanguages.length - 1
          ) {
            languageIndex += 1;
            const nextLanguage = preferredLanguages[languageIndex];
            this.recognition?.abort();
            setupRecognition(nextLanguage);
            this.recognition?.start();
            return;
          }

          let errorMessage = 'Ovozni tanib olishda xatolik';
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'Ovoz eshitilmadi. Mikrofonga yaqinroq gapiring va qayta urinib ko\'ring.';
              break;
            case 'audio-capture':
              errorMessage = 'Mikrofon topilmadi. Mikrofon ulanganligini tekshiring.';
              break;
            case 'not-allowed':
              errorMessage = 'Mikrofonga ruxsat berilmagan. Brauzer sozlamalaridan mikrofonga ruxsat bering.';
              break;
            case 'network':
              errorMessage = 'Internet bilan muammo. Internetga ulanganligingizni tekshiring.';
              break;
            case 'aborted':
              errorMessage = 'Ovozni tanib olish to\'xtatildi.';
              break;
            case 'service-not-allowed':
              const device = getDeviceInfo();
              if (device.isIOS) {
                errorMessage = 'iOS-da: Matn maydoniga bosing va keyboard diktatini ishlatang (🎤 ikonasi).';
              } else if (device.isSafari) {
                errorMessage = 'Safari-da ovozli kiritish qo\'llab-quvvatlanmaydi. Chrome brauzerini sinab ko\'ring yoki matn input ishlating.';
              } else {
                errorMessage = 'Bu qurilmada ovozli kiritish qo\'llab-quvvatlanmaydi. Qo\'lda kiritishdan foydalaning.';
              }
              break;
            case 'language-not-supported':
              errorMessage = 'O\'zbek tili qo\'llab-quvvatlanmaydi. Ruscha yoki inglizcha gapiring.';
              break;
            default:
              errorMessage = `Xatolik: ${event.error}. Chrome brauzerida sinab ko'ring.`;
          }

          options.onError?.(errorMessage);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          options.onEnd?.();
        };

      };

      setupRecognition(preferredLanguages[languageIndex]);
      this.recognition?.start();
      return true;
    } catch (error) {
      options.onError?.(`Xatolik: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`);
      return false;
    }
  }

  /**
   * Speech recognition'ni to'xtatish
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Speech recognition'ni bekor qilish
   */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Hozirgi holat
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const speechRecognition = new SpeechRecognitionService();
