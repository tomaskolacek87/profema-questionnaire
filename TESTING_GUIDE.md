# PROFEMA Questionnaire - Testing Guide
## Manuální testovací scénáře

---

## QUICK START

```bash
# Terminal 1 - Backend
cd /home/tomas/projects/profema-questionnaire/backend
npm run start:dev

# Terminal 2 - Frontend
cd /home/tomas/projects/profema-questionnaire/frontend
npm run dev

# Otevřít: http://localhost:7302
```

---

## TEST 1: Dashboard Statistics

**Cíl:** Ověřit zobrazení statistik na dashboardu

**Kroky:**
1. Otevřít http://localhost:7302
2. Login (použij test účet)
3. Dashboard by se měl načíst automaticky

**Očekávané výsledky:**
- ✅ Viditelné 4 statistické karty:
  - Celkem pacientek (s ikonou)
  - Celkem dotazníků (s ikonou)
  - Dokončené (s completion rate)
  - Nové za 30 dní (s ikonou)
- ✅ 2 recent activity karty:
  - Poslední pacientky (s datem a doktorem)
  - Poslední dotazníky (s datem a statusem)
- ✅ Tabulka pacientek dole
- ✅ Loading skeletons při načítání

**Chyby k ověření:**
- Pokud API neběží → měl by se zobrazit error
- Pokud žádná data → měly by se zobrazit 0

---

## TEST 2: Patient List & Filtering

**Cíl:** Ověřit filtrování a vyhledávání pacientek

**Kroky:**
1. Kliknout na "Seznam pacientek" v menu (nebo /patients)
2. Zkusit search: napsat "Jana" do search boxu
3. Změnit status filter na "active"
4. Změnit stránku (pagination)
5. Zkusit sort (kliknout na column header)

**Očekávané výsledky:**
- ✅ Search funguje real-time (bez tlačítka)
- ✅ Filter status mění seznam
- ✅ Pagination funguje (zobrazuje total count)
- ✅ Sort funguje (šipky v headeru)
- ✅ Actions buttons jsou viditelné a klikatelné

**Test actions:**
- Kliknout "Detail" → přesměruje na detail pacientky
- Kliknout "Dotazník" → přesměruje na nový dotazník
- Kliknout "Smazat" → zobrazí confirmation dialog

---

## TEST 3: Create Questionnaire & PDF

**Cíl:** Vytvořit dotazník a vygenerovat PDF

**Kroky:**
1. Kliknout "Nová pacientka" na dashboardu
2. Vyplnit všechny sekce formuláře:
   - Základní údaje
   - Současné těhotenství
   - Předchozí těhotenství (přidat 1-2)
   - Zdravotní anamnéza
   - Doplňující informace
3. Kliknout "Dokončit a odeslat"
4. Otevřít detail dotazníku
5. Kliknout "Stáhnout PDF"

**Očekávané výsledky:**
- ✅ Formulář se validuje správně
- ✅ Po odeslání přesměruje na dashboard
- ✅ Toast "Dotazník vytvořen"
- ✅ Detail view zobrazuje všechna data
- ✅ PDF se stáhne (otevřít a ověřit obsah)

**Ověření PDF:**
- Obsahuje Profema header
- Všechna data jsou správně formátovaná
- Czech date format (dd.MM.yyyy)
- Footer s timestampem

---

## TEST 4: Form Auto-save

**Cíl:** Ověřit auto-save funkcionalitu

**Kroky:**
1. Začít vyplňovat nový dotazník
2. Vyplnit základní údaje
3. Počkat 30 sekund (neodcházet ze stránky)
4. Měl by se zobrazit toast "Koncept uložen"
5. Zavřít tab (nebo browser)
6. Otevřít znovu /questionnaire
7. Měla by se objevit nabídka "Načíst uložený koncept?"

**Očekávané výsledky:**
- ✅ Po 30s se zobrazí "Koncept uložen"
- ✅ Po opětovném otevření se nabídne restore
- ✅ Po kliknutí "Ano" se data načtou
- ✅ Po dokončení dotazníku se draft smaže

**Debug:**
- Otevřít DevTools → Application → Local Storage
- Měl by tam být klíč `questionnaire-draft-XXX`

---

## TEST 5: Search API

**Cíl:** Otestovat backend search endpoint

**Kroky:**
1. Otevřít Postman nebo curl
2. Test search:
```bash
curl -X GET 'http://localhost:7301/api/patients/search?q=Jana' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Očekávané výsledky:**
- ✅ Vrací pole pacientek
- ✅ Jsou seřazeny podle created_at DESC
- ✅ Limit 50 záznamů

---

## TEST 6: Statistics API

**Cíl:** Ověřit všechny statistics endpointy

**Kroky:**

### Overview:
```bash
curl -X GET 'http://localhost:7301/api/statistics/overview' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Očekáváno:**
```json
{
  "totalPatients": 245,
  "totalQuestionnaires": 189,
  "completedQuestionnaires": 167,
  "draftQuestionnaires": 22,
  "activeUsers": 5,
  "newPatientsLast30Days": 34,
  "completionRate": 88.4
}
```

### Recent Activity:
```bash
curl -X GET 'http://localhost:7301/api/statistics/recent-activity?limit=5' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Očekáváno:**
```json
{
  "recentPatients": [...],
  "recentQuestionnaires": [...]
}
```

### Sync Status:
```bash
curl -X GET 'http://localhost:7301/api/statistics/sync-status' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## TEST 7: PDF Generation API

**Cíl:** Otestovat PDF generování přímo přes API

