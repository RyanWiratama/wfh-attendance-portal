# WFH Attendance & Employee Monitoring Portal

Aplikasi web fullstack untuk **Presensi WFH Karyawan (Check-in/Check-out dengan Bukti Foto)** dan **Monitoring Karyawan untuk HRD (CRUD Master Karyawan, Pengaturan Jam Kerja, & Kontrol Absensi)**.

Dibuat untuk memenuhi technical test Fullstack Developer menggunakan **NestJS (Microservices Concept)**, **MySQL**, dan **React.js**.

---

## 🎯 Fitur Sesuai Kebutuhan Use Case

### 1. Aplikasi Absensi WFH Karyawan
- **Login Karyawan**: Autentikasi aman berbasis JWT (disimpan dalam `httpOnly` cookie) dengan **Toggle Icon Mata** untuk melihat/menyembunyikan kata sandi.
- **Capture Tanggal & Waktu**: Otomatis merekam timestamp server WIB saat karyawan melakukan absensi.
- **Informasi Batas Waktu Absen Dinamis**: Menampilkan ketentuan batas check-in (dengan toleransi keterlambatan 15 menit) dan batas jam check-out sesuai jadwal kerja karyawan.
- **Upload / Ambil Foto Bukti WFH**:
  - Live capture foto selfie menggunakan webcam/kamera perangkat.
  - Fallback upload file gambar jika perangkat tidak memiliki kamera aktif.
- **Riwayat Absensi Mandiri**: Karyawan dapat memantau riwayat kehadiran, status tepat waktu / terlambat, serta melihat kembali foto bukti yang telah disubmit via modal lightbox.

### 2. Aplikasi Monitoring Karyawan (HR Admin)
- **Master Data Karyawan (CRUD)**:
  - HRD dapat menambah karyawan baru (auto-generate Kode Karyawan: `EMP-0001`, `EMP-0002`, dst).
  - **Master Jam Kerja Karyawan**: Mengatur jam masuk dan jam absen keluar spesifik untuk tiap karyawan (misal `08:00 - 17:00 WIB`, shift siang, dsb).
  - Mengubah data profil karyawan (nama, email, departemen, jabatan, role, password).
  - Fitur Soft Delete karyawan agar riwayat absensi historis tetap aman.
- **Kontrol & Monitoring Absensi (View Only)**:
  - Memantau seluruh data absensi karyawan secara real-time.
  - **Pencarian Real-Time (Debounced)**: Pencarian cepat berdasarkan nama atau kode karyawan yang dikoordinasikan secara cerdas antar-microservice.
  - Filter rentang tanggal dan status presensi.
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

- **API Gateway (:3000)**: Pintu gerbang utama untuk routing REST API, CORS, Helmet security, koordinasi data antar-layanan, dan validasi token sesi.
- **Auth Service (:4001 TCP)**: Menangani validasi kredensial, perbandingan password bcrypt, dan penerbitan token JWT.
- **Employee Service (:4002 TCP)**: Menangani operasi data master karyawan (CRUD), jam kerja individual, dan pencarian data user.
- **Attendance Service (:4003 TCP)**: Menangani pencatatan absensi, kalkulasi keterlambatan dinamis, dan penyimpanan bukti foto WFH.

---

## 🔑 Akun Demo Siap Pakai

Tersedia tombol **Quick-Fill Demo** di halaman login untuk kemudahan pengujian:

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **HR Admin** | `admin@company.com` | `AdminWFH#2026` | Akses penuh CRUD Karyawan, Jam Kerja & Monitoring Absensi |
| **Karyawan** | `budi@company.com` | `BudiWFH#2026` | Akses Absensi WFH (Kamera & Foto) & Riwayat Pribadi |

---

## 🚀 Panduan Menjalankan Aplikasi

Tersedia dua opsi untuk menjalankan aplikasi:

### Opsi A: Jalankan Cepat (Development Mode)

#### Langkah 1: Jalankan Database MySQL
Buka terminal di root project:
```bash
docker compose up -d mysql
```
*(MySQL akan otomatis berjalan di port `3306` dan membuat database `wfh_employee` & `wfh_attendance`)*

#### Langkah 2: Jalankan Backend (1 Perintah)
Buka terminal baru:
```bash
cd backend
npm install
npm run start:dev
```
> **Catatan**: Perintah `npm run start:dev` akan menyalakan API Gateway (:3000) beserta seluruh Microservices (Auth :4001, Employee :4002, Attendance :4003) secara bersamaan dalam satu terminal.

Dokumentasi Swagger API aktif di: **`http://localhost:3000/api/docs`**

#### Langkah 3: Jalankan Frontend
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Buka browser di: **`http://localhost:5173`**

---

### Opsi B: Full Docker Deployment (Production Containerized)

Jika ingin menjalankan seluruh sistem (MySQL + 4 Microservices Backend + Frontend Nginx) sepenuhnya dalam kontainer Docker:

```bash
docker compose up -d --build
```

Setelah semua kontainer berstatus `healthy` dan `running`:
- **Frontend Web**: `http://localhost:5173` atau `http://localhost`
- **API Gateway**: `http://localhost:3000/api`
- **Swagger Docs**: `http://localhost:3000/api/docs`

Untuk menghentikan kontainer:
```bash
docker compose down
```

---

## 🛠️ Tech Stack

- **Backend**: NestJS 12, TypeScript, TypeORM, `@nestjs/microservices` (TCP Transport), Passport JWT, Bcrypt, Helmet, Swagger OpenAPI.
- **Database**: MySQL 8.
- **Frontend**: React.js 19, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod, TanStack Query, Axios.
- **DevOps**: Docker, Docker Compose, Nginx.
