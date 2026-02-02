# DARS JADVALI - LOYIHA AUDITI

**Sana:** 2026-02-02
**Versiya:** 0.1.0
**Audit turi:** To'liq texnik audit

---

## 1. UMUMIY MA'LUMOT

### 1.1 Loyiha haqida
- **Nomi:** Dars Jadvali
- **Maqsadi:** Universitet dars jadvalini boshqarish va ko'rish tizimi
- **Til:** TypeScript + React
- **Framework:** Next.js 16.1.4 (App Router)
- **Ma'lumotlar bazasi:** Firebase Firestore
- **Autentifikatsiya:** Firebase Authentication

### 1.2 Texnologiyalar steki
| Kategoriya | Texnologiya | Versiya |
|------------|-------------|---------|
| Frontend Framework | Next.js | 16.1.4 |
| UI Library | React | 19.2.3 |
| Stillar | Tailwind CSS | 4.x |
| Backend | Firebase | 12.8.0 |
| PDF Export | jsPDF | 4.0.0 |
| Image Export | html-to-image | 1.11.13 |
| Tillar | TypeScript | 5.x |

---

## 2. ARXITEKTURA TAHLILI

### 2.1 Loyiha tuzilmasi

```
dars-jadvali/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Bosh sahifa
│   ├── globals.css        # Global CSS
│   └── admin/             # Admin panel
│       ├── page.tsx       # Admin dashboard
│       └── login/page.tsx # Login sahifa
├── components/            # React komponentlar
│   ├── admin/            # Admin komponentlar
│   ├── schedule/         # Jadval komponentlar
│   ├── layout/           # Layout komponentlar
│   └── ui/               # UI komponentlar
├── context/              # React Context
├── hooks/                # Custom hooks
├── lib/                  # Utility funksiyalar
│   ├── firebase/        # Firebase konfiguratsiya
│   ├── voice/           # Ovozli kiritish
│   ├── types.ts         # TypeScript tiplar
│   └── constants.ts     # Konstantalar
└── public/              # Statik fayllar
```

### 2.2 Arxitektura bahosi

| Mezon | Baho | Izoh |
|-------|------|------|
| Kod tashkil etilishi | ⭐⭐⭐⭐⭐ | Yaxshi tuzilgan, mantiqiy ajratilgan |
| Separation of Concerns | ⭐⭐⭐⭐⭐ | Context, hooks, components ajratilgan |
| Reusability | ⭐⭐⭐⭐ | UI komponentlar qayta ishlatiladi |
| Scalability | ⭐⭐⭐⭐ | Yangi funksiyalar oson qo'shiladi |

---

## 3. XAVFSIZLIK AUDITI

### 3.1 Ijobiy tomonlar

1. **Firebase konfiguratsiya** - Environment variables orqali saqlanadi (`lib/firebase/config.ts:7-14`)
2. **Auth state management** - Xavfsiz context orqali boshqariladi (`context/AuthContext.tsx`)
3. **XSS himoya** - React avtomatik sanitizatsiya qiladi
4. **No hardcoded secrets** - Kodda hech qanday maxfiy ma'lumot yo'q

### 3.2 Xavfsizlik muammolari va tavsiyalar

#### YUQORI DARAJADAGI MUAMMOLAR

| # | Muammo | Joylashuv | Tavsiya | Ustuvorlik |
|---|--------|-----------|---------|------------|
| 1 | Firebase Security Rules - aniqlanmagan | Firebase Console | Firestore rules yozish: faqat autentifikatsiya qilingan foydalanuvchilar yozishi mumkin | YUQORI |
| 2 | Admin roli tekshiruvi yo'q | `lib/firebase/db.ts` | Admin rolini Firebase Custom Claims orqali tekshirish | YUQORI |

#### O'RTA DARAJADAGI MUAMMOLAR

| # | Muammo | Joylashuv | Tavsiya | Ustuvorlik |
|---|--------|-----------|---------|------------|
| 3 | Input validatsiya - server tomonida yo'q | `lib/firebase/db.ts:82-113` | Firebase Functions yoki Firestore rules orqali validatsiya | O'RTA |
| 4 | Rate limiting yo'q | Firebase | Firebase App Check yoki Cloud Functions rate limiting | O'RTA |
| 5 | CSRF himoya - Next.js ga ishonilgan | Global | Server Actions uchun qo'shimcha tekshiruv | PAST |

### 3.3 Firebase Security Rules Tavsiyasi

```javascript
// Firestore Security Rules (Firebase Console da qo'shish kerak)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Schedules collection
    match /schedules/{lessonId} {
      // Hammaga o'qish ruxsati
      allow read: if true;

      // Faqat autentifikatsiya qilingan foydalanuvchilarga yozish
      allow write: if request.auth != null;

      // Ma'lumotlar validatsiyasi
      allow create, update: if request.auth != null
        && request.resource.data.day in ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma']
        && request.resource.data.shift in ['kunduzgi', 'sirtqi', 'kechki']
        && request.resource.data.period >= 1
        && request.resource.data.period <= 3
        && request.resource.data.subject is string
        && request.resource.data.room is string
        && request.resource.data.teacher is string
        && request.resource.data.groups is list;
    }
  }
}
```

