
# 🏥 PH-HealthCare

**“Complete Hospital Management System”**

---

## 📌 Project Overview

**PH-HealthCare** is a **full-stack hospital management system** designed to digitize and automate real-world hospital operations.

The system connects **Patients, Doctors, Admins, and Super Admins** in a secure, scalable, and role-based platform.
Patients can book appointments, doctors can manage schedules and prescriptions, admins can control hospital operations, and super admins manage the entire system.

> ⚠️ This is **NOT a demo project**.
> This backend is designed to support **real hospital workflows**.

---

## 👥 Roles & Permissions

| Role            | Description               | Core Permissions                                          |
| --------------- | ------------------------- | --------------------------------------------------------- |
| **PATIENT**     | Hospital service receiver | Register, book appointments, view prescriptions & records |
| **DOCTOR**      | Medical professional      | Manage schedule, appointments, prescriptions              |
| **ADMIN**       | Hospital authority        | Manage doctors, patients, appointments, payments          |
| **SUPER_ADMIN** | System owner              | Manage admins, specialties, system logs                   |

> 🔐 **RBAC enforced at middleware + route level**

---

## 🛠️ Tech Stack (Backend)

> *(Implementation-agnostic, but designed for Node ecosystem)*

* Node.js
* Express / Fastify
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT / Session-based Auth
* Redis (sessions / queues)
* Cloud storage (medical files)
* Stripe (payments)
* Zod validation

---

## 🔐 Authentication & Security Features

* Email & password authentication
* Email verification flow
* Forgot & reset password
* Change password (optional + forced)
* Multi-device session management
* Logout single device / all devices
* Account status enforcement:

  * `PENDING`
  * `ACTIVE`
  * `BLOCKED`

---

## ✨ Features Breakdown

### 🌐 Public Features

* Browse doctors
* Filter doctors by specialty, fee, experience
* View doctor profile & reviews
* Authentication pages

---

### 🧑‍🦽 Patient Features

* Register & login
* Book appointments
* View appointment history
* Online payments
* View prescriptions
* Upload & view medical reports
* Submit doctor reviews
* Manage profile

---

### 🧑‍⚕️ Doctor Features

* Doctor profile management
* Schedule & availability slots
* View appointments
* Create prescriptions
* Access patient medical history
* View ratings & reviews

---

### 🧑‍💼 Admin Features

* Dashboard analytics
* Doctor management (verify/block)
* Patient management
* Appointment overview
* Payment & revenue tracking

---

### 🛡️ Super Admin Features

* Admin management
* Specialty management
* System logs & audit trail
* Platform-level control

---

## 📄 Pages & Routes (Backend Perspective)

### 🔓 Public Routes

| Method | Route                       | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/api/doctors`              | List doctors with filters |
| GET    | `/api/doctors/:id`          | Doctor details            |
| GET    | `/api/specialties`          | All specialties           |
| POST   | `/api/auth/login`           | Login                     |
| POST   | `/api/auth/register`        | Patient registration      |
| POST   | `/api/auth/verify-email`    | Email verification        |
| POST   | `/api/auth/forgot-password` | Request reset             |
| POST   | `/api/auth/reset-password`  | Reset password            |

---

### 👤 Authenticated (All Roles)

| Method | Route                       | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/api/auth/me`              | Current user       |
| POST   | `/api/auth/logout`          | Logout             |
| POST   | `/api/auth/logout-all`      | Logout all devices |
| GET    | `/api/sessions`             | Active sessions    |
| DELETE | `/api/sessions/:id`         | Remove session     |
| PATCH  | `/api/user/profile`         | Update profile     |
| PATCH  | `/api/user/change-password` | Change password    |

---

### 🧑‍🦽 Patient Routes (Private)

| Method | Route                     | Description      |
| ------ | ------------------------- | ---------------- |
| POST   | `/api/appointments`       | Book appointment |
| GET    | `/api/appointments/my`    | My appointments  |
| POST   | `/api/payments`           | Create payment   |
| GET    | `/api/payments/my`        | Payment history  |
| GET    | `/api/prescriptions/my`   | My prescriptions |
| POST   | `/api/medical-records`    | Upload report    |
| GET    | `/api/medical-records/my` | View reports     |
| POST   | `/api/reviews`            | Submit review    |

---

### 🧑‍⚕️ Doctor Routes (Private)

| Method | Route                          | Description             |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/api/doctor/appointments`     | Doctor appointments     |
| PATCH  | `/api/doctor/appointments/:id` | Update status           |
| POST   | `/api/doctor/schedule`         | Set availability        |
| GET    | `/api/doctor/schedule`         | View schedule           |
| POST   | `/api/doctor/prescriptions`    | Create prescription     |
| GET    | `/api/doctor/patients/:id`     | Patient medical history |
| PATCH  | `/api/doctor/profile`          | Update profile          |

---

### 🧑‍💼 Admin Routes (Private)

| Method | Route                     | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/api/admin/dashboard`    | Statistics          |
| GET    | `/api/admin/doctors`      | All doctors         |
| PATCH  | `/api/admin/doctors/:id`  | Verify/block doctor |
| GET    | `/api/admin/patients`     | All patients        |
| GET    | `/api/admin/appointments` | All appointments    |
| GET    | `/api/admin/payments`     | Revenue & payments  |

---

### 🛡️ Super Admin Routes (Private)

| Method | Route                              | Description      |
| ------ | ---------------------------------- | ---------------- |
| GET    | `/api/super-admin/dashboard`       | System overview  |
| POST   | `/api/super-admin/admins`          | Create admin     |
| GET    | `/api/super-admin/admins`          | Admin list       |
| POST   | `/api/super-admin/specialties`     | Create specialty |
| DELETE | `/api/super-admin/specialties/:id` | Remove specialty |
| GET    | `/api/super-admin/logs`            | System logs      |

---

## 🗃️ Database Entities (High Level)

* **User**
* **Session**
* **DoctorProfile**
* **PatientProfile**
* **Specialty**
* **Appointment**
* **Prescription**
* **MedicalRecord**
* **Payment**
* **Review**
* **AuditLog**

---

## 🔁 Core Flow Diagrams

### 👤 Patient Journey

```
Register → Verify Email → Login
   ↓
Browse Doctors
   ↓
Book Appointment → Pay
   ↓
Doctor Consultation
   ↓
View Prescription & Reports
```

---

### 🧑‍⚕️ Doctor Journey

```
Admin Verification
   ↓
Set Schedule
   ↓
View Appointments
   ↓
Create Prescription
```

---

### 📅 Appointment Status Flow

```
PENDING → CONFIRMED → COMPLETED
        ↘
        CANCELLED
```

---
