# PRD: Ko'p foydalanuvchili dars jadvali tizimi

## 1. Muammo tavsifi

Hozirgi tizimda faqat bitta admin dars jadvalini kiritadi va boshqa foydalanuvchilar uni ko'radi. Boshqa o'qituvchilar, talabalar yoki kafedra mudirlari o'z dars jadvallarini kirita olmaydi. Har bir foydalanuvchi o'z jadvalini mustaqil boshqarishi uchun tizimni kengaytirish kerak.

## 2. Maqsad

Har qanday foydalanuvchi ro'yxatdan o'tib, o'zining shaxsiy dars jadvalini yaratishi, tahrirlashi va boshqalarga ulashishi mumkin bo'lgan ochiq tizim yaratish.

## 3. Foydalanuvchi turlari

| Tur | Tavsif |
|-----|--------|
| **Mehmon** | Ro'yxatdan o'tmagan. Faqat ulashilgan (public) jadvallarni ko'ra oladi |
| **Ro'yxatdan o'tgan foydalanuvchi** | O'z jadvallarini yaratadi, tahrirlaydi, o'chiradi. Jadvallarni public/private qiladi |
| **Admin** | Tizimni boshqaradi. Barcha foydalanuvchilar va jadvallarni ko'ra oladi |

## 4. Funksional talablar

### 4.1 Autentifikatsiya tizimini kengaytirish

**Hozirgi holat:** Faqat admin email/parol bilan kiradi.

**Yangi talablar:**

- **Ro'yxatdan o'tish sahifasi** (`/register`)
  - Ism-familiya
  - Email
  - Parol (kamida 6 belgi)
  - Rol tanlash: O'qituvchi / Talaba / Kafedra mudiri / Boshqa
  - Fakultet/kafedra (ixtiyoriy)
- **Kirish sahifasi** (`/login`)
  - Email + parol
  - "Parolni unutdim" funksiyasi
- **Profil sahifasi** (`/profile`)
  - Ism, email, rol, fakultet ma'lumotlarini ko'rish va tahrirlash
  - Parolni o'zgartirish
  - Akkauntni o'chirish

### 4.2 Shaxsiy dars jadvali

**Hozirgi holat:** Bitta umumiy jadval bor, admin boshqaradi.

**Yangi talablar:**

- Har bir foydalanuvchi bir nechta jadval yaratishi mumkin
- Har bir jadval uchun:
  - **Nomi** (masalan: "3-kurs Informatika", "2024-yil bahor semestri")
  - **Tavsif** (ixtiyoriy)
  - **Ko'rinish holati**: Ochiq (public) yoki Yopiq (private)
  - **Haftalik jadval** — hozirgi tizim kabi 5 kun, 3 ta smena, para raqamlari
- Jadval egasi o'z jadvalini to'liq boshqaradi (CRUD)
- Mavjud xususiyatlar saqlanadi:
  - Ovozli kiritish
  - Qo'lda kiritish formasi
  - Haftani nusxalash
  - PDF/JPEG eksport

### 4.3 Jadvallarni ulashish

- Har bir ochiq (public) jadvalning unikal URL manzili bo'ladi
  - Format: `/schedule/{foydalanuvchi_id}/{jadval_id}`
  - Yoki qisqa havola: `/s/{qisqa_kod}`
- Mehmonlar va boshqa foydalanuvchilar ochiq jadvallarni ko'ra oladi
- Yopiq (private) jadvallarni faqat egasi ko'ra oladi
- Jadval egasi havolani nusxalash tugmasi orqali ulasha oladi

### 4.4 Bosh sahifa o'zgarishlari

**Hozirgi holat:** Bosh sahifa bitta umumiy jadvalni ko'rsatadi.

**Yangi talablar:**

- Bosh sahifada ikkita bo'lim:
  1. **Ommaviy jadvallar** — barcha ochiq jadvallar ro'yxati (kartochka ko'rinishida)
     - Jadval nomi
     - Muallif ismi
     - Yaratilgan sana
     - Ko'rishlar soni (ixtiyoriy)
  2. **Qidiruv** — jadvallarni nom, muallif yoki fakultet bo'yicha qidirish
- Tizimga kirgan foydalanuvchi uchun qo'shimcha:
  - **"Mening jadvallarim"** bo'limi (dashboard)
  - Yangi jadval yaratish tugmasi

### 4.5 Foydalanuvchi dashboard (`/dashboard`)

