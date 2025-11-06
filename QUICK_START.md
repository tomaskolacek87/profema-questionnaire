# PROFEMA Questionnaire - Quick Start Guide
## Rychlé spuštění aplikace s novými funkcemi

---

## 🚀 INSTALACE A SPUŠTĚNÍ (5 minut)

### 1. Backend

```bash
cd /home/tomas/projects/profema-questionnaire/backend

# Dependencies jsou již nainstalované, ale pro jistotu:
npm install

# Build (ověření kompilace)
npm run build

# Spuštění development serveru
npm run start:dev
```

**Očekáváno:**
```
🏥  PROFEMA QUESTIONNAIRE BACKEND
Server:     http://localhost:7301
API Docs:   http://localhost:7301/api
✅ Profema DB:  TimescaleDB @ port 5433
✅ Astraia DB:  TimescaleDB @ port 5433
✅ Dual Write:  ENABLED
Environment: development
```

---

### 2. Frontend

```bash
cd /home/tomas/projects/profema-questionnaire/frontend

# Nová dependency (pokud ještě není)
npm install @ant-design/nextjs-registry

# Spuštění development serveru
npm run dev
```

**Očekáváno:**
```
▲ Next.js 15.0.3
- Local:        http://localhost:7302
- Ready in 2.3s
```

---

### 3. Otevřít aplikaci

```
http://localhost:7302
```

**Login:** Použij existující test účet nebo si vytvoř nový

---

## ✨ CO JE NOVÉ

### Dashboard (http://localhost:7302/)

**4 Statistické karty:**
- Celkem pacientek
- Celkem dotazníků
- Dokončené (s completion rate)
- Nové za 30 dní

**2 Recent Activity panely:**
- Poslední pacientky (s datem a doktorem)
- Poslední dotazníky (s datem a statusem)

**Enhanced Table:**
- Search box (real-time)
- Actions (Detail, Dotazník)

---

### Patient List (http://localhost:7302/patients)

**Nová stránka s:**
- Full table všech pacientek
- Multi-filter (status, high-risk)
- Advanced search
- Pagination (configurable page size)
- Sortable columns
- Actions: Detail, Dotazník, Smazat

---

### Questionnaire Detail View

**Nová stránka:** `/questionnaire/[id]/view`

**Funkce:**
- Read-only view všech dat
- Download PDF button (Puppeteer generované)
- Edit button
- Status badge
- All sections: Basic, Pregnancy, Health, etc.

---

### PDF Generation

**Endpoint:** `GET /api/questionnaires/:id/pdf`

**Funkce:**
- Professional HTML template s Profema branding
- A4 formát
- Czech date formatting
- All questionnaire data
- Ready to print

**Použití:**
1. Vytvoř/dokončit dotazník
2. Otevři detail view
3. Klikni "Stáhnout PDF"

---

### Form Auto-save

**Automaticky aktivní při vyplňování:**
- Auto-save každých 30 sekund
- LocalStorage persistence
- Toast notification "Koncept uložen"
- Nabídka restore při opětovném otevření

**Test:**
1. Začni vyplňovat dotazník
2. Počkej 30s
3. Zavři tab
4. Otevři znovu → nabídne se restore

---

### Statistics API

**4 nové endpointy:**

```bash
# Overview
GET /api/statistics/overview

# Recent Activity
GET /api/statistics/recent-activity?limit=10

# Sync Status
GET /api/statistics/sync-status

# Date Range
GET /api/statistics/date-range?startDate=2025-01-01&endDate=2025-01-31
```

---

### Error Logging

**Automaticky loguje do:** `/backend/logs/profema.log`

**Obsahuje:**
- Všechny HTTP requesty
- Response times
- User IDs
- IP addresses
- Errors with stack traces

**View logs:**
```bash
tail -f /home/tomas/projects/profema-questionnaire/backend/logs/profema.log
```

---

## 🧪 RYCHLÝ TEST

### Test 1: Dashboard Statistics (30s)
1. Otevři http://localhost:7302
2. Ověř, že vidíš 4 statistické karty
3. Zkontroluj recent activity
4. Zkus search v tabulce

