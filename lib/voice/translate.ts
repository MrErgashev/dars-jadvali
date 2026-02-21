/**
 * Inglizcha ovozli buyruqni O'zbekcha parser tushunadigan formatga tarjima qilish
 *
 * Flow: Foydalanuvchi inglizcha gapiradi → Web Speech API (en-US) aniqlaydi →
 *       translateToUzbek() o'zgartiradi → parser tahlil qiladi
 *
 * Misol: "Monday morning first period Mathematics JM403 Karimov lecture"
 *      → "Dushanba kunduzgi 1-para Matematika JM403 Karimov ma'ruza"
 */

// Kunlar: English → O'zbek
const DAY_TRANSLATIONS: Record<string, string> = {
  monday: 'dushanba',
  mon: 'dushanba',
  tuesday: 'seshanba',
  tue: 'seshanba',
  tues: 'seshanba',
  wednesday: 'chorshanba',
  wed: 'chorshanba',
  thursday: 'payshanba',
  thu: 'payshanba',
  thurs: 'payshanba',
  friday: 'juma',
  fri: 'juma',
};

// Bo'limlar: English → O'zbek
const SHIFT_TRANSLATIONS: Record<string, string> = {
  morning: 'kunduzgi',
  daytime: 'kunduzgi',
  day: 'kunduzgi',
  afternoon: 'sirtqi',
  external: 'sirtqi',
  evening: 'kechki',
  night: 'kechki',
};

// Dars turlari: English → O'zbek
const LESSON_TYPE_TRANSLATIONS: Record<string, string> = {
  lecture: "ma'ruza",
  lectures: "ma'ruza",
  practical: 'amaliy',
  practice: 'amaliy',
  practicals: 'amaliy',
  seminar: 'seminar',
  seminars: 'seminar',
  laboratory: 'laboratoriya',
  lab: 'laboratoriya',
  labs: 'laboratoriya',
};

// Para raqamlari: English → raqam
const ORDINAL_TRANSLATIONS: Record<string, string> = {
  first: '1',
  '1st': '1',
  second: '2',
  '2nd': '2',
  third: '3',
  '3rd': '3',
  fourth: '4',
  '4th': '4',
};

// Qo'shimcha so'zlar - olib tashlanadigan yoki almashtiladigan
const FILLER_WORDS: Record<string, string> = {
  period: 'para',
  pair: 'para',
  class: 'para',
  lesson: '',
  room: '',
  teacher: '',
  group: '',
  groups: '',
  subject: '',
  the: '',
  a: '',
  an: '',
  in: '',
  at: '',
  for: '',
  and: '',
  with: '',
  of: '',
  to: '',
  is: '',
};

/**
 * Inglizcha ovozli buyruqni O'zbekcha formatga tarjima qilish
 */
export function translateToUzbek(englishText: string): string {
  if (!englishText || !englishText.trim()) return englishText;

  let text = englishText.trim();

  // "first period" / "1st period" → "1-para" formatiga o'zgartirish
  text = text.replace(
    /\b(first|1st|second|2nd|third|3rd|fourth|4th)\s*(period|pair|class|lesson)\b/gi,
    (_, ordinal, __) => {
      const num = ORDINAL_TRANSLATIONS[ordinal.toLowerCase()] || ordinal;
      return `${num}-para`;
    }
  );

  // "period 1" / "class 2" formatini ham qo'llab-quvvatlash
  text = text.replace(
    /\b(period|pair|class|lesson)\s*(\d+)\b/gi,
    (_, __, num) => `${num}-para`
  );

  // So'zlarni birma-bir tarjima qilish
  const words = text.split(/\s+/);
  const translatedWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lowerWord = word.toLowerCase();

    // Agar xona/guruh kodi bo'lsa (JM403), o'zgartirmaslik
    if (/^[A-Za-z]{1,3}\d{3}[A-Za-z]?$/.test(word)) {
      translatedWords.push(word);
      continue;
    }

    // Raqam bo'lsa (already handled para), o'zgartirmaslik
    if (/^\d+[-]?para$/i.test(word)) {
      translatedWords.push(word);
      continue;
    }

    // Kunlarni tarjima qilish
    if (DAY_TRANSLATIONS[lowerWord]) {
      translatedWords.push(DAY_TRANSLATIONS[lowerWord]);
      continue;
    }

    // Bo'limlarni tarjima qilish
    if (SHIFT_TRANSLATIONS[lowerWord]) {
      translatedWords.push(SHIFT_TRANSLATIONS[lowerWord]);
      continue;
    }

    // Dars turlarini tarjima qilish
    if (LESSON_TYPE_TRANSLATIONS[lowerWord]) {
      translatedWords.push(LESSON_TYPE_TRANSLATIONS[lowerWord]);
      continue;
    }

    // Filler so'zlarni olib tashlash yoki almashtirish
    if (lowerWord in FILLER_WORDS) {
      const replacement = FILLER_WORDS[lowerWord];
      if (replacement) {
        translatedWords.push(replacement);
      }
      // Bo'sh replacement = so'zni olib tashlash
      continue;
    }

    // Boshqa so'zlarni (fan nomi, o'qituvchi ismi) o'zgartirmaslik
    translatedWords.push(word);
  }

  return translatedWords.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Matnda inglizcha so'zlar borligini tekshirish
 * (avtomatik tarjima kerakligini aniqlash uchun)
 */
export function hasEnglishTerms(text: string): boolean {
  const lowerText = text.toLowerCase();
  const englishKeywords = [
    ...Object.keys(DAY_TRANSLATIONS),
    ...Object.keys(SHIFT_TRANSLATIONS),
    ...Object.keys(LESSON_TYPE_TRANSLATIONS),
    'period', 'class', 'lesson',
    'first', 'second', 'third',
  ];

  return englishKeywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export type VoiceLanguage = 'uz' | 'ru' | 'en';

export interface VoiceLanguageOption {
  code: VoiceLanguage;
  label: string;
  speechLang: string;
  description: string;
}

export const VOICE_LANGUAGES: VoiceLanguageOption[] = [
  {
    code: 'uz',
    label: "O'zbekcha",
    speechLang: 'uz-UZ',
    description: "O'zbek tilida gapiring",
  },
  {
    code: 'ru',
    label: 'Ruscha',
    speechLang: 'ru-RU',
    description: 'Rus tilida gapiring',
  },
  {
    code: 'en',
    label: 'Inglizcha',
    speechLang: 'en-US',
    description: "Ingliz tilida gapiring (avtomatik tarjima qilinadi)",
  },
];