- Foydalanuvchining barcha jadvallari ro'yxati
- Har bir jadval uchun:
  - Nomi, holati (public/private), yaratilgan sana
  - Tahrirlash, o'chirish, nusxalash tugmalari
  - Ko'rinish holatini o'zgartirish (toggle)
  - Havolani nusxalash
- Yangi jadval yaratish tugmasi
- Statistika: jami jadvallar soni, ochiq/yopiq soni

### 4.6 Admin panel kengaytmasi

**Hozirgi holat:** Admin faqat bitta jadvalni boshqaradi.

**Yangi talablar:**

- Barcha foydalanuvchilar ro'yxati
  - Ism, email, rol, jadvallar soni
  - Foydalanuvchini bloklash/o'chirish
- Barcha jadvallar ro'yxati
  - Muallif, nom, holat, darslar soni
  - Jadvallarni moderatsiya qilish (yashirish/o'chirish)
- Umumiy statistika:
  - Jami foydalanuvchilar
  - Jami jadvallar
  - Bugungi faol foydalanuvchilar

## 5. Ma'lumotlar bazasi strukturasi (Firestore)

### 5.1 Yangi kolleksiyalar

```
users (kolleksiya)
└── {userId} (hujjat)
    ├── displayName: string
    ├── email: string
    ├── role: 'teacher' | 'student' | 'head' | 'other'
    ├── faculty: string (ixtiyoriy)
    ├── department: string (ixtiyoriy)
    ├── isAdmin: boolean
    ├── isBlocked: boolean
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp

timetables (kolleksiya)
└── {timetableId} (hujjat)
    ├── ownerId: string (userId ga reference)
    ├── ownerName: string (denormalized)
    ├── name: string
    ├── description: string (ixtiyoriy)
    ├── visibility: 'public' | 'private'
    ├── shortCode: string (unikal, qisqa havola uchun)
    ├── viewCount: number
    ├── createdAt: Timestamp
    └── updatedAt: Timestamp

lessons (kolleksiya — hozirgi "schedules" o'rniga)
└── {lessonId} (hujjat)
    ├── timetableId: string (qaysi jadvalga tegishli)
    ├── day: string
    ├── shift: string
    ├── period: number
    ├── subject: string
    ├── room: string
    ├── teacher: string
    ├── groups: string[]
    ├── type: string
    ├── weekStart: string (ixtiyoriy)
    └── updatedAt: Timestamp
```

### 5.2 Firestore xavfsizlik qoidalari

```
users:
  - O'qish: faqat o'zi yoki admin
  - Yozish: faqat o'zi (yaratish), admin (bloklash)

timetables:
  - O'qish: public bo'lsa hammaga, private bo'lsa faqat egasiga
  - Yozish: faqat egasi yoki admin
  - O'chirish: faqat egasi yoki admin

lessons:
  - O'qish: tegishli timetable public bo'lsa hammaga, private bo'lsa faqat egasiga
  - Yozish: faqat timetable egasi yoki admin
```

## 6. Yangi sahifalar va marshrutlar

| Marshrut | Sahifa | Autentifikatsiya |
|----------|--------|------------------|
| `/` | Bosh sahifa — ommaviy jadvallar ro'yxati + qidiruv | Yo'q |
| `/register` | Ro'yxatdan o'tish | Yo'q |
| `/login` | Kirish | Yo'q |
| `/profile` | Profil sahifasi | Ha |
| `/dashboard` | Foydalanuvchi shaxsiy paneli | Ha |
| `/dashboard/new` | Yangi jadval yaratish | Ha |
| `/dashboard/{timetableId}/edit` | Jadval tahrirlash (admin panel kabi) | Ha (egasi) |
| `/schedule/{userId}/{timetableId}` | Jadval ko'rish (ommaviy) | Yo'q |
| `/s/{shortCode}` | Qisqa havola orqali jadval ko'rish | Yo'q |
| `/admin` | Admin panel | Ha (admin) |
| `/admin/users` | Foydalanuvchilar boshqaruvi | Ha (admin) |
| `/admin/timetables` | Jadvallar moderatsiyasi | Ha (admin) |

## 7. UI/UX talablar

### 7.1 Umumiy

- Hozirgi dark/light tema qo'llab-quvvatlash saqlanadi
- Mobil qurilmalarga moslashgan (responsive) dizayn
- O'zbek tilida interfeys (hozirgi kabi)
- Yuklanish holatlarida skeleton/spinner ko'rsatish

### 7.2 Navigatsiya o'zgarishlari

Hozirgi header yangilanadi:
- **Kirgan foydalanuvchi uchun:**
  - Logo → Bosh sahifa
  - "Mening jadvallarim" → Dashboard
  - Profil ikonkasi → Profil menyu (Profil, Chiqish)
- **Mehmon uchun:**
  - Logo → Bosh sahifa
  - "Kirish" tugmasi
  - "Ro'yxatdan o'tish" tugmasi

### 7.3 Jadval kartochkasi (bosh sahifada)

Har bir ommaviy jadval kartochka ko'rinishida:
- Jadval nomi (sarlavha)
- Muallif ismi
- Yaratilgan/yangilangan sana
- Fakultet (agar bor bo'lsa)
- "Ko'rish" tugmasi

### 7.4 Dashboard

- Jadvallar ro'yxati jadval (table) yoki kartochka (grid) ko'rinishida
- Har bir elementda tezkor amallar: tahrirlash, o'chirish, ulashish
- Bo'sh holat: "Hali jadval yo'q. Birinchi jadvalingizni yarating!" xabari

## 8. Migratsiya rejasi

Hozirgi `schedules` kolleksiyasidagi ma'lumotlarni yangi tizimga o'tkazish:

1. Admin foydalanuvchi uchun `users` hujjati yaratish
2. Hozirgi jadval uchun `timetables` hujjati yaratish (admin egasi sifatida)
3. `schedules` dagi barcha darslarni `lessons` kolleksiyasiga ko'chirish, `timetableId` qo'shib
4. Eski `schedules` kolleksiyasini saqlab qolish (orqaga qaytish uchun)
5. Yangi tizim barqaror ishlashi tasdiqlangach, eski kolleksiyani o'chirish

## 9. Texnik amalga oshirish bo'yicha tavsiyalar

### 9.1 Firebase konfiguratsiya

- Firebase Authentication da email/parol ro'yxatdan o'tishni yoqish
- Firestore indekslarni qo'shish:
  - `timetables`: `visibility` + `createdAt` (ommaviy jadvallar saralash uchun)
  - `lessons`: `timetableId` + `weekStart` (haftalik filtrlash uchun)
  - `timetables`: `ownerId` + `createdAt` (foydalanuvchi jadvallari uchun)

### 9.2 Yangi kontekstlar

- `UserContext` — foydalanuvchi profil ma'lumotlari
- `TimetableContext` — joriy tahrirlayotgan jadval holati
- Hozirgi `AuthContext`, `WeekContext`, `ThemeContext` saqlanadi

### 9.3 Yangi hooklar

- `useUser()` — foydalanuvchi profil ma'lumotlarini olish
- `useTimetables(userId)` — foydalanuvchi jadvallarini olish
- `usePublicTimetables()` — ommaviy jadvallar ro'yxati
- `useTimetable(timetableId)` — bitta jadval ma'lumotlari
- Hozirgi `useSchedule` hooki `timetableId` parametri bilan yangilanadi

## 10. Bosqichlar

### Bosqich 1: Autentifikatsiya kengaytmasi
- Ro'yxatdan o'tish sahifasi
- Kirish sahifasini yangilash
- `users` kolleksiyasi va Firestore qoidalari
- Profil sahifasi

### Bosqich 2: Ko'p jadval tizimi
- `timetables` va `lessons` kolleksiyalari
- Dashboard sahifasi
- Jadval yaratish/tahrirlash
- Mavjud ma'lumotlarni migratsiya qilish

### Bosqich 3: Ulashish va ommaviy ko'rinish
- Bosh sahifani yangilash (ommaviy jadvallar ro'yxati)
- Jadval ko'rish sahifasi (public URL)
- Qisqa havolalar
- Qidiruv funksiyasi

### Bosqich 4: Admin panel kengaytmasi
- Foydalanuvchilar boshqaruvi
- Jadvallar moderatsiyasi
- Statistika dashboard

## 11. Muvaffaqiyat mezonlari

- Foydalanuvchi 2 daqiqadan kam vaqtda ro'yxatdan o'tib, birinchi jadvalini yarata oladi
- Ommaviy jadvallar bosh sahifada 1 soniyadan kam vaqtda yuklanadi
- Mavjud funksiyalar (ovozli kiritish, eksport, hafta nusxalash) yangi tizimda ham ishlaydi
- Mobil qurilmalarda barcha sahifalar to'g'ri ko'rinadi
- Migratsiyadan keyin hozirgi ma'lumotlar saqlanib qoladi
