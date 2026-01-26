/**
 * Qurilma va brauzer turini aniqlash
 */

export interface DeviceInfo {
  isIOS: boolean;
  isSafari: boolean;
  isAndroid: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isMobile: boolean;
  userAgent: string;
}

/**
 * Qurilma ma'lumotlarini olish
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isIOS: false,
      isSafari: false,
      isAndroid: false,
      isChrome: false,
      isFirefox: false,
      isMobile: false,
      userAgent: '',
    };
  }

  const ua = navigator.userAgent || '';

  return {
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome|CriOS/.test(ua),
    isAndroid: /Android/.test(ua),
    isChrome: /Chrome|CriOS/.test(ua),
    isFirefox: /Firefox/.test(ua),
    isMobile: /Mobile|Android|iPhone|iPad|iPod/.test(ua),
    userAgent: ua,
  };
}

/**
 * Ovozli kiritish qo'llab-quvvatlanishini tekshirish
 */
export function supportsVoiceInput(): boolean {
  if (typeof window === 'undefined') return false;

  const device = getDeviceInfo();

  // iOS-da Web Speech API ishlamaydi
  if (device.isIOS) {
    return false;
  }

  // Web Speech API bor-yo'q
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

/**
 * iOS-da matn kiritish yordamchi bo'ladimi
 */
export function shouldShowTextInputHint(): boolean {
  if (typeof window === 'undefined') return false;

  const device = getDeviceInfo();
  return device.isIOS || device.isSafari;
}

/**
 * iOS uchun special message
 */
export function getIOSFallbackMessage(): string {
  const device = getDeviceInfo();

  if (device.isIOS && device.isSafari) {
    return 'iOS Safari-da ovozli kiritish qo\'llab-quvvatlanmaydi. Iltimos, matn bilan kiritish yoki Android qurilma ishlatish tavsiya etiladi.';
  }

  if (device.isIOS) {
    return 'iOS-da ovozli kiritish qo\'llab-quvvatlanmaydi. Matn bilan kiritish yoki Android qurilma ishlatish tavsiya etiladi.';
  }

  return '';
}
