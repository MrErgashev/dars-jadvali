'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Yangi versiya bor-yo'qligini tekshirish
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'activated' &&
                  navigator.serviceWorker.controller
                ) {
                  // Yangi versiya tayyor — sahifani yangilash kerak emas,
                  // keyingi safar ochilganda yangi cache ishlatiladi
                  console.log('Dars Jadvali: yangi versiya cache\'landi');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker ro\'yxatdan o\'tkazishda xatolik:', error);
        });
    }
  }, []);

  return null;
}
