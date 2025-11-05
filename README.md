# 🏥 Profema Questionnaire - Gynekologický anamnestický dotazník

Fullstack aplikace pro sběr anamnestických údajů těhotných pacientek s **transakcí dual-write mechanismem** pro souběžný zápis do dvou databází (Profema + Astraia).

---

## 🚀 Quick Start

```bash
# 1. Backend
cd /home/tomas/projects/profema-questionnaire/backend
npm install
npm run start:dev

# 2. Frontend (v novém terminálu)
cd /home/tomas/projects/profema-questionnaire/frontend
npm install
npm run dev
```

**Backend:** http://localhost:5001/api
**Frontend:** http://localhost:5002

---

## 📦 Stack

### Backend
- **NestJS 10.4.8** - Enterprise Node.js framework
- **TypeORM 0.3.20** - ORM s podporou transakcí
- **TimescaleDB** - PostgreSQL na port **5433** (ne 5432!)
- **JWT + Passport** - Autentizace
- **Class Validator** - Validace DTO

### Frontend
- **Next.js 15** - React framework s App Router
- **React 19** - Nejnovější React
- **Ant Design 5.22** - UI komponenty
- **TanStack Query v5** - Server state management
- **React Hook Form** - Formulářový management
- **Zod** - Schema validace

---

## 🎯 Hlavní funkce

### ✅ DUAL WRITE System
Transakční zápis do dvou databází současně:
1. **Astraia DB** (legacy system) - INTEGER id
2. **Profema DB** (nový system) - UUID + foreign key

**Rollback** při jakékoli chybě zajišťuje data konzistenci.

### ✅ Multi-Step Form
5 kroků pro kompletní anamnézu:
1. Základní údaje pacientky
2. Informace o těhotenství
3. Zdravotní anamnéza
4. Předchozí těhotenství
5. GDPR souhlas

---

## 📁 Vytvořené soubory

### Backend (40 souborů)
```
backend/src/
├── config/
│   ├── profema.database.config.ts
│   └── astraia.database.config.ts
├── entities/
│   ├── profema/ (user, patient, questionnaire)
│   └── astraia/ (astraia-patient)
├── modules/
│   ├── auth/ (6 souborů)
│   ├── patients/ (4 soubory) - DUAL WRITE!
│   ├── questionnaires/ (4 soubory)
│   └── google/ (3 soubory)
├── common/guards/
├── app.module.ts
└── main.ts
```

### Frontend (14 souborů)
```
frontend/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── questionnaire/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/forms/ (5 komponent)
└── lib/ (api.ts, validation.ts)
```

---

## 🗄️ Databáze - Port 5433!

```env
PROFEMA_DB_HOST=/var/run/postgresql
PROFEMA_DB_PORT=5433

ASTRAIA_DB_HOST=/var/run/postgresql
ASTRAIA_DB_PORT=5433
```

---

## 👤 První přihlášení

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@profema.cz",
    "password": "Profema2025!",
    "first_name": "Admin",
    "last_name": "Profema",
    "role": "admin"
  }'
```

Poté se přihlas na: **http://localhost:5002/login**

---

## 📚 Dokumentace

**Detailní setup guide:** [SETUP.md](./SETUP.md)
- Kompletní instalace
- Databázové migrace
- API dokumentace
- Troubleshooting

---

## 🔗 API Endpoints

### Auth (public)
- `POST /api/auth/register`
- `POST /api/auth/login`

### Patients (protected)
- `GET /api/patients` - Seznam
- `POST /api/patients` - **DUAL WRITE!**
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Questionnaires (protected)
- `GET /api/questionnaires`
- `POST /api/questionnaires`
- `GET /api/questionnaires/:id`
- `PATCH /api/questionnaires/:id/complete`

---

## ✅ Ready to Run!

```bash
# Terminal 1 - Backend
cd /home/tomas/projects/profema-questionnaire/backend
npm install && npm run start:dev

# Terminal 2 - Frontend
cd /home/tomas/projects/profema-questionnaire/frontend
npm install && npm run dev
```

**Otevři:** http://localhost:5002

---

**Vytvořeno:** Listopad 2025 | **Verze:** 1.0.0
**Klient:** MUDr. Veronika Frisová | **Developer:** TK Servis Technology
