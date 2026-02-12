import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase konfiguratsiya
// .env.local faylidan olinadi
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase konfiguratsiya mavjudligini tekshirish
const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  // Firebase ilovasini ishga tushirish (agar hali ishga tushmagan bo'lsa)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Firestore va Auth
  db = getFirestore(app);
  auth = getAuth(app);

  // Offline persistence - ma'lumotlarni IndexedDB'da saqlash
  // Internet yo'q bo'lganda oxirgi yuklangan ma'lumotlar ko'rinadi
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Bir nechta tab ochiq - faqat bittasida ishlaydi
        console.warn('Firestore offline persistence: faqat bitta tabda ishlaydi');
      } else if (err.code === 'unimplemented') {
        // Browser qo'llab-quvvatlamaydi
        console.warn('Firestore offline persistence: browser qo\'llab-quvvatlamaydi');
      }
    });
  }
}

export { db, auth, isConfigured };
export default app;