---

## 4. KOD SIFATI TAHLILI

### 4.1 Ijobiy tomonlar

1. **TypeScript** - To'liq tiplangan kod (`lib/types.ts`)
2. **Consistent naming** - Izchil nomlash konvensiyasi
3. **Clean code** - O'qilishi oson, toza kod
4. **Error handling** - Xatolarni ushlash mavjud
5. **Loading states** - Yuklanish holatlari ko'rsatiladi

### 4.2 Kod sifati mezonlari

| Mezon | Baho | Izoh |
|-------|------|------|
| TypeScript qamrovi | ⭐⭐⭐⭐⭐ | To'liq tiplangan |
| Error handling | ⭐⭐⭐⭐ | Try-catch ishlatilgan |
| Code duplication | ⭐⭐⭐⭐ | Minimal takrorlanish |
| Comments | ⭐⭐⭐ | O'zbek tilida izohlar mavjud |
| Testing | ⭐ | Test yo'q (MUHIM KAMCHILIK) |

### 4.3 Yaxshilash kerak bo'lgan joylar

1. **Testing yo'q** - Unit va integration testlar qo'shish kerak
2. **Error boundaries** - React error boundaries qo'shish
3. **Logging** - Strukturali logging qo'shish
4. **API documentation** - API hujjatlari yaratish

---

## 5. PERFORMANCE TAHLILI

### 5.1 Ijobiy tomonlar

1. **Real-time updates** - Firebase onSnapshot ishlatilgan (`lib/firebase/db.ts:136-159`)
2. **Memoization** - useMemo, useCallback ishlatilgan (`components/schedule/ScheduleGrid.tsx:57-62`)
3. **Code splitting** - Next.js avtomatik code splitting
4. **Image optimization** - html-to-image 3x pixelRatio bilan

### 5.2 Performance muammolari

| # | Muammo | Joylashuv | Ta'sir | Tavsiya |
|---|--------|-----------|--------|---------|
| 1 | Bulk save - sequential | `lib/firebase/db.ts:162-167` | Sekin saqlash | Batch writes ishlatish |
| 2 | No pagination | `lib/firebase/db.ts:28-38` | Katta ma'lumotlar uchun sekin | Pagination qo'shish |
| 3 | No caching | Hooks | Ortiqcha so'rovlar | SWR yoki React Query |
| 4 | Large CSS bundle | `app/globals.css` | 354 qator CSS | CSS optimizatsiya |

### 5.3 Tavsiya etilgan optimizatsiyalar

```typescript
// Batch writes misoli
import { writeBatch, doc } from 'firebase/firestore';

export async function saveManyLessonsOptimized(
  lessons: Omit<Lesson, 'id' | 'updatedAt'>[]
): Promise<void> {
  const batch = writeBatch(db);

  for (const lesson of lessons) {
    const docRef = doc(collection(db, SCHEDULES_COLLECTION));
    batch.set(docRef, {
      ...lesson,
      updatedAt: Timestamp.now(),
    });
  }

  await batch.commit();
}
```

---

## 6. ACCESSIBILITY (A11Y) TAHLILI

### 6.1 Mavjud xususiyatlar

1. **Semantic HTML** - button, nav, main elementlari
2. **Color contrast** - Light/Dark tema
3. **Responsive design** - Mobile-friendly
4. **Focus states** - Focus ko'rinadigan

### 6.2 Yetishmayotgan xususiyatlar

| # | Muammo | Joylashuv | Tavsiya |
|---|--------|-----------|---------|
| 1 | aria-label yo'q | Tugmalar | aria-label qo'shish |
| 2 | Skip links yo'q | Layout | "Skip to content" link qo'shish |
| 3 | Screen reader support | Global | ARIA landmarks qo'shish |
| 4 | Keyboard navigation | Modals | Focus trap qo'shish |
| 5 | Alt texts | Icons | sr-only matn qo'shish |

### 6.3 Tavsiya etilgan yaxshilanishlar

```tsx
// Tugma uchun accessibility
<button
  onClick={handleClick}
  aria-label="Ovoz bilan kiritish"
  aria-pressed={isListening}
  className="..."
>
  <MicrophoneIcon aria-hidden="true" />
  <span className="sr-only">Ovoz bilan kiritish</span>
</button>
```

---

## 7. UX/UI TAHLILI

### 7.1 Ijobiy tomonlar

1. **Modern design** - Glassmorphism + Neomorphism
2. **Theme support** - Light/Dark mode
3. **Responsive** - Mobile, tablet, desktop
4. **Visual feedback** - Loading, success, error states
5. **Voice input** - Innovatsion kiritish usuli

