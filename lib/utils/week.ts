// Hafta utility funksiyalari

/**
 * Sanani DD.MM.YYYY formatga o'zgartirish
 */
export function formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Sanani YYYY-MM-DD formatga o'zgartirish (URL va DB uchun)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD formatdagi stringni Date ga o'zgartirish
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Berilgan sana uchun hafta boshlanishi (Dushanba)ni topish
 * Agar dam olish kunlari bo'lsa, keyingi Dushanbani qaytaradi
 */
export function getWeekStartForDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0=Yakshanba ... 6=Shanba
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek; // 1=Dushanba ... 7=Yakshanba

  if (isoDay > 5) {
    // Dam olish kunlari - keyingi Dushanbaga o'tish
    const daysToNextMonday = 8 - isoDay;
    d.setDate(d.getDate() + daysToNextMonday);
  } else {
    // Ish kunlari - shu haftaning Dushanbasiga qaytish
    d.setDate(d.getDate() - (isoDay - 1));
  }

  return d;
}

/**
 * Hozirgi hafta boshlanishi (Dushanba)
 */
export function getCurrentWeekStart(): Date {
  return getWeekStartForDate(new Date());
}

/**
 * Hafta boshlanishidan 5 kunlik oraliqni hisoblash (Mon-Fri)
 */
export function getWeekRange(weekStart: Date): { start: Date; end: Date } {
  const start = new Date(weekStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Juma
  return { start, end };
}

/**
 * Hafta oralig'ini DD.MM.YYYY - DD.MM.YYYY formatda qaytarish
 */
export function getWeekRangeFormatted(weekStart: Date): { start: string; end: string } {
  const { start, end } = getWeekRange(weekStart);
  return {
    start: formatDateDDMMYYYY(start),
    end: formatDateDDMMYYYY(end),
  };
}

/**
 * Oldingi hafta boshlanishi
 */
export function getPreviousWeekStart(weekStart: Date): Date {
  const prev = new Date(weekStart);
  prev.setDate(prev.getDate() - 7);
  return prev;
}

/**
 * Keyingi hafta boshlanishi
 */
export function getNextWeekStart(weekStart: Date): Date {
  const next = new Date(weekStart);
  next.setDate(next.getDate() + 7);
  return next;
}

/**
 * Ikki sana bir haftadami tekshirish
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1 = getWeekStartForDate(date1);
  const week2 = getWeekStartForDate(date2);
  return formatDateISO(week1) === formatDateISO(week2);
}

/**
 * URL query parametridan hafta boshlanishini olish
 * Agar param yo'q yoki noto'g'ri bo'lsa, hozirgi haftani qaytaradi
 */
export function getWeekStartFromURL(searchParams: URLSearchParams): Date {
  const weekParam = searchParams.get('week');
  if (weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
    const parsed = parseISODate(weekParam);
    // Hafta boshlanishi ekanligini ta'minlash (Dushanba)
    return getWeekStartForDate(parsed);
  }
  return getCurrentWeekStart();
}

/**
 * Hafta boshlanishini URL query parametriga qo'shish
 */
export function updateURLWithWeek(weekStart: Date): void {
  const url = new URL(window.location.href);
  const currentWeekStart = getCurrentWeekStart();

  if (isSameWeek(weekStart, currentWeekStart)) {
    // Hozirgi hafta bo'lsa, parametrni o'chirish
    url.searchParams.delete('week');
  } else {
    url.searchParams.set('week', formatDateISO(weekStart));
  }

  window.history.replaceState({}, '', url.toString());
}
