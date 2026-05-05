# 📘 FileConvert.uz — To'liq O'rnatish Qo'llanmasi

## Loyiha haqida
- **Texnologiya**: Next.js 14 + TypeScript + Supabase + CloudConvert
- **Dizayn**: Tailwind CSS + maxsus animatsiyalar
- **Deploy**: Vercel (bepul)
- **Database**: Supabase (bepul tier)

---

## 🚀 1-QADAM: GitHub repozitoriy

```bash
# 1. GitHub.com ga boring, yangi repo yarating (masalan: fileconvert-uz)
# 2. Loyiha papkangizda terminal oching:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SIZNING_USERNAME/fileconvert-uz.git
git push -u origin main
```

---

## 🗄️ 2-QADAM: Supabase sozlash (BEPUL)

1. **supabase.com** ga boring → "Start your project"
2. Google yoki GitHub bilan kiring
3. **"New Project"** bosing
4. Nom: `fileconvert-uz`, parol (yodlab qoling!), region: Singapore (eng yaqin)
5. Yaratilishini kuting (1-2 daqiqa)

### Database jadvallarini yaratish:
1. Chap menuda **"SQL Editor"** bosing
2. **`supabase-schema.sql`** faylidagi BARCHA kodni nusxalang
3. SQL editorga joylashtiring va **"Run"** bosing ✅

### Storage bucket yaratish (cheklar uchun):
1. Chap menuda **"Storage"** bosing
2. **"New bucket"** → nom: `payments`, Public: **YO'Q** (private)
3. Yarating

### API kalitlarini oling:
1. **Settings → API** ga boring
2. Quyidagilarni nusxalang:
   - `Project URL` → bu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → bu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → bu `SUPABASE_SERVICE_ROLE_KEY` (**maxfiy!**)

### Google OAuth yoqish:
1. Supabase → **Authentication → Providers**
2. **Google** ni toping → yoqing
3. Google Cloud Console ([console.cloud.google.com](https://console.cloud.google.com)):
   - Yangi loyiha yarating
   - **APIs & Services → Credentials**
   - **"Create Credentials" → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - Client ID va Secret ni oling
4. Supabase Googlega Client ID va Secret kiriting

---

## 🔄 3-QADAM: CloudConvert (fayl konvertatsiya) — BEPUL

1. **cloudconvert.com** ga boring → hisob yarating
2. **Dashboard → API** → **"API Keys"**
3. **"Create API key"** → barcha ruxsatlarni bering
4. API kalitni nusxalang → bu `CLOUDCONVERT_API_KEY`

> **Eslatma**: CloudConvert bepul hisob 25 konvertatsiya/kun beradi.
> Ko'proq kerak bo'lsa, to'liq bepul tarif uchun kredit sotib olish kerak.

---

## ▲ 4-QADAM: Vercel deploy (BEPUL)

1. **vercel.com** ga boring → GitHub bilan kiring
2. **"New Project"** → GitHub reponi tanlang
3. **"Environment Variables"** bo'limiga o'ting va quyidagilarni qo'shing:

```
NEXT_PUBLIC_SUPABASE_URL        = supabasedagi URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   = supabasedagi anon key
SUPABASE_SERVICE_ROLE_KEY       = supabasedagi service role key
CLOUDCONVERT_API_KEY            = cloudconvert api key
ADMIN_LOGIN                     = kamron201
ADMIN_PASSWORD                  = 128787$Kam
NEXT_PUBLIC_APP_URL             = https://sizning-loyiha.vercel.app
NEXTAUTH_SECRET                 = (tasodifiy 32+ belgili matn, masalan: openssl rand -base64 32)
```

4. **"Deploy"** bosing!
5. Deploy tugagach URL ni oling (masalan: `fileconvert-uz.vercel.app`)

### Supabaseda redirect URL ni yangilang:
1. Supabase → **Authentication → URL Configuration**
2. `Site URL`: `https://sizning-url.vercel.app`
3. `Redirect URLs`: `https://sizning-url.vercel.app/**`

---

## 🔑 Login ma'lumotlari

| Nima | Login/URL | Parol |
|------|-----------|-------|
| Admin panel | `sizning-sayt.com/admin` | login: `kamron201`, parol: `128787$Kam` |
| Foydalanuvchilar | Gmail yoki email+parol | - |

---

## 📋 Xususiyatlar ro'yxati

✅ **Foydalanuvchilar uchun:**
- Google OAuth va email/parol bilan kirish
- Parolni unutish → email orqali tiklash
- Seansni eslab qolish (1 marta kirsa, qayta kirishni so'ramaydi)
- Kuniga 2 ta bepul konvertatsiya
- Fayl yuklash (drag & drop)
- 500+ format juftligi
- Konvertatsiya tarixi
- Premium sotib olish (chek orqali)
- To'lovlar tarixi va holati

✅ **Admin uchun:**
- Alohida login sahifasi (`/admin/login`)
- Dashboard: statistika, daromad
- To'lovlar boshqaruvi (tasdiqlash/rad etish)
- Chek rasmini ko'rish
- Foydalanuvchilar ro'yxati
- Manual premium berish/olib tashlash
- Karta raqami va egasini o'zgartirish
- Premium narx va muddatini o'zgartirish
- Bepul kunlik limitni o'zgartirish

---

## 🛠️ Muammolar va yechimlar

**"Module not found" xatosi:**
```bash
npm install
```

**Supabase ulanish xatosi:**
- `.env` faylini tekshiring
- Supabase loyiha URL va kalitlar to'g'riligini tekshiring

**CloudConvert xatosi:**
- API kalitni tekshiring
- Bepul kredit tugab qolgan bo'lishi mumkin

**Google login ishlamaydi:**
- Supabase Google provider yoqilganligini tekshiring
- Redirect URL to'g'ri kiritilganligini tekshiring

---

## 💡 Mahalliy ishlatish (development)

```bash
# .env.local faylini yarating
cp .env.example .env.local
# Kerakli ma'lumotlarni kiriting

# O'rnatish
npm install

# Ishga tushirish
npm run dev
# http://localhost:3000 da ochiladi
```

---

Muammo bo'lsa — barcha qadamlarni qaytadan o'qing! 🎯
