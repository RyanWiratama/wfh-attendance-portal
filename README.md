# Enterprise Work From Home (WFH) Attendance & Monitoring System

A scalable, production-grade **Fullstack Microservices System** designed for **Remote Employee Attendance (Check-In / Check-Out with Live Photo Verification)** and **Real-Time HR Management & Attendance Monitoring**.

Built with **NestJS Microservices (TCP Transport)**, **MySQL 8 (ACID & Pessimistic Locking)**, **React 19 (Atomic Design)**, and **Tailwind CSS v4**.

Developed by **Ryan Wiratama** ([GitHub: @RyanWiratama](https://github.com/RyanWiratama)).

---

## 📋 Table of Contents
1. [Core Features](#-core-features)
2. [System Architecture](#-system-architecture)
3. [Tech Stack](#-tech-stack)
4. [Demo Accounts](#-demo-accounts)
5. [Quick Start & Setup](#-quick-start--setup)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-1-command)
   - [Option B: Local Development](#option-b-manual-local-development)
6. [API Documentation & Swagger](#-api-documentation--swagger)
7. [Database Schema & Integrity](#-database-schema--integrity)
8. [Security & Engineering Best Practices](#-security--engineering-best-practices)
9. [Automated Testing & Quality Assurance](#-automated-testing--quality-assurance)
10. [Future Enhancements](#-future-enhancements)

---

## 🌟 Core Features

### 1. Remote Employee Attendance Portal (WFH)
- **Session Security & Authentication**: JWT-based authentication stored in secure `httpOnly` cookies (resistant against XSS).
- **Twice-Daily Attendance (Check-In & Check-Out)**:
  - **Morning Check-In**: Live webcam selfie snapshot capture, server-side WIB timestamping, and optional morning task notes.
  - **Evening Check-Out**: End-of-day selfie snapshot verification and automated working hour calculations.
- **Automated Lateness Detection (08:00 - 17:00 WIB)**:
  - Standard shift: Start at **08:00 WIB**, end at **17:00 WIB**.
  - Grace period / tolerance: **15 minutes** (until 08:15:00 WIB). Check-ins after 08:15:00 WIB are automatically flagged as **Terlambat** (Late) with exact minute penalties.
- **Interactive Camera Module**: HTML5 webcam with real-time selfie mirror, instant canvas capture, camera flipping/restart, and fallback image file upload.
- **Self-Service Attendance History**: Employees can inspect their personal attendance records, punctuality status, and view uploaded selfie verification photos.

### 2. HR Admin Monitoring & Employee Management Portal
- **Employee Master Data (CRUD)**:
  - Automated employee code sequencing (`EMP-0001`, `EMP-0002`, ...).
  - Strong password hashing with `bcryptjs` (salt rounds: 12).
  - Edit employee profiles (Name, Email, Role, Department, Position, Reset Password).
  - Safe Soft-Delete mechanism (preserves historical attendance integrity).
- **Real-Time Attendance Monitoring (View Only)**:
  - Live inspection dashboard for all remote employee check-ins across departments.
  - Multi-parameter filtering (Date range `startDate`/`endDate`, employee search, punctuality status).
  - Department summary metrics (Total Logs, On Time, Late).
  - **High-Resolution Lightbox**: Click to view high-resolution verification selfie photos with detailed timestamp metadata.
- **Flexible Work Schedule Management**:
  - Configure company standard working hours, check-out thresholds, and grace period minutes dynamically.

---

## 🏗 System Architecture

The project is structured as a **Monorepo Microservices Architecture**:

```
                       ┌──────────────────────────────────────────────┐
                       │           Frontend React 19 (SPA)            │
                       │     (Atomic Design: Atoms, Molecules,        │
                       │          Organisms, Templates, Pages)        │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTP / JSON / Multipart
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          API Gateway (NestJS HTTP)           │
                       │            Port 3000 / Swagger UI            │
                       │  - Helmet, Rate Limiter (Throttler), CORS    │
                       │  - JWT Auth Guard & RBAC Roles Guard         │
                       │  - Magic-byte File Upload Validation         │
                       └──────┬───────────────┼───────────────┬───────┘
                              │ TCP :4001     │ TCP :4002     │ TCP :4003
                              ▼               ▼               ▼
                       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                       │    Auth     │ │  Employee   │ │ Attendance  │
                       │ Microservice│ │ Microservice│ │ Microservice│
                       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
                              │               │               │
                              │               ▼               ▼
                              │        ┌─────────────┐ ┌─────────────┐
                              │        │  MySQL DB:  │ │  MySQL DB:  │
                              └───────►│wfh_employee │ │    wfh_     │
                                       │             │ │ attendance  │
                                       └─────────────┘ └──────┬──────┘
                                                              ▼
                                                       ┌─────────────┐
                                                       │ Disk Storage│
                                                       │(WFH Photos) │
                                                       └─────────────┘
```

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4, built with Vite 6 / Rolldown, structured cleanly according to **Atomic Design**.
- **API Gateway**: Handles incoming HTTP requests, enforces rate-limiting and validation pipes, decodes JWT cookies, and delegates operations via **TCP Microservice Clients**.
- **Microservices**:
  - `auth-service`: Handles credential authentication, bcrypt comparisons, JWT issuance and payload signing.
  - `employee-service`: Manages the employee master database (`wfh_employee`), code generation, and employee CRUD operations.
  - `attendance-service`: Manages the attendance logs (`wfh_attendance`), schedule evaluation, ACID transactions with *pessimistic locking*, and private disk storage for selfie uploads.

---

## 💻 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend Framework** | NestJS 12 | Monorepo Microservices with TCP transport protocol |
| **Language** | TypeScript 5.7+ | Strict type-safety across all services and frontend |
| **Database** | MySQL 8.0 | Relational Database with InnoDB engine |
| **ORM** | TypeORM | Schema definitions, relations, and parameterized queries |
| **Frontend Framework** | React 19 + Vite | Fast HMR & production bundle optimization |
| **Styling** | Tailwind CSS v4 | Utility-first styling with modern CSS variables |
| **Design Methodology**| Atomic Design | Atoms $\rightarrow$ Molecules $\rightarrow$ Organisms $\rightarrow$ Templates $\rightarrow$ Pages |
| **State & Data Fetching** | TanStack Query v5 | Server state caching, background invalidation, and mutations |
| **Form Handling** | React Hook Form + Zod | Schema-based client-side validation |
| **Containerization** | Docker & Docker Compose | Multi-stage image builds with isolated networking |
| **Automated Testing** | Jest, Supertest, Vitest | Comprehensive Unit, Integration, and Component tests |

---

## 🔑 Demo Accounts

The project includes an automated database seeder and a **1-Click Quick-Fill** helper on the login screen:

| Role | Account Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | HR Administrator | `admin@company.com` | `AdminWFH#2026` | Full CRUD on Employees, Attendance Monitoring, Schedule Settings, Attendance Check-In/Out |
| **Employee** | Budi Santoso | `budi@company.com` | `BudiWFH#2026` | WFH Check-In & Check-Out, Personal Attendance History |
| **Employee** | Ryan Wiratama | `ryanwiratama@gmail.com` | `RyanWFH#2026` | WFH Check-In & Check-Out, Personal Attendance History |

---

## 🚀 Quick Start & Setup

### Option A: Docker Compose (1 Command)

Ensure Docker Desktop is installed and running.

1. Clone this repository:
   ```bash
   git clone https://github.com/RyanWiratama/<repo-name>.git
   cd <repo-name>
   ```

2. Start all services (MySQL, 4 Microservices, Nginx Frontend):
   ```bash
   docker compose up --build
   ```

3. Access the web application:
   - **Frontend Web UI**: [http://localhost:5173](http://localhost:5173) or [http://localhost](http://localhost)
   - **Backend API Docs (Swagger)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
   - **MySQL Database**: `localhost:3306` (User: `wfh_user`, Password: `wfh_secret_pass`)

---

### Option B: Manual (Local Development)

#### 1. Setup MySQL Database
Start a local MySQL 8 instance or run the dockerized database:
```bash
docker compose up -d mysql
```

#### 2. Run Backend Services
```bash
cd backend
npm install

# Seed demo administrator and employee accounts
npm run seed:demo

# Run all microservices in separate terminals (or with watch mode)
npm run start:dev employee-service
npm run start:dev auth-service
npm run start:dev attendance-service
npm run start:dev api-gateway
```

#### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📖 API Documentation & Swagger

The API Gateway hosts interactive OpenAPI (Swagger) documentation available at:
👉 **`http://localhost:3000/api/docs`**

### Key Endpoints:
- `POST /api/auth/login` - Login and receive `httpOnly` session cookie (`wfh_session`).
- `POST /api/auth/logout` - Clear session cookie.
- `GET /api/auth/me` - Retrieve current authenticated profile.
- `GET /api/employees` - List employees with search, pagination, and department filter.
- `POST /api/employees` - Create new employee with auto-generated code.
- `PATCH /api/employees/:id` - Update employee details or reset password.
- `DELETE /api/employees/:id` - Soft-delete employee record.
- `GET /api/attendances/today` - Today's attendance status for logged-in user.
- `POST /api/attendances/check-in` - Submit check-in with selfie photo upload.
- `POST /api/attendances/check-out` - Submit check-out with selfie photo upload.
- `GET /api/attendances/my-history` - Personal attendance history.
- `GET /api/attendances/monitoring` - Department-wide attendance monitoring for HR.
- `GET /api/attendances/photos/:filename` - Authenticated stream for attendance selfie photos.
- `GET /api/attendances/schedules` - Retrieve standard work schedule.
- `PATCH /api/attendances/schedules/:id` - Update working hours and late tolerance.

---

## 🛡 Security & Engineering Best Practices

1. **Authentication & Session Defense**:
   - JWT tokens signed with strong 32+ character secrets, dispatched in `httpOnly`, `SameSite=Lax`, and `Secure` (production) cookies to prevent cross-site scripting (XSS) extraction.
2. **File Upload Verification (Magic-Bytes Inspection)**:
   - File uploads are validated at the byte-header level (`image/jpeg`, `image/png`, `image/webp`), preventing executable code injection disguised as images.
   - Uploaded files are assigned UUID names and stored outside the public document root. Access requires an authenticated session.
   - Strict path traversal prevention (`../`).
3. **ACID Transactions & Pessimistic Locking**:
   - Attendance check-in and check-out sequences utilize TypeORM QueryRunner with pessimistic write locks (`SELECT ... FOR UPDATE`), preventing double-submission race conditions when users double-click.
4. **Network & Infrastructure Security**:
   - `helmet` integration enforcing modern Content Security Policies (CSP), HSTS, and frame protections.
   - IP-based rate limiting via `@nestjs/throttler` (100 requests per minute) to deter brute-force and DoS attacks.
   - Strict DTO input validation with `class-validator` and `class-transformer`.

---

## 🧪 Automated Testing & Quality Assurance

Comprehensive unit and integration test suites covering critical business logic:

### Backend Testing:
```bash
cd backend
npm test
```
*Covers late calculation algorithms, JWT authentication strategies, role guards, storage adapters, and employee service logic (21 tests PASS).*

### Frontend Testing:
```bash
cd frontend
npm test
```
*Covers UI components, input validation, live clock, button states, and login forms using Vitest and React Testing Library (18 tests PASS).*

---

## 🔮 Future Enhancements

Potential extensions for enterprise-scale deployments:
1. **Face Recognition & Liveness Detection (AI)**:
   - Integrate computer vision models (TensorFlow.js / AWS Rekognition) to verify identity against employee profile pictures and detect blink/liveness to prevent printed photo spoofing.
2. **Geofencing & GPS Radius Validation**:
   - Capture device coordinates via Geolocation API with distance verification against approved WFH addresses.
3. **Message Broker (RabbitMQ / Kafka)**:
   - Transition internal TCP microservice communication to asynchronous event streams for HR late notification alerts.
4. **Observability & Distributed Tracing**:
   - OpenTelemetry integration with Prometheus and Grafana for distributed request tracing across services.
5. **Mobile Application**:
   - React Native mobile app utilizing the existing API Gateway endpoints for mobile check-in.

---

## 👤 Author
**Ryan Wiratama**
- GitHub: [@RyanWiratama](https://github.com/RyanWiratama)
