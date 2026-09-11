# CVKita - AI-Powered Career Profile & Resume Platform

![CVKita Banner](https://img.shields.io/badge/CVKita-v1.0-orange?style=for-the-badge&logo=next.js)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma)

**Build your career profile once. Generate and tailor the right resume for every opportunity.**

CVKita adalah platform AI presisi tinggi untuk manajemen profil karier dan pembuatan resume yang dapat disesuaikan dengan kualifikasi pekerjaan target (*Job Matching & ATS Optimization*).

---

## ✨ Fitur Utama

- 🎯 **Master Career Profile**: Kelola satu data karier terpusat (pengalaman, pendidikan, proyek, keahlian, sertifikasi, dan prestasi).
- ⚡ **ATS Resume Tailor**: Buat resume khusus untuk setiap lowongan pekerjaan dengan penghitungan skor kompatibilitas ATS *real-time*.
- 🤖 **AI Assistant (Gemini / GPT-4o)**: Fitur rewrite klaim pencapaian karier, ekstraksi otomatis dari dokumen CV lama, serta penjabaran *bullet points*.
- 📊 **ATS Keyword Density Optimizer**: Melakukan inspeksi kepadatan kata kunci dan keterbacaan format ATS secara interaktif.
- 🎨 **Preview Real-Time & DOCX Export**: Render deterministik resume dengan dukungan ekspor dokumen ke format `.doc` / `.docx`.
- 🔐 **Privacy First**: Bebas dari rekayasa klaim palsu (*no fabrication guarantee*) dengan transparansi skor kepercayaan fakta.

---

## 🛠️ Teknologi & Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database / ORM**: [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **AI Providers**: Google Gemini 1.5 & OpenAI GPT-4o-mini
- **Ikon**: [Lucide React](https://lucide.dev/)

---

## 🚀 Panduan Memulai (Local Development)

### 1. Clone Repositori
```bash
git clone https://github.com/bagjasatrio/CVKita.git
cd CVKita
```

### 2. Install Dependensi
```bash
pnpm install
# atau
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` berdasarkan `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/cvkita"
DIRECT_URL="postgresql://user:password@localhost:5432/cvkita"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"
GOOGLE_AI_API_KEY="your-gemini-api-key"
```

### 4. Migrasi Database Prisma
```bash
npx prisma db push
```

### 5. Jalankan Server Dev
```bash
pnpm dev
# atau
npm run dev
```
Buka `http://localhost:3000` di browser Anda.

---

## 📜 Lisensi

Lisensi di bawah hak cipta [bagjasatrio](https://github.com/bagjasatrio).
