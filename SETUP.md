# Dars Jadvali - Sozlash Yo'riqnomasi

Bu yo'riqnoma loyihani ishga tushirish uchun barcha kerakli qadamlarni ko'rsatadi.

## 1. Firebase Loyiha Yaratish

### 1.1 Firebase Console'ga kiring
1. https://console.firebase.google.com/ saytiga o'ting
2. Google hisobingiz bilan kiring
3. "Add project" tugmasini bosing
4. Loyiha nomini kiriting (masalan: "dars-jadvali")
5. Google Analytics'ni o'chirib qo'yishingiz mumkin (ixtiyoriy)
6. "Create project" tugmasini bosing

### 1.2 Web ilovasini qo'shish
1. Loyiha ochilgandan so'ng, "<>" (Web) ikonini bosing
2. Ilova nomini kiriting (masalan: "dars-jadvali-web")
3. "Register app" tugmasini bosing
4. Ko'rsatilgan konfiguratsiyani nusxalang:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 1.3 Authentication sozlash
1. Chap menuda "Authentication" ni tanlang
2. "Get started" tugmasini bosing
3. "Sign-in method" bo'limiga o'ting
4. "Email/Password" ni tanlang va "Enable" qiling
5. "Save" tugmasini bosing

### 1.4 Admin foydalanuvchi qo'shish
1. "Authentication" > "Users" bo'limiga o'ting
2. "Add user" tugmasini bosing
3. Email va parol kiriting (masalan: admin@example.com)
4. "Add user" tugmasini bosing

### 1.5 Firestore Database yaratish
1. Chap menuda "Firestore Database" ni tanlang
2. "Create database" tugmasini bosing
3. "Start in production mode" ni tanlang
4. Lokatsiyani tanlang (masalan: europe-west1)
5. "Enable" tugmasini bosing

### 1.6 Firestore qoidalarini sozlash
1. "Rules" bo'limiga o'ting
2. Quyidagi qoidalarni kiriting:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Barcha foydalanuvchilar o'qiy oladi
    match /schedules/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. "Publish" tugmasini bosing

## 2. Loyihani Sozlash

### 2.1 Environment variables
1. `.env.local.example` faylini `.env.local` ga nusxalang:

```bash
cp .env.local.example .env.local
```

2. `.env.local` faylini oching va Firebase konfiguratsiyasini kiriting:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2.2 Loyihani ishga tushirish

```bash
# Dependencylarni o'rnatish
npm install

# Development server
npm run dev

# Brauzerda ochish
http://localhost:3000
```

## 3. Vercel'ga Deploy Qilish

### 3.1 GitHub'ga yuklash
```bash
# Git repo yaratish (agar yo'q bo'lsa)
git init
git add .
git commit -m "Initial commit"

# GitHub'da yangi repo yarating va ulang
git remote add origin https://github.com/YOUR_USERNAME/dars-jadvali.git
git push -u origin main
```

### 3.2 Vercel'ga ulash
1. https://vercel.com/ saytiga o'ting
2. GitHub hisobingiz bilan kiring
3. "Add New" > "Project" tugmasini bosing
4. GitHub reponi tanlang
5. "Environment Variables" bo'limiga o'ting
6. `.env.local` faylidagi barcha o'zgaruvchilarni qo'shing:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
7. "Deploy" tugmasini bosing

### 3.3 Custom domain (ixtiyoriy)
1. Vercel dashboard'da loyihangizni oching
2. "Settings" > "Domains" bo'limiga o'ting
3. Domain nomini kiriting
4. DNS sozlamalarini qo'shing

## 4. Foydalanish

### 4.1 Bosh sahifa
- http://localhost:3000 (yoki Vercel URL)
- 5 kunlik dars jadvali ko'rinadi
- Light/Dark mode toggle

### 4.2 Admin panel
1. http://localhost:3000/admin/login ga o'ting
2. Firebase'da yaratgan email va parol bilan kiring
3. Darslarni qo'shish:
   - **Qo'lda**: Formni to'ldiring va saqlang
   - **Ovozda**: Mikrofon tugmasini bosing va gapiring

### 4.3 Ovozli buyruq formati
```
[Kun] [Bo'lim] [Para]-para [Fan nomi] [Xona] [Guruhlar] [O'qituvchi] [Turi]

Misol: "Dushanba kunduzgi 1-para Mediasavodxonlik JM403 JM403 JM405 Karimov Ma'ruza"
```

## 5. Muammolarni Hal Qilish

### Firebase xatosi
- `.env.local` faylini tekshiring
- Firebase Console'da loyihangiz to'g'ri sozlanganini tekshiring
- Authentication va Firestore yoqilganini tekshiring

### Ovozli kiritish ishlamayapti
- Chrome yoki Edge brauzeridan foydalaning
- Mikrofonga ruxsat berilganini tekshiring
- HTTPS ulanishda ekanligingizni tekshiring (localhost ham ishlaydi)

### Build xatosi
```bash
# Cache tozalash
rm -rf .next
npm run build
```

## Texnik Qo'llab-quvvatlash

Muammolar yuzaga kelsa, GitHub Issues'da xabar qoldiring.
