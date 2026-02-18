import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isConfigured } from './config';
import { Lesson, Day, Shift } from '../types';

const SCHEDULES_COLLECTION = 'schedules';

// Firebase konfiguratsiyasini tekshirish
function checkFirebase() {
  if (!isConfigured || !db) {
    throw new Error('Firebase sozlanmagan. .env.local fayliga Firebase ma\'lumotlarini qo\'shing.');
  }
  return db;
}

// Barcha darslarni olish
export async function getAllLessons(): Promise<Lesson[]> {
  const firestore = checkFirebase();
  const q = query(collection(firestore, SCHEDULES_COLLECTION));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  })) as Lesson[];
}

// Kun bo'yicha darslarni olish
export async function getLessonsByDay(day: Day): Promise<Lesson[]> {
  const firestore = checkFirebase();
  const q = query(
    collection(firestore, SCHEDULES_COLLECTION),
    where('day', '==', day)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  })) as Lesson[];
}

// Aniq darsni olish
export async function getLesson(
  day: Day,
  shift: Shift,
  period: number,
  weekStart?: string
): Promise<Lesson | null> {
  const firestore = checkFirebase();
  const constraints = [
    where('day', '==', day),
    where('shift', '==', shift),
    where('period', '==', period),
  ];
  if (weekStart) {
    constraints.push(where('weekStart', '==', weekStart));
  }
  const q = query(collection(firestore, SCHEDULES_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as Lesson;
}

// Yangi dars qo'shish yoki mavjudini yangilash
export async function saveLesson(lesson: Omit<Lesson, 'updatedAt'>): Promise<string> {
  const firestore = checkFirebase();

  const { id, ...lessonFields } = lesson;

  const lessonData = {
    ...lessonFields,
    updatedAt: Timestamp.now(),
  };

  if (id) {
    // Aniq darsni ID orqali yangilash
    const existingAtTime = await getLesson(lesson.day, lesson.shift, lesson.period, lesson.weekStart);
    if (existingAtTime?.id && existingAtTime.id !== id) {
      throw new Error("Tanlangan vaqtda boshqa dars mavjud");
    }

    await updateDoc(doc(firestore, SCHEDULES_COLLECTION, id), lessonData);
    return id;
  }

  // Avval mavjud darsni vaqt bo'yicha tekshirish
  const existing = await getLesson(lesson.day, lesson.shift, lesson.period, lesson.weekStart);
  if (existing?.id) {
    await updateDoc(doc(firestore, SCHEDULES_COLLECTION, existing.id), lessonData);
    return existing.id;
  }

  // Yangi dars qo'shish
  const docRef = await addDoc(collection(firestore, SCHEDULES_COLLECTION), lessonData);
  return docRef.id;
}

// Darsni o'chirish
export async function deleteLesson(id: string): Promise<void> {
  const firestore = checkFirebase();
  await deleteDoc(doc(firestore, SCHEDULES_COLLECTION, id));
}

// Darsni vaqt bo'yicha o'chirish
export async function deleteLessonByTime(
  day: Day,
  shift: Shift,
  period: number
): Promise<boolean> {
  const lesson = await getLesson(day, shift, period);
  if (lesson?.id) {
    await deleteLesson(lesson.id);
    return true;
  }
  return false;
}

// Real-time listener
export function subscribeLessons(
  callback: (lessons: Lesson[]) => void
): Unsubscribe {
  if (!isConfigured || !db) {
    // Agar Firebase sozlanmagan bo'lsa, bo'sh array qaytarish
    callback([]);
    return () => {};
  }

  const q = query(collection(db, SCHEDULES_COLLECTION));

  return onSnapshot(q, (snapshot) => {
    const lessons = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    })) as Lesson[];

    callback(lessons);
  }, (error) => {
    console.error('Firebase listener error:', error);
    callback([]);
  });
}

// Jadvalga ko'p dars qo'shish (bulk)
export async function saveManyLessons(
  lessons: Omit<Lesson, 'id' | 'updatedAt'>[]
): Promise<void> {
  const promises = lessons.map((lesson) => saveLesson(lesson));
  await Promise.all(promises);
}

// Barcha darslarni o'chirish (ehtiyotkor bo'ling!)
export async function clearAllLessons(): Promise<void> {
  const firestore = checkFirebase();
  const snapshot = await getDocs(collection(firestore, SCHEDULES_COLLECTION));
  const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(promises);
}

// Hafta bo'yicha darslarni olish
// Agar weekStart null bo'lsa, weekStart field'siz (legacy) darslarni oladi
export async function getLessonsByWeek(weekStart: string | null): Promise<Lesson[]> {
  const firestore = checkFirebase();

  let q;
  if (weekStart === null) {
    // Legacy data (weekStart field'siz)
    // Firebase'da "field mavjud emas" query qilish murakkab,
    // shuning uchun barcha darslarni olib, client-side filter qilamiz
    q = query(collection(firestore, SCHEDULES_COLLECTION));
  } else {
    q = query(
      collection(firestore, SCHEDULES_COLLECTION),
      where('weekStart', '==', weekStart)
    );
  }

  const snapshot = await getDocs(q);

  let lessons = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  })) as Lesson[];

  // Legacy data uchun client-side filter
  if (weekStart === null) {
    lessons = lessons.filter((lesson) => !lesson.weekStart);
  }

  return lessons;
}

// Bir haftadan boshqa haftaga darslarni ko'chirish
export async function copyLessonsToWeek(
  sourceWeekStart: string | null, // null = legacy data (weekStart yo'q)
  targetWeekStart: string
): Promise<{ copied: number; skipped: number }> {
  const firestore = checkFirebase();

  // Manba haftasining darslarini olish
  const sourceLessons = await getLessonsByWeek(sourceWeekStart);

  if (sourceLessons.length === 0) {
    return { copied: 0, skipped: 0 };
  }

  // Maqsad haftasida mavjud darslarni tekshirish (duplikatlarni oldini olish)
  const targetLessons = await getLessonsByWeek(targetWeekStart);
  const targetSlots = new Set(
    targetLessons.map((l) => `${l.day}-${l.shift}-${l.period}`)
  );

  let copied = 0;
  let skipped = 0;

  const promises: Promise<void>[] = [];

  for (const lesson of sourceLessons) {
    const slotKey = `${lesson.day}-${lesson.shift}-${lesson.period}`;

    if (targetSlots.has(slotKey)) {
      // Bu slotda allaqachon dars bor
      skipped++;
      continue;
    }

    // Yangi dars yaratish (id'siz, weekStart bilan)
    const newLesson = {
      day: lesson.day,
      shift: lesson.shift,
      period: lesson.period,
      subject: lesson.subject,
      room: lesson.room,
      teacher: lesson.teacher,
      groups: lesson.groups,
      type: lesson.type,
      weekStart: targetWeekStart,
      updatedAt: Timestamp.now(),
    };

    promises.push(
      addDoc(collection(firestore, SCHEDULES_COLLECTION), newLesson).then(() => {
        copied++;
      })
    );
  }

  await Promise.all(promises);

  return { copied, skipped };
}
