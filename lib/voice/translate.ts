/**
 * O'zbekcha ovozni aniqlash va tarjima qilish moduli
 *
 * Muammo: Web Speech API o'zbek tilini (uz-UZ) yaxshi qo'llab-quvvatlamaydi.
 * Yechim: Turkcha (tr-TR) modeldan foydalanamiz (turkiy til oilasi, o'zbekchaga yaqin),
 *         keyin aniqlangan matnni o'zbekcha ekvivalentlarga mapping qilamiz.
 *
 * Flow:
 * 1. Foydalanuvchi O'ZBEKCHA gapiradi: "Dushanba kunduzgi birinchi para Matematika..."
 * 2. Web Speech API (tr-TR) tinglaydi va yaqin transkripsiya beradi
 * 3. normalizeUzbekSpeech() turkcha/noto'g'ri so'zlarni o'zbekchaga tuzatadi
 * 4. Parser o'zbekcha matnni tahlil qiladi
 * 5. Jadvalga O'ZBEKCHA yoziladi
 *
 * Hamma narsa foydalanuvchiga O'ZBEKCHA ko'rsatiladi!
 */

// ============================================================
// Turkcha → O'zbekcha mapping (phonetik yaqinlik)
// Turkcha model o'zbekcha ovozni shu so'zlarga o'xshatishi mumkin
// ============================================================

// Kunlar: Turkcha ekvivalentlar → O'zbekcha
const DAY_NORMALIZE: Record<string, string> = {
  // Turkcha model qanday aniqlashi mumkin → O'zbekcha
  pazartesi: 'dushanba',
  'pazar tesi': 'dushanba',
  salı: 'seshanba',
  sali: 'seshanba',
  çarşamba: 'chorshanba',
  carsamba: 'chorshanba',
  'çar şamba': 'chorshanba',
  perşembe: 'payshanba',
  persembe: 'payshanba',
  cuma: 'juma',
  // O'zbekcha variantlar (to'g'ri aniqlansa)
  dushanba: 'dushanba',
  dushamba: 'dushanba',
  seshanba: 'seshanba',
  seshamba: 'seshanba',
  chorshanba: 'chorshanba',
  chorshamba: 'chorshanba',
  payshanba: 'payshanba',
  payshamba: 'payshanba',
  juma: 'juma',
  // Ruscha (ru-RU fallback)
  понедельник: 'dushanba',
  вторник: 'seshanba',
  среда: 'chorshanba',
  четверг: 'payshanba',
  пятница: 'juma',
};

// Bo'limlar: Turkcha/noto'g'ri → O'zbekcha
const SHIFT_NORMALIZE: Record<string, string> = {
  // Turkcha
  sabah: 'kunduzgi',
  sabahki: 'kunduzgi',
  gündüz: 'kunduzgi',
  gunduz: 'kunduzgi',
  öğleden: 'sirtqi',
  ogleden: 'sirtqi',
  akşam: 'kechki',
  aksam: 'kechki',
  gece: 'kechki',
  // O'zbekcha variantlar
  kunduzgi: 'kunduzgi',
  kunduzi: 'kunduzgi',
  ertalab: 'kunduzgi',
  ertalabki: 'kunduzgi',
  sirtqi: 'sirtqi',
  tushlik: 'sirtqi',
  kechki: 'kechki',
  kechqurun: 'kechki',
  kechkisi: 'kechki',
  // Ruscha
  утренний: 'kunduzgi',
  дневной: 'kunduzgi',
  вечерний: 'kechki',
};

// Dars turlari: Turkcha/noto'g'ri → O'zbekcha
const LESSON_TYPE_NORMALIZE: Record<string, string> = {
  // Turkcha
  ders: "ma'ruza",
  'ders anlatım': "ma'ruza",
  uygulama: 'amaliy',
  seminer: 'seminar',
  laboratuvar: 'laboratoriya',
  // O'zbekcha variantlar (noto'g'ri aniqlangan)
  maruza: "ma'ruza",
  "ma'ruza": "ma'ruza",
  maraza: "ma'ruza",
  leksiya: "ma'ruza",
  lektsiya: "ma'ruza",
  amaliy: 'amaliy',
  amaliyot: 'amaliy',
  praktika: 'amaliy',
  seminar: 'seminar',
  seminari: 'seminar',
  laboratoriya: 'laboratoriya',
  labaratoriya: 'laboratoriya',
  lab: 'laboratoriya',
  // Ruscha
  лекция: "ma'ruza",
  практика: 'amaliy',
  семинар: 'seminar',
  лаборатория: 'laboratoriya',
};

// Para raqamlari: so'z → raqam
const ORDINAL_NORMALIZE: Record<string, string> = {
  // O'zbekcha
  birinchi: '1',
  ikkinchi: '2',
  uchinchi: '3',
  // Turkcha
  birinci: '1',
  ikinci: '2',
  üçüncü: '3',
  ucuncu: '3',
  // Ruscha
  первый: '1',
  первая: '1',
  второй: '2',
  вторая: '2',
  третий: '3',
  третья: '3',
  // Raqamlar
  bir: '1',
  iki: '2',
  uch: '3',
  üç: '3',
};

