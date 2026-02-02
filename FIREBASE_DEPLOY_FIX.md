# Firebase GitHub Actions Deployment Fix

## Muammo
```
Error: Failed to get Firebase project orienttest-22f74.
Please make sure the project exists and your account has permission to access it.
```

## Asosiy sabab
Workflow `FIREBASE_TOKEN` ishlatyapti, lekin service account (`GCP_SA_KEY`) bilan ishlash zarur.

---

## Yechim

### 1-qadam: Service Account JSON tekshirish

Firebase Console > Project Settings > Service Accounts > "Generate new private key" bosing.

JSON fayl quyidagi formatda bo'lishi kerak:
```json
{
  "type": "service_account",
  "project_id": "orienttest-22f74",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@orienttest-22f74.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Muhim tekshiruvlar:**
- `project_id` aynan `"orienttest-22f74"` bo'lishi kerak
- `private_key` to'liq va `\n` bilan bo'lishi kerak
- JSON valid bo'lishi kerak (extra comma yoki sintaksis xatosi yo'q)

### 2-qadam: GitHub Secret yangilash

1. GitHub repo > Settings > Secrets and variables > Actions
2. `FIREBASE_SERVICE_ACCOUNT` secret'ni o'chiring
3. Yangi secret yarating:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: JSON faylning **butun** mazmunini paste qiling (minify qilmang!)

### 3-qadam: Workflow faylini yangilash

`.github/workflows/deploy.yml` faylini quyidagicha o'zgartiring:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # Cloud Functions
      - name: Install Functions dependencies
        run: cd functions && npm ci

      - name: Build Functions
        run: cd functions && npm run build

      # Frontend
      - name: Install Frontend dependencies
        run: npm ci

      - name: Build Frontend
        run: npm run build

      # Deploy (only main branch on push)
      - name: Deploy to Firebase
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          GCP_SA_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

### 4-qadam: IAM Permissions tekshirish

Google Cloud Console > IAM & Admin > IAM

Service account `firebase-adminsdk-fbsvc@orienttest-22f74.iam.gserviceaccount.com` uchun kerakli rollar:

| Rol | Tavsif |
|-----|--------|
| **Firebase Admin** | Firebase to'liq boshqarish |
| **Cloud Functions Admin** | Functions deploy qilish |
| **Service Account User** | Service account ishlatish |
| **Cloud Build Editor** | Build jarayonlar |
| **Storage Admin** | Hosting fayllar uchun |

### 5-qadam: firebase.json tekshirish

`firebase.json` faylida project ID to'g'ri yozilganligini tekshiring:

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  },
  "functions": {
    "source": "functions"
  }
}
```

Va `.firebaserc` faylida:
```json
{
  "projects": {
    "default": "orienttest-22f74"
  }
}
```

---

## Umumiy xatolar va yechimlari

### Xato 1: "Invalid JSON"
**Sabab:** Secret'ga noto'g'ri JSON paste qilingan
**Yechim:** JSON'ni https://jsonlint.com/ da tekshiring

### Xato 2: "Permission denied"
**Sabab:** Service account'da kerakli rol yo'q
**Yechim:** IAM'da `Firebase Admin` va `Cloud Functions Admin` qo'shing

### Xato 3: "Project not found"
**Sabab:** JSON'dagi `project_id` noto'g'ri
**Yechim:** Yangi service account key yarating

### Xato 4: "Invalid private key"
**Sabab:** Private key truncate qilingan yoki `\n` o'zgargan
**Yechim:** JSON faylni raw formatda paste qiling

---

## Debug qilish

Workflow'ga debug step qo'shing:

```yaml
- name: Debug - Check project
  run: |
    echo "Checking Firebase project..."
    npm install -g firebase-tools
    echo '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}' > /tmp/sa.json
    export GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json
    firebase projects:list
    rm /tmp/sa.json
```

**Eslatma:** Bu faqat debugging uchun, production'da olib tashlang!

---

## Alternative: Firebase CLI Token

Agar service account ishlamasa, CLI token bilan sinab ko'ring:

1. Lokal kompyuterda:
```bash
firebase login:ci
```

2. Tokenni `FIREBASE_TOKEN` secret'ga saqlang

3. Workflow'da:
```yaml
env:
  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```
