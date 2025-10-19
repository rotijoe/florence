# 🩺 Florence — Personal Health Event Tracker

## 📘 Overview

**Florence** is a privacy-first web application that allows users to **store, organise, and track their personal healthcare information**.

Users can create **Health Tracks** (e.g. “Blood Tests”, “Back Pain”, “Physiotherapy”) and attach **events** such as doctor letters, test results, notes, and appointments — both past and future.

Florence empowers users to take ownership of their medical data in a clear, secure, and human way — without relying on hospital systems.

### 🧭 Roadmap Summary

- **MVP:** Manual upload and organisation of health data
- **Phase 2:** Integrate with NHS APIs (FHIR-compliant)
- **Long-term:** AI-assisted summaries, insights, and health sharing tools

---

## 🚀 MVP Goals

1. User authentication & secure sessions
2. Create and manage multiple **Health Tracks**
3. Add **Events** (notes, appointments, letters, results) to tracks
4. Upload, preview, and download medical documents via S3
5. Send transactional emails (verification, password reset) via Resend
6. Ensure encryption, privacy, and GDPR compliance

---

## 🧠 Future Phases

- NHS integration (FHIR/NHS Login)
- AI health summaries and natural language search
- Secure sharing with healthcare providers
- Mobile version (React Native / Expo)
- User-controlled encryption keys

---

## 🏗️ Tech Stack

| Layer               | Technology               | Purpose                                       |
| ------------------- | ------------------------ | --------------------------------------------- |
| **Frontend**        | Next.js (App Router)     | Main web app, forms, and UI                   |
|                     | shadcn/ui + Tailwind CSS | Component library & styling                   |
|                     | React Hook Form + Zod    | Form handling and validation                  |
| **Backend**         | Hono (TypeScript)        | API layer (lightweight, fast)                 |
|                     | Prisma ORM               | DB access and migrations                      |
|                     | PostgreSQL (Neon)        | Persistent storage                            |
| **Auth**            | Better Auth              | Data ownership & privacy-first authentication |
| **Storage**         | S3-compatible (AWS)      | Document and file storage                     |
| **Email**           | Resend                   | Transactional emails                          |
| **CI/CD**           | GitHub Actions + Vercel  | Automated deploys                             |
| **Package Manager** | pnpm                     | Monorepo and dependency management            |

---

## 🔐 Security & Privacy

- **Encryption:** TLS in transit, PostgreSQL encryption at rest
- **Access control:** Per-user ownership enforced in DB queries
- **File access:** Signed URLs for uploads/downloads
- **Compliance:** Aligned with GDPR and NHS DSP Toolkit principles
- **Data residency:** Hosted in UK or EU regions

---

## 🧩 Architecture Overview

+---------------------+ +------------------------+
| Next.js Frontend | <------> | Hono API (TypeScript)|
| - Forms, UI | | - Auth (Better Auth) |
| - Uploads | | - CRUD (Prisma) |
+---------------------+ +------------------------+
| |
| |
v v
+---------------------+ +------------------------+
| PostgreSQL (Neon) | | S3 (Cloudflare R2) |
| - Users, Tracks, | | - File storage |
| Events tables | | - Signed URLs |
+---------------------+ +------------------------+
