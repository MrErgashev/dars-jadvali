import { Day, Shift, LessonType, ParsedVoiceCommand } from '../types';
import { DAY_NAMES, SHIFT_NAMES, LESSON_TYPE_NAMES } from '../constants';

/**
 * O'zbek tilida gapirilgan matnni tahlil qilib, dars ma'lumotlarini ajratib olish
 *
 * Misol: "Dushanba kunduzgi 1-para Mediasavodxonlik JM403 JM403-JM405 Karimov Ma'ruza"
 */
export function parseVoiceCommand(text: string): ParsedVoiceCommand {
  const lowerText = text.toLowerCase().trim();
  const words = lowerText.split(/\s+/);
  const rawTokens = text.trim().split(/\s+/);
  const lowerTokens = rawTokens.map((token) => token.toLowerCase());

  const result: ParsedVoiceCommand = {
    isComplete: false,
    missingFields: [],
  };

  // 1. Kunni topish
  for (const [day, aliases] of Object.entries(DAY_NAMES)) {
    if (aliases.some((alias) => lowerText.includes(alias))) {
      result.day = day as Day;
      break;
    }
  }

  // 2. Bo'limni topish
  for (const [shift, aliases] of Object.entries(SHIFT_NAMES)) {
    if (aliases.some((alias) => lowerText.includes(alias))) {
      result.shift = shift as Shift;
      break;
    }
  }

  // 3. Para raqamini topish (O'zbek + Rus + English)
  const paraMatch = lowerText.match(/(\d+)\s*[-\s]?\s*(para|пара|pair)/i);
  if (paraMatch) {
    result.period = parseInt(paraMatch[1]);
  } else {
    // O'zbekcha, Ruscha, Inglizcha raqamlar
    if (lowerText.includes('birinchi') || lowerText.includes('первая') || lowerText.includes('первый') || lowerText.includes('first')) result.period = 1;
    else if (lowerText.includes('ikkinchi') || lowerText.includes('вторая') || lowerText.includes('второй') || lowerText.includes('second')) result.period = 2;
    else if (lowerText.includes('uchinchi') || lowerText.includes('третья') || lowerText.includes('третий') || lowerText.includes('third')) result.period = 3;
  }

  // 4. Dars turini topish
  for (const [lessonType, aliases] of Object.entries(LESSON_TYPE_NAMES)) {
    if (aliases.some((alias) => lowerText.includes(alias))) {
      result.type = lessonType as LessonType;
      break;
    }
  }

  // 5. Xona raqamini topish (JM403, A101, B205 kabi)
  const roomMatch = text.match(/\b([A-Za-z]{1,3}\d{3}[A-Za-z]?)\b/);
  if (roomMatch) {
    result.room = roomMatch[1].toUpperCase();
  }

  // 6. Guruhlarni topish (xona bilan bir xil format, lekin birinchisidan keyin)
  const groupMatches = text.match(/\b([A-Za-z]{2,3}\d{3})\b/g);
  if (groupMatches && groupMatches.length > 0) {
    // Agar xona topilgan bo'lsa, uni guruhlar ro'yxatidan olib tashlash
    const groups = groupMatches
      .map((g) => g.toUpperCase())
      .filter((g) => g !== result.room);

    if (groups.length > 0) {
      result.groups = [...new Set(groups)]; // Takrorlanishlarni olib tashlash
    }
  }

  // 7. O'qituvchi ismini topish
  // O'qituvchi ismi odatda oxirgi so'zlar orasida bo'ladi
  // Kun, bo'lim, para, xona, guruh va turni olib tashlagan holda
  const knownPatterns = [
    ...Object.values(DAY_NAMES).flat(),
    ...Object.values(SHIFT_NAMES).flat(),
    ...Object.values(LESSON_TYPE_NAMES).flat(),
    'para', 'paraga', 'пара',
    'birinchi', 'ikkinchi', 'uchinchi',
    'первая', 'вторая', 'третья', 'первый', 'второй', 'третий',
    'first', 'second', 'third', 'fourth',
    // English filler words (translate funksiyasi olib tashlaydi, lekin agar qolsa)
    'period', 'class', 'lesson', 'room', 'teacher', 'group', 'groups',
    'subject', 'the', 'a', 'an', 'in', 'at', 'for', 'and', 'with', 'of', 'to', 'is',
    '1st', '2nd', '3rd', '4th',
  ];

  // Fan nomi va o'qituvchi ismini ajratish
  // Odatda: [kun] [bo'lim] [para] [fan nomi] [xona] [guruhlar] [o'qituvchi] [turi]
  const cleanedWords = words.filter((word) => {
    // Raqamli patternlarni o'chirish
    if (/^\d+[-\s]?para$/i.test(word)) return false;
    if (/^[a-z]{1,3}\d{3}[a-z]?$/i.test(word)) return false;
    if (knownPatterns.includes(word)) return false;
    return true;
  });

  const roomTokenPattern = /^[A-Za-z]{1,3}\d{3}[A-Za-z]?$/;
  const groupTokenPattern = /^[A-Za-z]{2,3}\d{3}$/;
  const paraTokenPattern = /^\d+[-\s]?para$/i;

  const isIgnorableToken = (token: string, lowerToken: string) => {
    if (knownPatterns.includes(lowerToken)) return true;
    if (paraTokenPattern.test(lowerToken)) return true;
    if (roomTokenPattern.test(token) || groupTokenPattern.test(token)) return true;
    return false;
  };

  let lastLocationIndex = -1;
  rawTokens.forEach((token, index) => {
    if (roomTokenPattern.test(token) || groupTokenPattern.test(token)) {
      lastLocationIndex = index;
    }
  });

  const subjectTokens = rawTokens
    .slice(0, lastLocationIndex === -1 ? rawTokens.length : lastLocationIndex)
    .filter((token, index) => !isIgnorableToken(token, lowerTokens[index]));

  const teacherTokens =
    lastLocationIndex === -1
      ? []
      : rawTokens
          .slice(lastLocationIndex + 1)
          .filter((token, index) =>
            !isIgnorableToken(token, lowerTokens[lastLocationIndex + 1 + index])
          );

  if (subjectTokens.length > 0 && teacherTokens.length > 0) {
    result.subject = capitalizeWords(subjectTokens.join(' '));
    result.teacher = capitalizeWords(teacherTokens.join(' '));
  } else if (cleanedWords.length > 0) {
    if (cleanedWords.length >= 3) {
      const possibleTeacher = cleanedWords.slice(-2).join(' ');
      const possibleSubject = cleanedWords.slice(0, -2).join(' ');
      result.teacher = capitalizeWords(possibleTeacher);
      result.subject = capitalizeWords(possibleSubject);
    } else if (cleanedWords.length >= 2) {
      const possibleTeacher = cleanedWords[cleanedWords.length - 1];
      const possibleSubject = cleanedWords.slice(0, -1).join(' ');
      result.teacher = capitalizeWords(possibleTeacher);
      result.subject = capitalizeWords(possibleSubject);
    } else {
      result.subject = capitalizeWords(cleanedWords[0]);
    }
  }

  // Qaysi maydonlar yetishmayotganini aniqlash
  if (!result.day) result.missingFields.push('Kun');
  if (!result.shift) result.missingFields.push("Bo'lim");
  if (!result.period) result.missingFields.push('Para');
  if (!result.subject) result.missingFields.push('Fan nomi');
  if (!result.room) result.missingFields.push('Xona');
  if (!result.groups || result.groups.length === 0) result.missingFields.push('Guruhlar');
  if (!result.teacher) result.missingFields.push("O'qituvchi");
  if (!result.type) result.missingFields.push('Dars turi');

  result.isComplete = result.missingFields.length === 0;

  return result;
}

