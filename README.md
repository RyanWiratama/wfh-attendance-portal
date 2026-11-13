# WFH Attendance & Employee Monitoring Portal

Aplikasi web fullstack untuk **Presensi WFH Karyawan (Check-in/Check-out dengan Bukti Foto)** dan **Monitoring Karyawan untuk HRD (CRUD Master Karyawan & Kontrol Absensi)**.

Dibuat untuk memenuhi technical test Fullstack Developer menggunakan **NestJS (Microservices Concept)**, **MySQL**, dan **React.js**.

---

## 🎯 Fitur Sesuai Kebutuhan Use Case

### 1. Aplikasi Absensi WFH Karyawan
- **Login Karyawan**: Autentikasi aman berbasis JWT (disimpan dalam `httpOnly` cookie).
- **Capture Tanggal & Waktu**: Otomatis merekam timestamp server saat karyawan melakukan absensi.
- **Upload / Ambil Foto Bukti WFH**:
  - Live capture foto selfie menggunakan kamera / webcam perangkat.
  - Opsi fallback upload file gambar jika perangkat tidak memiliki webcam.
- **Riwayat Absensi Mandiri**: Karyawan dapat memantau riwayat kehadiran, status tepat waktu / terlambat, serta melihat kembali foto bukti yang telah disubmit.

### 2. Aplikasi Monitoring Karyawan (HR Admin)
- **Master Data Karyawan (CRUD)**:
  - HRD dapat menambah karyawan baru (auto-generate Employee Code: `EMP-0001`, `EMP-0002`, dst).
  - Mengubah data profil karyawan (nama, email, departemen, jabatan, role, password).
  - Fitur Soft Delete karyawan agar riwayat absensi historis tetap aman.
- **Kontrol & Monitoring Absensi (View Only)**:
  - Memantau seluruh data absensi karyawan secara real-time.
  - Filter pencarian berdasarkan nama/NIP karyawan, rentang tanggal, dan status presensi.
  - Preview foto bukti kerja karyawan secara langsung (High-Resolution Modal Viewer).

---

## 🏛️ Konsep Arsitektur (Microservices)

Sistem backend dirancang dengan menerapkan konsep **Microservices Architecture** berbasis NestJS:

```
[ Frontend: React.js (Vite) ] :5173
             │  (REST API / Cookies)
             ▼
[ API Gateway (NestJS HTTP) ] :3000
   │               │               │
   │ (TCP :4001)   │ (TCP :4002)   │ (TCP :4003)
   ▼               ▼               ▼
[ Auth Service ] [ Employee Service ] [ Attendance Service ]
   │               │                   │
   └───────► [ MySQL Database ] ◄──────┘
                   │
             [ Storage Foto ]
```

- **API Gateway (:3000)**: Pintu gerbang utama untuk routing REST API, CORS, Helmet security, dan validasi token sesi.
- **Auth Service (:4001 TCP)**: Menangani validasi kredensial, perbandingan password bcrypt, dan penerbitan token JWT.
- **Employee Service (:4002 TCP)**: Menangani operasi data master karyawan (CRUD) dan pencarian data user.
- **Attendance Service (:4003 TCP)**: Menangani pencatatan absensi, kalkulasi keterlambatan, dan penyimpanan bukti foto WFH.

---

## 🔑 Akun Demo Siap Pakai

Tersedia tombol **Quick-Fill Demo** di halaman login untuk kemudahan pengujian:

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **HR Admin** | `admin@company.com` | `AdminWFH#2026` | Akses penuh CRUD Karyawan & Monitoring Absensi |
| **Karyawan** | `budi@company.com` | `BudiWFH#2026` | Akses Absensi WFH (Kamera & Foto) & Riwayat Pribadi |

---

## 🚀 Panduan Menjalankan Aplikasi (Hanya 3 Langkah)

### Prasyarat
- Node.js (v20 atau v22+)
- Docker Desktop (untuk menjalankan database MySQL)

### Langkah 1: Jalankan Database MySQL
Buka terminal di root project:
```bash
docker compose up -d mysql
```
*(MySQL akan otomatis berjalan di port `3306` dan membuat database `wfh_employee` & `wfh_attendance`)*

### Langkah 2: Jalankan Backend (1 Perintah)
Buka terminal baru:
```bash
cd backend
npm install
npm run seed:demo    # (Opsional) Mengisi data awal demo akun
npm run start:dev
```
> **Catatan**: Perintah `npm run start:dev` akan menyalakan API Gateway (:3000) beserta seluruh Microservices (Auth :4001, Employee :4002, Attendance :4003) secara otomatis dalam satu terminal.

Dokumentasi Swagger API aktif di: `http://localhost:3000/api/docs`

### Langkah 3: Jalankan Frontend
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Buka browser di: **`http://localhost:5173`**

---

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM, `@nestjs/microservices` (TCP Transport), Passport JWT, Bcrypt.
- **Database**: MySQL 8.
- **Frontend**: React.js, TypeScript, Tailwind CSS, Lucide Icons, Axios.
- **CI/CD**: GitHub Actions (Build & Type-Check verification).