### 7.2 UX yaxshilash tavsiyalari

| # | Tavsiya | Ustuvorlik |
|---|---------|------------|
| 1 | Offline support (PWA) | O'RTA |
| 2 | Undo/Redo funksiyasi | PAST |
| 3 | Keyboard shortcuts | PAST |
| 4 | Print stylesheet | PAST |
| 5 | Multi-language support | O'RTA |

---

## 8. DEPENDENCY TAHLILI

### 8.1 Dependencies holati

| Package | Versiya | Holati | Izoh |
|---------|---------|--------|------|
| next | 16.1.4 | Yangi | RC versiya - Production uchun ehtiyot bo'ling |
| react | 19.2.3 | Yangi | So'nggi barqaror versiya |
| firebase | 12.8.0 | Yangi | Barqaror |
| jspdf | 4.0.0 | Yangi | Barqaror |
| html-to-image | 1.11.13 | Yangi | Barqaror |
| tailwindcss | 4.x | Yangi | Yangi major versiya |

### 8.2 Xavfsizlik tekshiruvi

```bash
# npm audit natijasi (tavsiya)
npm audit
```

### 8.3 Tavsiyalar

1. **Next.js 16** - RC versiya. Production uchun 15.x ishlatish tavsiya etiladi
2. **Tailwind CSS 4** - Yangi versiya, breaking changes bo'lishi mumkin
3. **package-lock.json** - Mavjud, dependencies locked

---

## 9. VOICE INPUT TAHLILI

### 9.1 Arxitektura

```
User Speech → Web Speech API → Text → Parser → Structured Data → Firebase
```

### 9.2 Qo'llab-quvvatlangan tillar

- O'zbek (uz-UZ) - Asosiy
- Rus (ru-RU) - Fallback
- Turk (tr-TR) - Fallback

### 9.3 Parser qobiliyatlari (`lib/voice/parser.ts`)

- Kun aniqlash (O'zbek, Rus, Ingliz)
- Bo'lim aniqlash
- Para raqami
- Fan nomi
- Xona (pattern: `[A-Za-z]{1,3}\d{3}[A-Za-z]?`)
- Guruhlar
- O'qituvchi ismi
- Dars turi

### 9.4 Voice Input yaxshilash tavsiyalari

1. **Confidence threshold** - Ishonchlilik chegarasi qo'shish
2. **Voice confirmation** - Ovozli tasdiqlash
3. **Training mode** - Foydalanuvchi o'rgatish rejimi
4. **Custom vocabulary** - Maxsus lug'at qo'shish

---

## 10. XULOSA VA UMUMIY BAHO

### 10.1 Umumiy baho

| Kategoriya | Baho (1-10) | Izoh |
|------------|-------------|------|
| Kod sifati | 8/10 | Yaxshi tiplangan, toza kod |
| Arxitektura | 9/10 | Yaxshi tuzilgan |
| Xavfsizlik | 6/10 | Firebase rules kerak |
| Performance | 7/10 | Optimizatsiya kerak |
| UX/UI | 9/10 | Zamonaviy, qulay |
| Accessibility | 5/10 | A11y yaxshilash kerak |
| Testing | 1/10 | Test yo'q |
| Documentation | 6/10 | README va SETUP mavjud |

### 10.2 UMUMIY BAHO: **7.1/10**

### 10.3 Ustuvor vazifalar

1. **KRITIK:** Firebase Security Rules yozish
2. **YUQORI:** Unit testlar qo'shish
3. **YUQORI:** Admin rol tekshiruvi
4. **O'RTA:** Input validatsiya yaxshilash
5. **O'RTA:** Accessibility yaxshilash
6. **PAST:** Performance optimizatsiya

---

## 11. TAVSIYALAR XULOSA

### Qisqa muddatli (1-2 hafta)

- [ ] Firebase Security Rules yozish va deploy qilish
- [ ] Admin rol tekshiruvini qo'shish
- [ ] Asosiy input validatsiya qo'shish

### O'rta muddatli (1-2 oy)

- [ ] Unit testlar yozish (Jest + React Testing Library)
- [ ] E2E testlar (Playwright yoki Cypress)
- [ ] Accessibility yaxshilash (WCAG 2.1 AA)
- [ ] Error boundaries qo'shish

### Uzoq muddatli (3-6 oy)

- [ ] PWA qo'llab-quvvatlash
- [ ] Performance monitoring (Sentry, LogRocket)
- [ ] CI/CD pipeline
- [ ] Logging va monitoring

---

## 12. FOYDALANILGAN STANDARTLAR

- OWASP Top 10
- WCAG 2.1
- React Best Practices
- Firebase Security Best Practices
- TypeScript Best Practices

---

**Audit bajaruvchi:** Claude AI
**Sana:** 2026-02-02
**Loyiha versiyasi:** 0.1.0