/**
 * Har bir so'zni kapitalizatsiya qilish
 */
function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Tahlil natijasini inson o'qiy oladigan formatga o'tkazish
 */
export function formatParsedResult(parsed: ParsedVoiceCommand): string {
  const lines: string[] = [];

  if (parsed.day) {
    const dayLabel = parsed.day.charAt(0).toUpperCase() + parsed.day.slice(1);
    lines.push(`Kun: ${dayLabel}`);
  }

  if (parsed.shift) {
    const shiftLabel = parsed.shift.charAt(0).toUpperCase() + parsed.shift.slice(1);
    lines.push(`Bo'lim: ${shiftLabel}`);
  }

  if (parsed.period) {
    lines.push(`Para: ${parsed.period}`);
  }

  if (parsed.subject) {
    lines.push(`Fan: ${parsed.subject}`);
  }

  if (parsed.room) {
    lines.push(`Xona: ${parsed.room}`);
  }

  if (parsed.groups && parsed.groups.length > 0) {
    lines.push(`Guruhlar: ${parsed.groups.join(', ')}`);
  }

  if (parsed.teacher) {
    lines.push(`O'qituvchi: ${parsed.teacher}`);
  }

  if (parsed.type) {
    lines.push(`Turi: ${parsed.type}`);
  }

  return lines.join('\n');
}
