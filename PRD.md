# PRD: Dars Jadvali — Mobil Ilova

## 1. Muammo tavsifi

Hozirgi veb-saytda faqat bitta admin dars jadvalini kiritadi, boshqalar esa faqat ko'radi. Talabalar va o'qituvchilar o'z jadvallarini kirita olmaydi. Bundan tashqari, foydalanuvchilar jadvalga tez kirishni xohlaydi — brauzer ochib, sayt manzilini yozish noqulay. Mobil ilova orqali har bir foydalanuvchi bir tegish bilan o'z jadvaliga kirishi va boshqarishi kerak.

## 2. Maqsad

Har qanday foydalanuvchi telefonga ilovani o'rnatib, ro'yxatdan o'tib, o'zining shaxsiy dars jadvalini yaratishi, tahrirlashi va boshqalarga ulashishi mumkin bo'lgan mobil ilova yaratish. Ilova Android va iOS platformalarida ishlaydi.

## 3. Texnologiya tanlovi

| Texnologiya | Tanlov | Sabab |
|-------------|--------|-------|
| **Framework** | React Native + Expo | Hozirgi loyiha React/TypeScript — jamoa bilimi qayta ishlatiladi |
| **Til** | TypeScript | Hozirgi loyihada ishlatilmoqda, type-safety ta'minlaydi |
| **Backend** | Firebase (Firestore + Auth + Cloud Messaging) | Hozirgi loyihada Firebase ishlatilmoqda, migratsiya oson |
| **Navigatsiya** | Expo Router (file-based) | Next.js App Router ga o'xshash, o'rganish oson |
| **State** | Zustand | Yengil, React Native uchun optimallashgan |
| **UI kutubxona** | React Native Paper yoki Tamagui | Material Design, dark/light tema tayyor |
| **Bildirishnomalar** | Firebase Cloud Messaging (FCM) | Push notification Android va iOS uchun |
| **Oflayn** | Firestore offline persistence | Internet yo'qda ham jadval ko'rinadi |
| **Do'konga joylashtirish** | EAS Build + EAS Submit (Expo) | Google Play va App Store ga oson deploy |

## 4. Foydalanuvchi turlari

| Tur | Tavsif |
|-----|--------|
| **Mehmon** | Ilovani o'rnatgan, lekin ro'yxatdan o'tmagan. Faqat ommaviy jadvallarni ko'ra oladi |
| **Foydalanuvchi** | Ro'yxatdan o'tgan. O'z jadvallarini yaratadi, tahrirlaydi, boshqalarga ulashadi |
| **Admin** | Tizimni boshqaradi. Barcha foydalanuvchilar va jadvallarni moderatsiya qiladi |

## 5. Funksional talablar

### 5.1 Autentifikatsiya

- **Ro'yxatdan o'tish ekrani**
  - Ism-familiya
  - Email
  - Parol (kamida 6 belgi)
  - Rol tanlash: O'qituvchi / Talaba / Kafedra mudiri / Boshqa
  - Universitet / Fakultet (ixtiyoriy)
- **Kirish ekrani**
  - Email + parol
  - "Parolni unutdim" — email orqali tiklash
  - "Meni eslab qol" — avtomatik kirish (token saqlash)
- **Ijtimoiy tarmoq orqali kirish (keyingi versiyada)**
  - Google Sign-In
  - Telegram Login

### 5.2 Bosh ekran (Home)

Ilovaga kirganda foydalanuvchi ko'radi:

- **Ommaviy jadvallar** — boshqa foydalanuvchilarning ochiq jadvallari
  - Kartochka ko'rinishida vertikal ro'yxat
  - Har bir kartochkada: jadval nomi, muallif, universitet, sana
  - Tegish bilan jadval ochiladi
- **Qidiruv paneli** — jadvallarni nom, muallif yoki universitet bo'yicha izlash
- **Kategoriyalar** — universitetlar yoki fakultetlar bo'yicha filtrlash

### 5.3 Mening jadvallarim (My Schedules)

Ro'yxatdan o'tgan foydalanuvchi uchun:

