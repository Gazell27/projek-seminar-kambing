# 🐐 GoatFarm - Sistem Manajemen Penjualan Kambing

Aplikasi full-stack untuk manajemen penjualan kambing dengan React (Frontend) + Node.js/Express (Backend) + MySQL (Database).

## 📁 Struktur Proyek

```
├── goatfarm-backend/      # Node.js + Express API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── middleware/    # Auth, Role Guard, Upload
│   │   ├── models/        # Sequelize models (9 tables)
│   │   ├── routes/        # API endpoints
│   │   └── app.js         # Main entry point
│   └── package.json
│
└── goatfarm-frontend/     # React + Vite SPA
    ├── src/
    │   ├── api/           # Axios API client
    │   ├── components/    # Reusable UI components
    │   ├── context/       # Auth context
    │   ├── layouts/       # Admin & Kasir layouts
    │   ├── pages/         # Page components
    │   ├── routes/        # Protected routes
    │   ├── utils/         # Helper functions
    │   └── App.jsx        # Main app with routing
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm atau yarn

### 1. Setup Database

Pastikan database MySQL dari Laravel sudah berjalan. Jika belum ada, buat database baru:

```sql
CREATE DATABASE laravel_12;
```

Jalankan migrations Laravel yang sudah ada, atau import SQL dump.

### 2. Setup Backend

```bash
cd goatfarm-backend

# Install dependencies
npm install

# Konfigurasi environment
# Edit file .env dengan kredensial database Anda:
# - DB_HOST=localhost
# - DB_PORT=3306
# - DB_NAME=laravel_12
# - DB_USER=root
# - DB_PASSWORD=your_password

# Jalankan server
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 3. Setup Frontend

```bash
cd goatfarm-frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 👤 Default Login

Gunakan akun yang sudah ada di database Laravel:

| Role | Email | Password |
|------|-------|----------|
| Admin | (sesuai database) | (sesuai database) |
| Kasir | (sesuai database) | (sesuai database) |

Atau buat user baru via API:

```bash
POST http://localhost:3001/api/users
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

## 🔑 Fitur

### Admin
- ✅ Dashboard (statistik, grafik penjualan, stok per ras)
- ✅ Manajemen Ras (CRUD)
- ✅ Estimasi Harga (CRUD)
- ✅ Data Kambing (CRUD)
- ✅ Penjualan (multi-step form)
- ✅ Pembayaran (approve/reject transfer)
- ✅ Laporan (filter by date)
- ✅ Users Management
- ✅ Settings

### Kasir
- ✅ Dashboard
- ✅ Penjualan (buat transaksi)
- ✅ View Kambing (read-only)
- ✅ View Laporan (transaksi sendiri)
- ✅ View Estimasi Harga

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET/POST/PUT/DELETE | `/api/users` | Users CRUD |
| GET/POST/PUT/DELETE | `/api/ras` | Ras CRUD |
| GET/POST/PUT/DELETE | `/api/estimasi` | Estimasi CRUD |
| GET/POST/PUT/DELETE | `/api/kambing` | Kambing CRUD |
| GET/POST | `/api/penjualan` | Penjualan |
| GET/PUT | `/api/payments` | Payment approval |
| GET/PUT | `/api/settings` | App settings |
| GET | `/api/dashboard/*` | Dashboard stats |

## 🛠 Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router 6
- Axios
- React Hook Form
- React Hot Toast
- React Icons
- Recharts

**Backend:**
- Node.js
- Express.js
- Sequelize ORM
- MySQL2
- JWT (jsonwebtoken)
- Bcrypt.js
- Multer (file upload)
- CORS

## 📝 Notes

- Database schema sama dengan Laravel, jadi data existing akan tetap bekerja
- JWT token disimpan di localStorage
- File upload untuk bukti transfer disimpan di folder `goatfarm-backend/uploads/`
