import { Day, Shift, LessonType, ShiftSchedule } from './types';

// Kunlar
export const DAYS: { value: Day; label: string }[] = [
  { value: 'dushanba', label: 'Dushanba' },
  { value: 'seshanba', label: 'Seshanba' },
  { value: 'chorshanba', label: 'Chorshanba' },
  { value: 'payshanba', label: 'Payshanba' },
  { value: 'juma', label: 'Juma' },
];

// Bo'limlar va vaqtlar
export const SHIFTS: ShiftSchedule[] = [
  {
    shift: 'kunduzgi',
    label: 'Kunduzgi',
    times: [
      { period: 1, time: '08:30' },
      { period: 2, time: '10:00' },
      { period: 3, time: '12:00' },
    ],
  },
  {
    shift: 'sirtqi',
    label: 'Sirtqi',
    times: [
      { period: 1, time: '13:30' },
      { period: 2, time: '15:00' },
      { period: 3, time: '16:30' },
    ],
  },
  {
    shift: 'kechki',
    label: 'Kechki',
    times: [
      { period: 1, time: '18:00' },
      { period: 2, time: '19:30' },
    ],
  },
];

// Dars turlari
export const LESSON_TYPES: LessonType[] = ["Ma'ruza", 'Amaliy', 'Seminar', 'Laboratoriya'];

// Bo'lim nomlari (parser uchun) - O'zbek + Rus
export const SHIFT_NAMES: Record<Shift, string[]> = {
  kunduzgi: ['kunduzgi', 'kunduzi', 'ertalab', 'дневной', 'дневное', 'утро', 'утренний'],
  sirtqi: ['sirtqi', 'tushdan keyin', 'tushlik', 'заочный', 'заочное', 'дневной после обеда'],
  kechki: ['kechki', 'kechqurun', 'oqshom', 'вечерний', 'вечернее', 'вечер'],
};

// Kun nomlari (parser uchun) - O'zbek + Rus
export const DAY_NAMES: Record<Day, string[]> = {
  dushanba: ['dushanba', 'dushanbaga', 'понедельник', 'monday'],
  seshanba: ['seshanba', 'seshanbaga', 'вторник', 'tuesday'],
  chorshanba: ['chorshanba', 'chorshanbaga', 'среда', 'wednesday'],
  payshanba: ['payshanba', 'payshanbaga', 'четверг', 'thursday'],
  juma: ['juma', 'jumaga', 'пятница', 'friday'],
};

// Dars turi nomlari (parser uchun) - O'zbek + Rus
export const LESSON_TYPE_NAMES: Record<LessonType, string[]> = {
  "Ma'ruza": ["ma'ruza", 'maruza', 'leksiya', 'лекция', 'lecture'],
  Amaliy: ['amaliy', 'amaliyot', 'praktika', 'практика', 'практический', 'practical'],
  Seminar: ['seminar', 'seminari', 'семинар', 'seminar'],
  Laboratoriya: ['laboratoriya', 'lab', 'labaratoriya', 'лаборатория', 'лабораторная', 'laboratory'],
};

// Para raqamlari
export const PERIOD_PATTERNS = [
  /(\d+)\s*[-\s]?\s*para/i,
  /(\d+)\s*[-\s]?\s*paraga/i,
  /birinchi\s*para/i,
  /ikkinchi\s*para/i,
  /uchinchi\s*para/i,
];

// Xona pattern (JM403, A101, etc.)
export const ROOM_PATTERN = /\b([A-Za-z]{1,3}\d{3}[A-Za-z]?)\b/g;

// Guruh pattern (JM403, IT201, etc.)
export const GROUP_PATTERN = /\b([A-Za-z]{2,3}\d{3})\b/g;
