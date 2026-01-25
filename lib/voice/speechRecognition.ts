/**
 * Web Speech API wrapper for O'zbek tili
 */

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
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  /**
   * Browser Web Speech API'ni qo'llab-quvvatlashini tekshirish
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Speech recognition'ni boshlash
   */
  start(options: SpeechRecognitionOptions = {}): boolean {
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
      this.recognition = new SpeechRecognitionAPI();

      // Sozlamalar
      this.recognition.lang = options.language || 'uz-UZ'; // O'zbek tili
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;
      this.recognition.maxAlternatives = 1;

      // Event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        options.onStart?.();
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          options.onResult?.(finalTranscript, true);
        } else if (interimTranscript) {
          options.onResult?.(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;

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
            errorMessage = 'Bu qurilmada ovozli kiritish qo\'llab-quvvatlanmaydi. Qo\'lda kiritishdan foydalaning yoki Chrome brauzerini sinab ko\'ring.';
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

      // Boshlash
      this.recognition.start();
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