**Kroky:**
```bash
curl -X GET 'http://localhost:7301/api/questionnaires/UUID-HERE/pdf' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output test.pdf
```

**Očekávané výsledky:**
- ✅ Soubor test.pdf se vytvoří
- ✅ Velikost > 0
- ✅ PDF se otevře v prohlížeči
- ✅ Obsahuje všechna data

**Debug problémy:**
- Pokud "Questionnaire not found" → zkontroluj UUID
- Pokud timeout → puppeteer může být pomalý (první spuštění)
- Pokud "Template not found" → zkontroluj cestu k HTML

---

## TEST 8: Google Drive Upload (pokud nakonfigurováno)

**Cíl:** Otestovat upload na Google Drive

**Předpoklady:**
- `GOOGLE_CREDENTIALS` v .env
- Service Account s Drive API přístupem

**Kroky:**
1. Vygenerovat PDF (test 3)
2. V backend console by měl být log:
   ```
   [GoogleService] PDF uploaded to Google Drive: FILE_ID
   ```
3. Zkontrolovat Google Drive:
   - Složka /Profema/Pacientky/[Jméno Příjmení]
   - Soubor questionnaire_*.pdf

**Očekávané výsledky:**
- ✅ Složky se vytvoří automaticky
- ✅ PDF se nahraje
- ✅ File ID se uloží do DB (pole google_drive_file_id)

---

## TEST 9: Error Handling

**Cíl:** Ověřit error boundary a error handling

**Kroky:**
1. Vypnout backend
2. Zkusit načíst dashboard
3. Měl by se zobrazit error state

**Varianta 2:**
1. Otevřit DevTools Console
2. Vyvolat chybu (např. null.toString())
3. Měl by se zobrazit Error Boundary screen

**Očekávané výsledky:**
- ✅ Error boundary zachytí chybu
- ✅ Zobrazí se user-friendly zpráva
- ✅ Button "Obnovit stránku"
- ✅ V dev mode: stack trace

---

## TEST 10: Logging Interceptor

**Cíl:** Ověřit logování requestů

**Kroky:**
1. Spustit backend
2. Provést několik requestů (např. načíst dashboard)
3. Zkontrolovat soubor:
```bash
cat /home/tomas/projects/profema-questionnaire/backend/logs/profema.log
```

**Očekávané výsledky:**
- ✅ Každý request je zalogován
- ✅ JSON Lines format
- ✅ Obsahuje: timestamp, method, url, statusCode, responseTime, ip, userId

**Příklad logu:**
```json
{"timestamp":"2025-11-05T20:00:00.000Z","method":"GET","url":"/api/patients","statusCode":200,"responseTime":45,"ip":"::1","userAgent":"Mozilla/5.0...","userId":"uuid-123"}
```

---

## TEST 11: Responsive Design

**Cíl:** Otestovat responzivitu na různých zařízeních

**Kroky:**
1. Otevřít DevTools (F12)
2. Přepnout do Device Mode (Ctrl+Shift+M)
3. Zkusit různé rozlišení:
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)

**Očekávané výsledky:**
- ✅ Dashboard cards se správně zalamují (Ant Design Grid)
- ✅ Tabulka má horizontal scroll na mobile
- ✅ Forms jsou použitelné na všech zařízeních
- ✅ Menu je responsive (drawer na mobile)

---

## TEST 12: Performance

**Cíl:** Ověřit performance aplikace

**Metrics:**
- Dashboard load time: < 2s
- PDF generation: < 5s (první spuštění), < 2s (další)
- API response time: < 500ms
- Page transition: < 1s

**Tools:**
- Chrome DevTools → Lighthouse
- Network tab (Response time)
- Backend logs (responseTime field)

---

## CHECKLIST - PŘED NASAZENÍM

### Backend:
- [ ] Kompilace bez chyb: `npm run build`
- [ ] Test všech endpointů v Postman
- [ ] Zkontrolovat logs: žádné ERRORy
- [ ] PDF generování funguje
- [ ] Google Drive (pokud používáte)
- [ ] Database connection OK (obě DB)

### Frontend:
- [ ] Type-check: `npm run type-check`
- [ ] Build: `npm run build`
- [ ] Všechny stránky načítají data
- [ ] No console errors
- [ ] Responsive design OK
- [ ] Auto-save funguje
- [ ] Error boundaries zachytávají chyby

### Integration:
- [ ] Login/logout funguje
- [ ] Vytvoření dotazníku end-to-end
- [ ] PDF download end-to-end
- [ ] Všechny filtry a search
- [ ] Statistics se aktualizují

---

## ZNÁMÉ PROBLÉMY

### 1. Puppeteer první spuštění
**Problem:** První PDF generování může trvat 10-15s
**Řešení:** Puppeteer stahuje Chromium při prvním spuštění

### 2. LocalStorage limit
**Problem:** Auto-save může selhat pokud formulář je moc velký
**Řešení:** Compression nebo IndexedDB (future enhancement)

### 3. Google Drive credentials
**Problem:** Pokud nejsou credentials, drive upload selže tiše
**Řešení:** Zkontrolovat logs, přidat credentials do .env

---

## DEBUG TIPS

### Backend nedostupný:
```bash
# Zkontrolovat port
netstat -tuln | grep 7301

# Zkontrolovat logs
tail -f /home/tomas/projects/profema-questionnaire/backend/logs/profema.log

# Restart
pm2 restart profema-backend
```

### Frontend build chyby:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database problémy:
```bash
# Zkontrolovat connection
psql -h localhost -p 5433 -U profema -d profema

# Test query
SELECT COUNT(*) FROM patients;
```

---

**Happy Testing!** 🚀