- Barcha shaxsiy jadvallar ro'yxati
- Har bir jadval uchun:
  - **Nomi** (masalan: "3-kurs Informatika", "Bahor semestri 2026")
  - **Holati**: Ochiq (public) / Yopiq (private) — toggle bilan o'zgartirish
  - **Yaratilgan sana**
  - Tezkor amallar: tahrirlash, o'chirish, ulashish, nusxalash
- **"+" tugmasi** — yangi jadval yaratish (FAB — Floating Action Button)
- Bo'sh holat: "Hali jadvalingiz yo'q. Birinchisini yarating!" xabari + tugma

### 5.4 Jadval yaratish va tahrirlash

#### Yangi jadval yaratish
- Jadval nomi (majburiy)
- Tavsif (ixtiyoriy)
- Ko'rinish holati: Ochiq / Yopiq
- Smenalar sozlash: Kunduzgi / Sirtqi / Kechki (ixtiyoriy tanlash)
- Kunlar: Dushanba–Juma (standart), Shanba qo'shish mumkin

#### Dars kiritish — 2 usul

**1-usul: Qo'lda kiritish**
- Kunni tanlash (horizontal tab bar)
- Smenani tanlash (segment control)
- Bo'sh para ustiga tegish → yangi dars formi ochiladi:
  - Fan nomi
  - Xona raqami
  - O'qituvchi
  - Guruhlar (ko'p tanlash mumkin)
  - Dars turi: Ma'ruza / Amaliy / Seminar / Laboratoriya
- "Barcha kunlarga qo'llash" tugmasi — bitta darsni 5 kunga birdan qo'shish

**2-usul: Ovozli kiritish**
- Mikrofon tugmasi — telefon mikrofonidan ovoz yozish
- O'zbek tilida gapirilgan buyruqni parsing qilish
  - Masalan: "Seshanba kunduzgi 2-para Fizika JM201 Karimov ma'ruza"
- Natijani oldindan ko'rsatish (preview) → tasdiqlash yoki tahrirlash

#### Tahrirlash
- Mavjud dars ustiga tegish → tahrirlash bottom sheet ochiladi
- Swipe left → o'chirish (confirmation bilan)
- Drag & drop bilan darslarni qayta joylashtirish (keyingi versiyada)

### 5.5 Jadval ko'rish ekrani

- **Kunlik ko'rinish** — bitta kunning barcha smenalari
- **Haftalik ko'rinish** — 5 kunlik to'liq jadval (horizontal scroll)
- Hafta navigatsiyasi: oldingi/keyingi hafta o'qlar bilan
- Har bir dars kartochkasi:
  - Fan nomi (katta shrift)
  - Xona, o'qituvchi
  - Guruhlar
  - Dars turi rangli belgi bilan (Ma'ruza=ko'k, Amaliy=yashil, Seminar=sariq, Lab=qizil)
- **Haftani nusxalash** — bir haftaning jadvalini boshqa haftaga ko'chirish

### 5.6 Jadvallarni ulashish

- Har bir ochiq jadvalning unikal deep link havolasi
  - Format: `darsjadvali.app/s/{qisqa_kod}`
  - Ilova o'rnatilgan bo'lsa — ilovada ochiladi (deep linking)
  - Ilovada o'rnatilmagan bo'lsa — veb versiyaga yo'naltiradi
- **Ulashish tugmasi** — Android/iOS native share sheet ochiladi
  - Telegram, WhatsApp, SMS va boshqa ilovalarga yuborish
- **QR kod** — har bir jadval uchun QR kod generatsiya qilish
  - Boshqa foydalanuvchi telefon kamerasi bilan skanerlab ochadi
- **Jadval nusxalash** — boshqa foydalanuvchining ochiq jadvalini o'ziga nusxalash

### 5.7 Eksport

- **Rasm sifatida saqlash** — jadval screenshot PNG formatda telefonning galereyasiga saqlanadi
- **PDF sifatida saqlash** — jadval PDF formatda saqlanadi yoki ulashiladi
- **Kalendarnga qo'shish** — darslarni telefon kalendar ilovasiga eksport (`.ics` format)

### 5.8 Bildirishnomalar (Push Notifications)

- **Dars eslatmasi** — har bir darsdan 15/30/60 daqiqa oldin bildirishnoma
  - Foydalanuvchi eslatma vaqtini sozlaydi
  - Bildirishnomada: fan nomi, xona, qolgan vaqt
- **Jadval o'zgarishi** — kuzatayotgan jadvalda o'zgarish bo'lsa xabar
- **Tizim xabarlari** — yangilanishlar, texnik ishlar haqida

### 5.9 Oflayn rejim

- Firestore offline persistence yoqilgan
- Oxirgi yuklangan jadvallar internet yo'qda ham ko'rinadi
- Oflayn kiritilgan o'zgarishlar internet qaytganda avtomatik sinxronlanadi
- Oflayn holatda ekranning yuqorisida "Oflayn rejim" indikatori ko'rinadi

### 5.10 Profil ekrani

- Foydalanuvchi ma'lumotlari: ism, email, rol, universitet
- Ma'lumotlarni tahrirlash
- Parolni o'zgartirish
- Ilova sozlamalari:
  - Til: O'zbek / Rus / Ingliz
  - Tema: Yorug' / Qorong'u / Tizim bo'yicha
  - Bildirishnoma sozlamalari
  - Standart smena tanlash (kunduzgi/sirtqi/kechki)
- Akkauntni o'chirish
- Chiqish (Logout)

### 5.11 Admin panel (ilova ichida)

Admin roli bo'lgan foydalanuvchilar uchun qo'shimcha tab:

- **Foydalanuvchilar boshqaruvi**
  - Ro'yxat: ism, email, rol, jadvallar soni, ro'yxatdan o'tgan sana
  - Foydalanuvchini bloklash/faollashtirish
  - Foydalanuvchini o'chirish
- **Jadvallar moderatsiyasi**
  - Barcha ommaviy jadvallar ro'yxati
  - Noto'g'ri kontentni yashirish/o'chirish
  - Shikoyat qilingan jadvallarni ko'rish
- **Statistika**
  - Jami foydalanuvchilar (grafik bilan)
  - Jami jadvallar
  - Kunlik/haftalik faol foydalanuvchilar
  - Eng mashhur jadvallar

## 6. Ekranlar xaritasi (Screen Map)

```
Ilova ochiladi
├── Onboarding (birinchi marta)
│   ├── 1-ekran: "Dars jadvalingizni yarating"
│   ├── 2-ekran: "Boshqalar bilan ulashing"
│   ├── 3-ekran: "Bildirishnomalar oling"
│   └── "Boshlash" tugmasi
│
├── Auth oqimi (tizimga kirmagan)
│   ├── Kirish ekrani
│   ├── Ro'yxatdan o'tish ekrani
│   └── Parolni tiklash ekrani
│
└── Asosiy ilova (Bottom Tab Navigator)
    ├── Tab 1: Bosh ekran (Home)
    │   ├── Ommaviy jadvallar ro'yxati
    │   ├── Qidiruv
    │   └── Jadval ko'rish ekrani (stack)
    │
    ├── Tab 2: Mening jadvallarim
    │   ├── Jadvallar ro'yxati
    │   ├── Jadval yaratish ekrani (stack)
    │   ├── Jadval tahrirlash ekrani (stack)
    │   │   ├── Qo'lda kiritish
    │   │   └── Ovozli kiritish
    │   └── Jadval ko'rish ekrani (stack)
    │
    ├── Tab 3: Bildirishnomalar
    │   └── Bildirishnomalar ro'yxati
    │
    ├── Tab 4: Profil
    │   ├── Profil ma'lumotlari
    │   ├── Sozlamalar
    │   └── Admin panel (faqat admin uchun)
    │       ├── Foydalanuvchilar
    │       ├── Jadvallar
    │       └── Statistika
    │
    └── Floating Action Button: "+" yangi jadval yaratish
```

## 7. Ma'lumotlar bazasi strukturasi (Firestore)

### 7.1 Kolleksiyalar

```
users (kolleksiya)
└── {userId} (hujjat)
    ├── displayName: string
    ├── email: string
    ├── role: 'teacher' | 'student' | 'head' | 'other'
    ├── university: string (ixtiyoriy)
    ├── faculty: string (ixtiyoriy)
    ├── avatarUrl: string (ixtiyoriy)
    ├── isAdmin: boolean
    ├── isBlocked: boolean
    ├── pushToken: string (FCM token)
    ├── settings: {
    │   ├── language: 'uz' | 'ru' | 'en'
    │   ├── theme: 'light' | 'dark' | 'system'
    │   ├── defaultShift: 'kunduzgi' | 'sirtqi' | 'kechki'
    │   └── reminderMinutes: number (15 | 30 | 60)
    │ }
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp

timetables (kolleksiya)
└── {timetableId} (hujjat)
    ├── ownerId: string
    ├── ownerName: string (denormalized)
    ├── name: string
    ├── description: string
    ├── visibility: 'public' | 'private'
    ├── shortCode: string (unikal, 6 belgili)
    ├── university: string (denormalized, qidiruv uchun)
    ├── days: string[] (masalan: ['dushanba', 'seshanba', ...])
    ├── shifts: string[] (masalan: ['kunduzgi', 'sirtqi'])
    ├── viewCount: number
    ├── reportCount: number
    ├── isHidden: boolean (admin tomonidan yashirilgan)
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp

lessons (kolleksiya)
└── {lessonId} (hujjat)
    ├── timetableId: string
    ├── day: string
    ├── shift: string
    ├── period: number
    ├── subject: string
    ├── room: string
    ├── teacher: string
    ├── groups: string[]
    ├── type: 'maruza' | 'amaliy' | 'seminar' | 'laboratoriya'
    ├── weekStart: string (ixtiyoriy, YYYY-MM-DD)
    └── updatedAt: Timestamp

notifications (kolleksiya)
└── {notificationId} (hujjat)
    ├── userId: string
    ├── type: 'reminder' | 'schedule_change' | 'system'
    ├── title: string
    ├── body: string
    ├── timetableId: string (ixtiyoriy)
    ├── isRead: boolean
    ├── createdAt: Timestamp
    └── readAt: Timestamp (ixtiyoriy)

reports (kolleksiya)
└── {reportId} (hujjat)
    ├── reporterId: string
    ├── timetableId: string
    ├── reason: string
    ├── status: 'pending' | 'reviewed' | 'resolved'
    ├── createdAt: Timestamp
    └── reviewedAt: Timestamp (ixtiyoriy)
```

### 7.2 Firestore xavfsizlik qoidalari

```
users:
  - O'qish: faqat o'zi yoki admin
  - Yaratish: faqat o'zi (ro'yxatdan o'tishda)
  - Yangilash: faqat o'zi (profil), admin (bloklash)

timetables:
  - O'qish: visibility == 'public' && isHidden == false → hammaga;
            private → faqat egasiga; admin → hammaga
  - Yaratish: autentifikatsiya qilingan foydalanuvchi
  - Yangilash/O'chirish: faqat egasi yoki admin

lessons:
  - O'qish: tegishli timetable qoidalariga bog'liq
  - Yozish: faqat timetable egasi yoki admin

notifications:
  - O'qish: faqat o'zi
  - Yaratish: tizim (Cloud Functions orqali)

reports:
  - Yaratish: autentifikatsiya qilingan foydalanuvchi
  - O'qish: faqat admin
```

## 8. API va Cloud Functions

Firebase Cloud Functions (serverless) quyidagi vazifalar uchun:

| Funksiya | Trigger | Vazifasi |
|----------|---------|----------|
| `onUserCreate` | Auth trigger | Yangi foydalanuvchi uchun `users` hujjat yaratish |
| `onTimetableUpdate` | Firestore trigger | Jadval o'zgarganda kuzatuvchilarga push notification yuborish |
| `sendReminder` | Scheduled (cron) | Har 15 daqiqada kelasi darslar uchun eslatma yuborish |
| `generateShortCode` | HTTPS callable | Jadval uchun unikal qisqa kod generatsiya qilish |
| `reportTimetable` | HTTPS callable | Jadvalga shikoyat yuborish |
| `cleanupDeletedUsers` | Scheduled | O'chirilgan foydalanuvchilar ma'lumotlarini tozalash |

## 9. Migratsiya rejasi

Hozirgi veb-saytdagi ma'lumotlarni mobil ilova uchun tayyorlash:

1. Hozirgi admin uchun `users` hujjati yaratish
2. Hozirgi jadval uchun `timetables` hujjati yaratish (admin egasi sifatida)
3. `schedules` kolleksiyasidagi barcha darslarni `lessons` ga ko'chirish, `timetableId` maydon qo'shib
4. Eski `schedules` kolleksiyasini saqlab qolish (orqaga qaytish uchun)
5. Veb-sayt yangi `lessons` kolleksiyasiga ulash yoki parallel ishlashni ta'minlash
6. Veb va mobil bitta Firebase loyihasini ishlatadi — ma'lumotlar real-time sinxronlashadi

## 10. Loyiha strukturasi (Expo)

```
dars-jadvali-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout (providers)
│   ├── index.tsx                 # Bosh ekran
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── home.tsx              # Ommaviy jadvallar
│   │   ├── my-schedules.tsx      # Mening jadvallarim
│   │   ├── notifications.tsx     # Bildirishnomalar
│   │   └── profile.tsx           # Profil
│   ├── schedule/
│   │   ├── [id].tsx              # Jadval ko'rish
│   │   ├── create.tsx            # Yangi jadval
│   │   └── edit/[id].tsx         # Jadval tahrirlash
│   └── admin/
│       ├── users.tsx
│       ├── timetables.tsx
│       └── stats.tsx
│
├── components/
│   ├── schedule/
│   │   ├── ScheduleGrid.tsx
│   │   ├── DayView.tsx
│   │   ├── WeekView.tsx
│   │   ├── LessonCard.tsx
│   │   └── LessonForm.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── BottomSheet.tsx
│   │   └── EmptyState.tsx
│   └── voice/
│       └── VoiceInput.tsx
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── storage.ts
│   ├── voice/
│   │   └── parser.ts             # Hozirgi veb loyihadan qayta ishlatiladi
│   ├── utils/
│   │   └── week.ts               # Hozirgi veb loyihadan qayta ishlatiladi
│   └── types.ts
│
├── store/
│   ├── authStore.ts              # Zustand
│   ├── scheduleStore.ts
│   └── settingsStore.ts
│
├── hooks/
│   ├── useSchedule.ts
│   ├── useTimetables.ts
│   └── useNotifications.ts
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── app.json                      # Expo konfiguratsiya
├── eas.json                      # EAS Build konfiguratsiya
├── package.json
└── tsconfig.json
```

## 11. UI/UX talablar

### 11.1 Umumiy dizayn tamoyillari

- **Material Design 3** asosida (Android) va iOS native hissiyoti
- Dark / Light / System tema
- O'zbek tilida interfeys (Rus va Ingliz til keyingi versiyada)
- Barcha ekranlarda skeleton loading
- Pull-to-refresh barcha ro'yxatlarda
- Haptic feedback muhim amallar uchun (o'chirish, saqlash)

### 11.2 Ranglar (dars turlari)

| Dars turi | Rang |
|-----------|------|
| Ma'ruza | Ko'k (#3B82F6) |
| Amaliy | Yashil (#10B981) |
| Seminar | Sariq (#F59E0B) |
| Laboratoriya | Qizil (#EF4444) |

### 11.3 Animatsiyalar

- Ekranlar orasida silliq o'tish (shared element transitions)
- Ro'yxat elementlari paydo bo'lishda fade-in
- FAB tugmasining pulse animatsiyasi (bo'sh holatda)
- Swipe amallar uchun spring animatsiyalar

### 11.4 Onboarding (birinchi ochilishda)

3 ta slayd:
1. "Dars jadvalingizni osongina yarating" — jadval rasm bilan
2. "Do'stlaringiz bilan ulashing" — ulashish rasm bilan
3. "Darslaringizni o'tkazib yubormang" — bildirishnoma rasm bilan

Keyin: "Ro'yxatdan o'tish" yoki "Mehmon sifatida davom etish"

## 12. Do'konga joylash talablari

### 12.1 Google Play Store

- **Ilova nomi**: Dars Jadvali
- **Kategoriya**: Education / Ta'lim
- **Minimal Android versiya**: Android 7.0 (API 24)
- **Privacy Policy** sahifasi (Firebase ma'lumotlar uchun)
- **Skrinshot**lar: kamida 4 ta ekran rasmi
- **Ilova tavsifi** o'zbek va ingliz tilida

### 12.2 Apple App Store (keyingi bosqichda)

- **Minimal iOS versiya**: iOS 15.0
- **App Review Guidelines** ga moslash
- **Apple Developer Account** kerak ($99/yil)

## 13. Bosqichlar

### Bosqich 1: Asos (2 hafta)
- Expo loyiha yaratish va sozlash
- Firebase ulash (hozirgi loyiha)
- Autentifikatsiya (ro'yxatdan o'tish, kirish, chiqish)
- Navigatsiya tuzilmasi (tab bar, stack navigator)
- Profil ekrani

### Bosqich 2: Jadval boshqaruvi (2 hafta)
- Jadval yaratish/tahrirlash/o'chirish
- Dars kiritish formasi (qo'lda)
- Jadval ko'rish (kunlik + haftalik)
- "Mening jadvallarim" ekrani
- Haftani nusxalash

### Bosqich 3: Ovozli kiritish va eksport (1 hafta)
- Ovozli kiritish integratsiyasi (hozirgi parser qayta ishlatiladi)
- PDF/rasm eksport
- Kalendarga eksport (.ics)

### Bosqich 4: Ulashish va ommaviy (1 hafta)
- Ommaviy jadvallar bosh ekrani
- Qidiruv funksiyasi
- Deep linking
- QR kod generatsiya
- Native share sheet

### Bosqich 5: Bildirishnomalar (1 hafta)
- FCM integratsiya
- Dars eslatmalari (Cloud Functions)
- Jadval o'zgarishi xabarlari
- Bildirishnomalar ekrani

### Bosqich 6: Admin va polish (1 hafta)
- Admin panel (foydalanuvchilar, jadvallar, statistika)
- Shikoyat tizimi
- Onboarding ekranlar
- Oflayn rejim tekshirish
- Performance optimizatsiya

### Bosqich 7: Do'konga joylashtirish (1 hafta)
- EAS Build sozlash
- Google Play Store uchun tayyorlash
- Beta testing (ichki test guruhi)
- Birinchi versiyani chiqarish (v1.0.0)

## 14. Qayta ishlatish — veb loyihadan nima olinadi

Hozirgi `dars-jadvali` veb loyihasidan quyidagilar to'g'ridan-to'g'ri qayta ishlatiladi:

| Fayl / modul | Joylashuvi | Qayta ishlatish |
|--------------|-----------|-----------------|
| Voice parser | `lib/voice/parser.ts` | To'liq — ovoz buyruqlarini parsing |
| Week utils | `lib/utils/week.ts` | To'liq — hafta hisoblash funksiyalari |
| Types | `lib/types.ts` | Kengaytirilib ishlatiladi |
| Constants | `lib/constants.ts` | To'liq — kunlar, smenalar, dars turlari |
| Firebase config | `lib/firebase/config.ts` | Bir xil Firebase loyiha — config umumiy |
| Firestore CRUD | `lib/firebase/db.ts` | Asos sifatida — yangi kolleksiyalarga moslashtiriladi |

## 15. Muvaffaqiyat mezonlari

- Foydalanuvchi 1 daqiqada ro'yxatdan o'tib, birinchi jadvalini yarata oladi
- Ilova 2 soniyadan kam vaqtda ochiladi (cold start)
- Jadval yuklanishi 1 soniyadan kam
- Oflayn rejimda jadval ko'rinadi
- Push bildirishnoma darsdan keyin emas, oldin keladi
- Google Play Store ga muvaffaqiyatli joylashtiriladi
- Birinchi oyda kamida 100 ta foydalanuvchi
