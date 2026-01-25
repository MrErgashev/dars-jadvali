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
  period: number
): Promise<Lesson | null> {
  const firestore = checkFirebase();
  const q = query(
    collection(firestore, SCHEDULES_COLLECTION),
    where('day', '==', day),
    where('shift', '==', shift),
    where('period', '==', period)
  );
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
export async function saveLesson(lesson: Omit<Lesson, 'id' | 'updatedAt'>): Promise<string> {
  const firestore = checkFirebase();

  // Avval mavjud darsni tekshirish
  const existing = await getLesson(lesson.day, lesson.shift, lesson.period);

  const lessonData = {
    ...lesson,
    updatedAt: Timestamp.now(),
  };

  if (existing?.id) {
    // Mavjud darsni yangilash
    await updateDoc(doc(firestore, SCHEDULES_COLLECTION, existing.id), lessonData);
    return existing.id;
  } else {
    // Yangi dars qo'shish
    const docRef = await addDoc(collection(firestore, SCHEDULES_COLLECTION), lessonData);
    return docRef.id;
  }
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
