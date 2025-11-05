# Profema Questionnaire - Kompletní Setup Guide

## 📋 Přehled projektu

Fullstack aplikace pro gynekologický anamnestický dotazník s **DUAL WRITE** mechanismem pro zápis do dvou databází současně (Profema + Astraia).

### Stack
- **Backend**: NestJS 10.4.8 + TypeORM + TimescaleDB (port 5433)
- **Frontend**: Next.js 15 + React 19 + Ant Design 5.22 + TanStack Query v5
- **Validace**: Zod + React Hook Form
- **Auth**: JWT + Passport

---

## 🚀 Instalace a spuštění

### 1. Backend Setup

```bash
cd /home/tomas/projects/profema-questionnaire/backend

# Instalace závislostí
npm install

# Spuštění v development módu
npm run start:dev

# Build pro produkci
npm run build
npm run start:prod
```

**Backend běží na:** `http://localhost:5001`
**API endpoint:** `http://localhost:5001/api`

### 2. Frontend Setup

```bash
cd /home/tomas/projects/profema-questionnaire/frontend

# Instalace závislostí
npm install

# Spuštění v development módu
npm run dev

# Build pro produkci
npm run build
npm run start
```

**Frontend běží na:** `http://localhost:5002`

---

## 🗄️ Databázová konfigurace

### DŮLEŽITÉ: TimescaleDB port 5433!

Obě databáze (Profema i Astraia) běží na **port 5433** (ne 5432!).

### Připojení přes socket

```env
PROFEMA_DB_HOST=/var/run/postgresql
PROFEMA_DB_PORT=5433

ASTRAIA_DB_HOST=/var/run/postgresql
ASTRAIA_DB_PORT=5433
```

### Vytvoření databází

```bash
# Připojení k PostgreSQL
psql -U postgres -p 5433

# Vytvoření databází
CREATE DATABASE profema;
CREATE DATABASE astraia;

# Vytvoření uživatele
CREATE USER profema_app_user WITH PASSWORD 'profema_secure_2025';

# Přidělení oprávnění
GRANT ALL PRIVILEGES ON DATABASE profema TO profema_app_user;
GRANT ALL PRIVILEGES ON DATABASE astraia TO profema_app_user;
```

### Migrace

Backend automaticky vytvoří tabulky při prvním spuštění (`synchronize: true` v dev módu).

Pro produkci doporučuji vytvořit TypeORM migrace:

```bash
npm run typeorm migration:generate -- -n InitialSchema
npm run typeorm migration:run
```

---

## 🔐 První uživatel (Admin)

Po startu backendu vytvoř prvního uživatele pomocí API:

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

Poté se přihlas na frontendu: `http://localhost:5002/login`

---

## 📊 DUAL WRITE Mechanismus

Klíčová funkce aplikace - transakční zápis do obou databází současně.

### Jak to funguje?

1. **Vytvoření pacientky** - zápis do Astraia DB (INTEGER id)
2. **Vytvoření v Profema** - zápis do Profema DB (UUID) + foreign key na Astraia
3. **Rollback při chybě** - pokud selže jakýkoli krok, celá transakce se vrátí zpět

### Backend kód

```typescript
// patients.service.ts
async create(createPatientDto: CreatePatientDto): Promise<Patient> {
  const queryRunner = this.profemaDataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // 1. Zápis do Astraia (INTEGER id)
    const astraiaPatient = await this.astraiaPatientRepo.save({...});

    // 2. Zápis do Profema (UUID + FK)
    const profemaPatient = await profemaRepo.save({
      ...dto,
      astraia_patient_id: astraiaPatient.id
    });

    await queryRunner.commitTransaction();
    return profemaPatient;
  } catch (e) {
    await queryRunner.rollbackTransaction();
    throw e;
  }
}
```

---

## 🎨 Multi-Step Formulář

5 kroků pro vyplnění kompletního dotazníku:

1. **Základní údaje** - jméno, rodné číslo, kontakty
2. **Těhotenství** - LMP, EDD, gestační věk
3. **Zdravotní anamnéza** - chronická onemocnění, léky, alergie
4. **Předchozí těhotenství** - počet porodů, potratů, komplikace
5. **GDPR** - souhlas se zpracováním osobních údajů

### Frontend validace pomocí Zod

Každý krok má vlastní Zod schéma pro validaci dat na straně klienta i serveru.

---

## 🧪 Testování

### Backend

```bash
cd backend
npm test
npm run test:e2e
```

### Frontend

```bash
cd frontend
npm run lint
npm run type-check
```

---

## 📁 Struktura projektu