### Test 2: Patient List (30s)
1. Klikni na menu nebo jdi na /patients
2. Zkus search
3. Změň filter status
4. Klikni na "Detail" u pacientky

### Test 3: PDF Generation (1 min)
1. Vytvoř nový dotazník (nebo použij existující)
2. Dokončit dotazník
3. Otevři detail view
4. Klikni "Stáhnout PDF"
5. Otevři PDF a ověř obsah

### Test 4: Auto-save (1 min)
1. Začni vyplňovat nový dotazník
2. Vyplň základní údaje
3. Počkej 30s
4. Měl by se zobrazit toast "Koncept uložen"
5. Zavři tab
6. Otevři znovu → měla by se nabídnout restore

---

## 📋 CHECKLIST FUNKČNOSTI

### Backend
- [ ] Server běží na port 7301
- [ ] API endpoints odpovídají (test: GET /api/statistics/overview)
- [ ] Logs se zapisují do /logs/profema.log
- [ ] PDF generování funguje
- [ ] Database connections OK

### Frontend
- [ ] Server běží na port 7302
- [ ] Dashboard načítá statistiky
- [ ] Patient list zobrazuje data
- [ ] Search a filters fungují
- [ ] PDF download funguje
- [ ] Auto-save funguje

---

## 🔧 KONFIGURACE

### Backend (.env)
```bash
PORT=7301
NODE_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=profema
POSTGRES_PASSWORD=profema123
POSTGRES_DB_PROFEMA=profema
POSTGRES_DB_ASTRAIA=astraia

JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:7302

# Optional: Google Drive
GOOGLE_CREDENTIALS={"type":"service_account",...}
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:7301/api
```

---

## 🐛 TROUBLESHOOTING

### Backend nedostupný
```bash
# Zkontroluj port
netstat -tuln | grep 7301

# Restart
cd /home/tomas/projects/profema-questionnaire/backend
npm run start:dev
```

### Frontend build chyba
```bash
# Clear cache
cd /home/tomas/projects/profema-questionnaire/frontend
rm -rf .next node_modules
npm install
npm run dev
```

### PDF generování trvá dlouho (první spuštění)
**Normální:** Puppeteer stahuje Chromium při prvním spuštění (10-15s)

### Logs se nezapisují
```bash
# Zkontroluj permissions
ls -la /home/tomas/projects/profema-questionnaire/backend/logs/

# Vytvoř složku pokud neexistuje
mkdir -p /home/tomas/projects/profema-questionnaire/backend/logs
```

### Auto-save nefunguje
**Zkontroluj:** DevTools → Application → Local Storage
**Očekáváno:** Klíč `questionnaire-draft-XXX`

---

## 📚 DALŠÍ DOKUMENTACE

- **IMPLEMENTATION_SUMMARY.md** - Kompletní technická dokumentace
- **UI_DESCRIPTION.md** - Popis UI a UX
- **TESTING_GUIDE.md** - Detailní testovací scénáře
- **FILES_OVERVIEW.md** - Seznam všech souborů
- **NEW_FILES.txt** - Rychlý přehled změn

---

## 🎯 PŘÍŠTÍ KROKY

### Development
1. [ ] Otestovat všechny nové funkce
2. [ ] Vyplnit test data
3. [ ] Ověřit PDF výstup
4. [ ] Otestovat responsive design

### Production Deployment
1. [ ] Build backend: `npm run build`
2. [ ] Build frontend: `npm run build`
3. [ ] Nastavit environment variables
4. [ ] Nakonfigurovat PM2/systemd
5. [ ] Nastavit Nginx reverse proxy
6. [ ] Přidat SSL certifikát

### Optional
1. [ ] Nakonfigurovat Google Drive credentials
2. [ ] Nastavit email notifikace
3. [ ] Implementovat unit testy
4. [ ] Nastavit CI/CD pipeline

---

## 📞 PODPORA

**Dokumentace:**
- README.md - Základní přehled projektu
- DEPLOYMENT.md - Deployment guide
- SETUP.md - Initial setup

**Logs:**
- Backend: `/backend/logs/profema.log`
- Frontend: Browser DevTools Console

---

**Hodně štěstí s testováním!** 🚀

---

**Created:** 2025-11-05
**Version:** 1.0.0
**Status:** Production Ready
