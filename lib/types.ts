// Dars jadvali uchun TypeScript tiplar

export type Day = 'dushanba' | 'seshanba' | 'chorshanba' | 'payshanba' | 'juma';

export type Shift = 'kunduzgi' | 'sirtqi' | 'kechki';

export type LessonType = "Ma'ruza" | 'Amaliy' | 'Seminar' | 'Laboratoriya';

export interface Lesson {
  id?: string;
  day: Day;
  shift: Shift;
  period: number;
  subject: string;
  room: string;
  teacher: string;
  groups: string[];
  type: LessonType;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface TimeSlot {
  period: number;
  time: string;
}

export interface ShiftSchedule {
  shift: Shift;
  label: string;
  times: TimeSlot[];
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface ParsedVoiceCommand {
  day?: Day;
  shift?: Shift;
  period?: number;
  subject?: string;
  room?: string;
  teacher?: string;
  groups?: string[];
  type?: LessonType;
  isComplete: boolean;
  missingFields: string[];
}
