import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isConfigured } from './config';

// Login
export async function signIn(
  email: string,
  password: string
): Promise<User> {
  if (!isConfigured || !auth) {
    throw new Error('Firebase sozlanmagan. .env.local fayliga Firebase ma\'lumotlarini qo\'shing.');
  }
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Logout
export async function signOut(): Promise<void> {
  if (!isConfigured || !auth) {
    return;
  }
  await firebaseSignOut(auth);
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!isConfigured || !auth) {
    // Agar Firebase sozlanmagan bo'lsa, null qaytarish
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Hozirgi foydalanuvchi
export function getCurrentUser(): User | null {
  if (!isConfigured || !auth) {
    return null;
  }
  return auth.currentUser;
}