// Olib tashlanadigan filler so'zlar (turkcha/o'zbekcha)
const FILLER_WORDS = new Set([
  // Turkcha
  've', 'bir', 'de', 'da', 'için', 'ile',
  // O'zbekcha artiqcha so'zlar
  'va', 'ham', 'uchun', 'bilan',
  'dars', 'darsi',
]);

/**
 * Ovozdan aniqlangan matnni O'zbekcha formatga normalizatsiya qilish
 *
 * Turkcha (tr-TR) yoki boshqa model aniqlagan matnni
 * O'zbekcha parser tushunadigan formatga o'zgartiradi.
 *
 * Masalan: "Pazartesi sabah birinci ders Matematik JM403" →
 *          "dushanba kunduzgi 1-para Matematik JM403"
 */
export function normalizeUzbekSpeech(recognizedText: string): { normalized: string; wasModified: boolean } {
  if (!recognizedText || !recognizedText.trim()) {
    return { normalized: recognizedText, wasModified: false };
  }

  let text = recognizedText.trim();
  let wasModified = false;

  // Ordinal + para/ders patternlarni oldin qayta ishlash
  // "birinci ders" / "birinchi para" → "1-para"
  const ordinalPattern = new RegExp(
    `\\b(${Object.keys(ORDINAL_NORMALIZE).join('|')})\\s*(para|ders|пара|pair)\\b`,
    'gi'
  );
  text = text.replace(ordinalPattern, (_, ordinal) => {
    const num = ORDINAL_NORMALIZE[ordinal.toLowerCase()] || ordinal;
    wasModified = true;
    return `${num}-para`;
  });

  // "ders 1" / "para 2" formatini ham qo'llab-quvvatlash
  text = text.replace(
    /\b(para|ders|пара)\s*(\d+)\b/gi,
    (_, __, num) => {
      wasModified = true;
      return `${num}-para`;
    }
  );

  // So'zlarni birma-bir normalizatsiya qilish
  const words = text.split(/\s+/);
  const normalizedWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lowerWord = word.toLowerCase();

    // Xona/guruh kodi (JM403) — saqlab qo'yish
    if (/^[A-Za-z]{1,3}\d{3}[A-Za-z]?$/.test(word)) {
      normalizedWords.push(word.toUpperCase());
      continue;
    }

    // Allaqachon qayta ishlangan para formati
    if (/^\d+[-]?para$/i.test(word)) {
      normalizedWords.push(word);
      continue;
    }

    // Kunlarni normalizatsiya
    if (DAY_NORMALIZE[lowerWord]) {
      if (lowerWord !== DAY_NORMALIZE[lowerWord]) wasModified = true;
      normalizedWords.push(DAY_NORMALIZE[lowerWord]);
      continue;
    }

    // Bo'limlarni normalizatsiya
    if (SHIFT_NORMALIZE[lowerWord]) {
      if (lowerWord !== SHIFT_NORMALIZE[lowerWord]) wasModified = true;
      normalizedWords.push(SHIFT_NORMALIZE[lowerWord]);
      continue;
    }

    // Dars turlarini normalizatsiya
    if (LESSON_TYPE_NORMALIZE[lowerWord]) {
      if (lowerWord !== LESSON_TYPE_NORMALIZE[lowerWord]) wasModified = true;
      normalizedWords.push(LESSON_TYPE_NORMALIZE[lowerWord]);
      continue;
    }

    // Filler so'zlarni olib tashlash
    if (FILLER_WORDS.has(lowerWord)) {
      wasModified = true;
      continue;
    }

    // Boshqa so'zlarni (fan nomi, o'qituvchi ismi) aynan saqlab qo'yish
    normalizedWords.push(word);
  }

  const result = normalizedWords.join(' ').replace(/\s+/g, ' ').trim();
  return { normalized: result, wasModified: wasModified || result !== recognizedText.trim() };
}

// ============================================================
// Til sozlamalari
// ============================================================

export type VoiceLanguage = 'uz' | 'ru';

export interface VoiceLanguageOption {
  code: VoiceLanguage;
  label: string;
  speechLangs: string[];
  description: string;
}

/**
 * Ovoz tillari
 * O'zbekcha: tr-TR (turkcha) asosiy model sifatida ishlatiladi,
 *   chunki turkiy til oilasi — fonetik yaqin
 * Ruscha: ru-RU to'g'ridan-to'g'ri
 */
export const VOICE_LANGUAGES: VoiceLanguageOption[] = [
  {
    code: 'uz',
    label: "O'zbekcha",
    speechLangs: ['tr-TR', 'uz-UZ', 'ru-RU'],
    description: "O'zbekcha gapiring — tizim tushunadi va o'zbekcha yozadi",
  },
  {
    code: 'ru',
    label: 'Ruscha',
    speechLangs: ['ru-RU'],
    description: "Ruscha gapiring — o'zbekchaga o'giriladi",
  },
];
