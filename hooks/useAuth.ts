'use client';

import { useState } from 'react';
import { signIn } from '@/lib/firebase/auth';
import { useAuth as useAuthContext } from '@/context/AuthContext';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Noma'lum xatolik";

      // Firebase xatolarini o'zbekchaga tarjima qilish
      if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError("Noto'g'ri parol");
      } else if (errorMessage.includes('user-not-found')) {
        setError('Bu email topilmadi');
      } else if (errorMessage.includes('too-many-requests')) {
        setError("Ko'p urinish. Biroz kuting");
      } else if (errorMessage.includes('invalid-email')) {
        setError("Noto'g'ri email formati");
      } else {
        setError('Kirish xatosi');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, clearError: () => setError(null) };
}

// Re-export useAuth from context
export { useAuthContext as useAuth };
