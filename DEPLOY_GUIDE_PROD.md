# Deployment Quick Guide (Langkah Terakhir)

Proyek ini sudah saya siapkan untuk hosting. Ikuti 3 langkah terakhir ini untuk membuatnya online:

## 1. Upload ke GitHub
Jalankan perintah ini di terminal utama:
```bash
# Ganti link di bawah dengan link repo GitHub Anda yang baru dibuat
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## 2. Deploy Backend (Render.com)
- Connect repo GitHub Anda ke Render.
- **Build Command**: `cd goatfarm-backend && npm install`
- **Start Command**: `node src/app.js`
- **Envs**: Masukkan semua variabel dari `.env` ke dashboard Render (khususnya URL Database MySQL online Anda).

## 3. Deploy Frontend (Vercel)
- Import repo dari GitHub ke Vercel.
- **Root Directory**: `goatfarm-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Envs**: Set `VITE_API_URL` ke URL backend Render Anda (contoh: `https://api-anda.onrender.com/api`).

---
Script ini sudah dikonfigurasi untuk:
- ✅ **SPA Routing**: Menggunakan `vercel.json` agar refresh halaman tidak error 404.
- ✅ **CORS Management**: Backend sudah siap menerima trafik dari domain production.
- ✅ **Clean Git**: File rahasia (`.env`) dan folder berat (`node_modules`) sudah di-ignore.
