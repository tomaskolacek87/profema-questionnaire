# 🚀 PROFEMA - Deployment Guide

## Production URL
**https://301.tkservis.cz**

---

## Quick Deploy

```bash
sudo /home/tomas/scripts/deployment/deploy-profema.sh
```

Tento skript automaticky:
1. ✅ Stáhne nejnovější kód z GitHubu
2. ✅ Nainstaluje závislosti (backend + frontend)
3. ✅ Buildne aplikace
4. ✅ Nastaví systemd services
5. ✅ Konfiguruje Nginx
6. ✅ Spustí services
7. ✅ Provede health check

---

## Manual Deployment

### 1. Příprava

```bash
cd /home/tomas/projects/profema-questionnaire
git pull origin master
```

### 2. Backend

```bash
cd backend
npm install --production
npm run build
```

### 3. Frontend

```bash
cd frontend
npm install --production
npm run build
```

### 4. Systemd Services

```bash
# Copy services
sudo cp /home/tomas/configs/systemd/profema-backend.service /etc/systemd/system/
sudo cp /home/tomas/configs/systemd/profema-frontend.service /etc/systemd/system/

# Reload daemon
sudo systemctl daemon-reload

# Enable services
sudo systemctl enable profema-backend profema-frontend

# Start services
sudo systemctl start profema-backend
sudo systemctl start profema-frontend
```

### 5. Nginx

```bash
# Symlink config
sudo ln -s /home/tomas/configs/nginx/sites-available/301.tkservis.cz.conf /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. SSL Certificate (první nasazení)

```bash
sudo certbot --nginx -d 301.tkservis.cz
```

---

## Service Management

### Status
```bash
sudo systemctl status profema-backend
sudo systemctl status profema-frontend
```

### Restart
```bash
sudo systemctl restart profema-backend
sudo systemctl restart profema-frontend
```

### Stop
```bash
sudo systemctl stop profema-backend
sudo systemctl stop profema-frontend
```

### Logs
```bash
# Backend logs
sudo journalctl -u profema-backend -f

# Frontend logs
sudo journalctl -u profema-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/profema-access.log
sudo tail -f /var/log/nginx/profema-error.log
```

---

## Health Checks

### Backend API
```bash
curl http://localhost:5001/api/health
```

### Frontend
```bash
curl -I http://localhost:5002
```

### Production
```bash
curl -I https://301.tkservis.cz
```

---

## Troubleshooting

### Backend neběží

```bash
# Check logs
sudo journalctl -u profema-backend -n 50

# Rebuild
cd /home/tomas/projects/profema-questionnaire/backend
npm run build
sudo systemctl restart profema-backend
```

### Frontend neběží

```bash
# Check logs
sudo journalctl -u profema-frontend -n 50

# Rebuild
cd /home/tomas/projects/profema-questionnaire/frontend
npm run build
sudo systemctl restart profema-frontend
```

### Nginx chyby

```bash
# Test config
sudo nginx -t

# Check logs
sudo tail -100 /var/log/nginx/error.log
```

### Databáze nedostupná

```bash
# Check PostgreSQL/TimescaleDB
sudo systemctl status postgresql

# Test connection
psql -U profema_app_user -d profema -p 5433 -c "SELECT 1;"
```

---

## Rollback

```bash
# 1. Git rollback
cd /home/tomas/projects/profema-questionnaire
git log --oneline -10  # Find commit hash
git reset --hard <commit-hash>

# 2. Rebuild
sudo /home/tomas/scripts/deployment/deploy-profema.sh
```

---

## Monitoring

### CPU & Memory
```bash
# Backend
sudo systemctl status profema-backend | grep Memory

# Frontend
sudo systemctl status profema-frontend | grep Memory

# Total
htop
```

### Ports
```bash
# Check if services are listening
sudo netstat -tlnp | grep -E "5001|5002"
```

---

## Environment Variables

**Backend:** `/home/tomas/projects/profema-questionnaire/backend/.env`
**Frontend:** `/home/tomas/projects/profema-questionnaire/frontend/.env.local`

Po změně .env souborů:
```bash
sudo systemctl restart profema-backend
sudo systemctl restart profema-frontend
```

---

## Backup

### Před deploymentem
```bash
# Backup databáze
sudo -u postgres pg_dump -p 5433 profema > /home/tomas/database/backups/profema_$(date +%Y%m%d_%H%M%S).sql
sudo -u postgres pg_dump -p 5433 astraia > /home/tomas/database/backups/astraia_$(date +%Y%m%d_%H%M%S).sql

# Backup kódu
cd /home/tomas/projects
tar -czf profema-questionnaire_backup_$(date +%Y%m%d_%H%M%S).tar.gz profema-questionnaire/
```

---

## Post-Deployment Checklist

- [ ] Backend běží (`curl http://localhost:5001/api/health`)
- [ ] Frontend běží (`curl -I http://localhost:5002`)
- [ ] Nginx reverse proxy funguje
- [ ] SSL certifikát platný
- [ ] Login funguje (https://301.tkservis.cz/login)
- [ ] Formulář se načítá
- [ ] Dual Write do obou DB funguje
- [ ] Logs neobsahují kritické chyby

---

**Vytvořeno:** 5. listopadu 2025
**Autor:** TK Servis Technology
**Production:** 301.tkservis.cz
