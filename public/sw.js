const CACHE_NAME = 'dars-jadvali-v1';

// Cache qilinadigan statik resurslar
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/admin/login',
];

// Service Worker o'rnatilganda - statik resurslarni cache qilish
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Yangi SW darhol faollashsin
  self.skipWaiting();
});

// Faollashganda - eski cache'larni o'chirish
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Barcha ochiq tab'larda darhol ishlashni boshlash
  self.clients.claim();
});

// Fetch strategiyasi: Network First, Cache Fallback
// Internet bo'lsa - serverdan oladi va cache'ni yangilaydi
// Internet yo'q bo'lsa - cache'dan ko'rsatadi
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Firebase API, analytics va boshqa tashqi so'rovlarni cache qilmaymiz
  if (
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('firebase') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('google-analytics') ||
    request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Muvaffaqiyatli javobni cache'ga saqlash
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Internet yo'q - cache'dan ko'rsatish
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Agar navigatsiya so'rovi bo'lsa va cache'da yo'q bo'lsa - asosiy sahifani ko'rsatish
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