```
profema-questionnaire/
├── backend/
│   ├── src/
│   │   ├── config/                 # DB konfigurace
│   │   │   ├── profema.database.config.ts
│   │   │   └── astraia.database.config.ts
│   │   ├── entities/
│   │   │   ├── profema/           # Profema entity (UUID)
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── patient.entity.ts
│   │   │   │   └── questionnaire.entity.ts
│   │   │   └── astraia/           # Astraia entity (INTEGER)
│   │   │       └── astraia-patient.entity.ts
│   │   ├── modules/
│   │   │   ├── auth/              # JWT autentizace
│   │   │   ├── patients/          # DUAL WRITE service!
│   │   │   ├── questionnaires/
│   │   │   └── google/            # Skeleton pro Google Drive
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx           # Seznam pacientek
    │   │   └── questionnaire/
    │   │       └── page.tsx       # Multi-step form
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   └── forms/
    │       ├── PatientBasicInfo.tsx
    │       ├── PregnancyInfo.tsx
    │       ├── HealthHistory.tsx
    │       ├── PreviousPregnancies.tsx
    │       └── GDPRConsent.tsx
    ├── lib/
    │   ├── api.ts                 # Axios API client
    │   └── validation.ts          # Zod schemas
    └── package.json
```

---

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Registrace uživatele
- `POST /api/auth/login` - Přihlášení

### Patients (vyžaduje JWT)
- `GET /api/patients` - Seznam všech pacientek
- `GET /api/patients/:id` - Detail pacientky
- `POST /api/patients` - Vytvoření pacientky (DUAL WRITE!)
- `PUT /api/patients/:id` - Aktualizace pacientky
- `DELETE /api/patients/:id` - Smazání pacientky
- `GET /api/patients/search?q=<query>` - Vyhledávání

### Questionnaires (vyžaduje JWT)
- `GET /api/questionnaires` - Seznam všech dotazníků
- `GET /api/questionnaires/:id` - Detail dotazníku
- `GET /api/questionnaires/patient/:patientId` - Dotazníky pacientky
- `POST /api/questionnaires` - Vytvoření dotazníku
- `PUT /api/questionnaires/:id` - Aktualizace dotazníku
- `PATCH /api/questionnaires/:id/complete` - Označení jako dokončený
- `DELETE /api/questionnaires/:id` - Smazání dotazníku

### Google (skeleton)
- `POST /api/google/upload/:questionnaireId` - Upload PDF do Google Drive
- `GET /api/google/auth/callback` - OAuth callback

---

## ⚙️ Konfigurace

### Backend .env

```env
NODE_ENV=development
PORT=5001

# TimescaleDB - Profema (PORT 5433!)
PROFEMA_DB_HOST=/var/run/postgresql
PROFEMA_DB_PORT=5433
PROFEMA_DB_USERNAME=profema_app_user
PROFEMA_DB_PASSWORD=profema_secure_2025
PROFEMA_DB_NAME=profema

# TimescaleDB - Astraia (PORT 5433!)
ASTRAIA_DB_HOST=/var/run/postgresql
ASTRAIA_DB_PORT=5433
ASTRAIA_DB_USERNAME=profema_app_user
ASTRAIA_DB_PASSWORD=profema_secure_2025
ASTRAIA_DB_NAME=astraia

# JWT
JWT_SECRET=profema_jwt_secret_2025_super_secure_key_change_in_production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5002
FRONTEND_URL=http://localhost:5002
```

### Frontend .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## 🐛 Troubleshooting

### Backend se nepřipojí k databázi

1. Zkontroluj, že TimescaleDB běží na portu 5433:
   ```bash
   sudo systemctl status postgresql
   sudo netstat -tlnp | grep 5433
   ```

2. Ověř socket připojení:
   ```bash
   ls -la /var/run/postgresql/
   psql -U profema_app_user -h /var/run/postgresql -p 5433 -d profema
   ```

3. Zkontroluj oprávnění:
   ```sql
   \l  # seznam databází
   \du # seznam uživatelů
   ```

### Frontend Error: "Cannot find module '@ant-design/nextjs-registry'"

Ant Design 5.22 vyžaduje registry pro Next.js 15:

```bash
npm install @ant-design/nextjs-registry
```

### CORS Error

Zkontroluj, že CORS_ORIGIN v backend .env obsahuje frontend URL:

```env
CORS_ORIGIN=http://localhost:5002
```

---

## 📝 TODO (budoucí vylepšení)

- [ ] Implementovat Google OAuth a Drive upload
- [ ] Generování PDF z dotazníků pomocí Puppeteer
- [ ] Role-based access control (admin, doctor, assistant)
- [ ] Email notifikace při vytvoření dotazníku
- [ ] Export dotazníků do CSV/Excel
- [ ] Dashboard s grafy a statistikami
- [ ] Mobilní responzivní design
- [ ] Unit a E2E testy

---

## 👥 Kontakt

Pro otázky a podporu kontaktujte:
- Email: admin@profema.cz
- Dokumentace: /home/tomas/projects/profema-questionnaire/

---

**Vytvořeno:** Listopad 2025
**Verze:** 1.0.0
**License:** Proprietární
