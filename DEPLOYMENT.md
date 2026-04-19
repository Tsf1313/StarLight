# EventFlow Cloudflare Deployment Guide

Complete guide to deploy EventFlow to Cloudflare (eventflow.hamstersame.org + api.eventflow.hamstersame.org).

## Prerequisites
- Cloudflare account (free or paid)
- Domain: hamstersame.org (already added to Cloudflare)
- `wrangler` CLI installed: `npm install -g wrangler`
- GitHub account with repo: Tsf1313/StarLight

---

## Step 1: Create D1 Database (SQLite on Cloudflare)

### 1.1 Using Wrangler CLI
```powershell
cd worker
npm install

# Create D1 database named "eventflow-prod"
wrangler d1 create eventflow-prod
```

This will output something like:
```
✓ Successfully created D1 database 'eventflow-prod'
Binding: DB
Database ID: abc123def456ghi789
```

**Save the Database ID** (you'll need it soon).

### 1.2 Update wrangler.toml
Open `worker/wrangler.toml` and replace:
```toml
[[d1_databases]]
binding = "DB"
database_name = "eventflow-prod"
database_id = "YOUR-DATABASE-ID-HERE"  # ← Insert the ID from step 1.1
```

### 1.3 Initialize Database Schema
```powershell
# Run the schema migration (from worker/ directory)
wrangler d1 execute eventflow-prod --file=d1-schema.sql

# Or paste the SQL manually in Cloudflare Dashboard:
# Cloudflare Dashboard → D1 → eventflow-prod → Console → paste d1-schema.sql contents
```

Verify: You should see 11 tables created (events, attendees, tournaments, etc.).

---

## Step 2: Create R2 Bucket (File Storage)

### 2.1 Using Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. R2 → Create bucket
4. Name: `eventflow-uploads`
5. Region: Default (or pick closest to you)
6. Create bucket

### 2.2 Get R2 Domain
After bucket creation:
1. R2 → eventflow-uploads
2. Settings → Custom domain
3. **Option A:** Set up public R2 URL (requires extra config)
   - OR
4. **Option B:** Use pre-signed URLs (easier, recommended for now)

**Simpler approach for now:** Set R2_DOMAIN in worker environment
- In wrangler.toml, add:
```toml
[env.production]
vars = { R2_DOMAIN = "eventflow-uploads.your-account.r2.dev" }
```

---

## Step 3: Deploy Worker API

### 3.1 Login to Cloudflare
```powershell
cd worker
wrangler login
```
This opens browser to authenticate.

### 3.2 Deploy Worker
```powershell
wrangler deploy
```

**Output will show:**
```
✓ Deployed to https://eventflow-api.your-account.workers.dev
```

Test the Worker:
```powershell
curl https://eventflow-api.your-account.workers.dev/api/events
# Should return []
```

### 3.3 Add Custom Domain to Worker
1. Cloudflare Dashboard → Workers → eventflow-api
2. Settings → Domains & Routes
3. Add route: `api.eventflow.hamstersame.org`
4. Confirm DNS is ready

---

## Step 4: Deploy Frontend to Cloudflare Pages

### 4.1 Prepare Frontend
Update `src/services/api.js` with new Cloudflare backend URL:

```javascript
// Before: http://localhost:3000
// After: https://api.eventflow.hamstersame.org

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.eventflow.hamstersame.org';
```

Create `.env.production`:
```
VITE_API_URL=https://api.eventflow.hamstersame.org
VITE_APP_NAME=EventFlow
```

### 4.2 Build Frontend
```powershell
npm run build
# Creates dist/ folder
```

### 4.3 Connect GitHub to Pages
1. Cloudflare Dashboard → Pages
2. Create application → Connect to Git
3. Select **Tsf1313/StarLight** repository
4. Authorization → Install & Authorize
5. Branch to deploy: `feature/event-sync-updates-2026-04-19` (or `main` once tested)
6. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
7. Click Deploy

### 4.4 Add Custom Domain
Pages will auto-assign a preview URL. To use eventflow.hamstersame.org:
1. Pages → Settings → Domain
2. Add custom domain: `eventflow.hamstersame.org`
3. Verify DNS is ready (should auto-config)

---

## Step 5: Migrate Current Event State

The current event for guests is stored in-memory. To persist across deployments:

### Option A: Use KV Store (Recommended)
```toml
# In wrangler.toml, add:
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

Then in `worker/src/index.js`, the getCurrentEventForGuests() function already uses KV.

### Option B: Use D1 (Store in database)
Create a settings table in D1:
```sql
CREATE TABLE IF NOT EXISTS event_state (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT
);
```

---

## Step 6: Environment Variables & Secrets

### 6.1 Worker Secrets (if needed for auth)
```powershell
cd worker

# Set secret for JWT or auth tokens (optional)
wrangler secret put JWT_SECRET
# (enter your secret value when prompted)
```

### 6.2 Pages Environment
Pages → Settings → Environment variables
- Add `VITE_API_URL=https://api.eventflow.hamstersame.org`

---

## Step 7: Test Deployment

### 7.1 Test Backend API
```powershell
# Test endpoints
curl https://api.eventflow.hamstersame.org/api/events
curl https://api.eventflow.hamstersame.org/api/events/current-for-guests
```

### 7.2 Test Frontend
Open: https://eventflow.hamstersame.org
- Login page should load
- Network tab should call api.eventflow.hamstersame.org
- Features should work end-to-end

### 7.3 Check Logs
- **Worker logs:** `wrangler tail`
- **Pages logs:** Cloudflare Dashboard → Pages → Deployments → View logs

---

## Step 8: Production Optimization (Optional)

### 8.1 Enable GZIP & Caching
Pages settings → Caching → Enable cache on demand

### 8.2 Set Up Monitoring
Cloudflare → Analytics → Workers/Pages to monitor traffic

### 8.3 Add Rate Limiting (Free tier)
Cloudflare → Security → WAF Rules → Create rule for `/api/*`

---

## Common Issues & Fixes

### Issue: "Event not found" on /api/events/current-for-guests
**Fix:** Ensure default event 'e_001' exists in D1:
```sql
INSERT INTO events (id, title, date_range, location) VALUES ('e_001', 'Default Event', '2024-01-01 to 2024-12-31', 'Online');
```

### Issue: File uploads fail (413 error)
**Fix:** Check R2 bucket permissions. D1 may have size limits; split large files.

### Issue: "Binding not found" error
**Fix:** Make sure wrangler.toml has correct d1_databases, r2_buckets, and kv_namespaces sections.

### Issue: Frontend calls localhost:3000
**Fix:** Ensure `.env.production` is set and `npm run build` includes vars:
```bash
VITE_API_URL=https://api.eventflow.hamstersame.org npm run build
```

---

## Rollback Steps

If something breaks, revert to local development:

1. **Point frontend back to localhost:**
   ```
   VITE_API_URL=http://localhost:3000 npm run dev
   ```

2. **Run local backend:**
   ```
   node server.js
   ```

3. **Unpublish Pages deploy:**
   Pages → Deployments → click failed deploy → Rollback

---

## Next Steps

1. ✅ D1 Database created
2. ✅ R2 Bucket created
3. ✅ Worker deployed to api.eventflow.hamstersame.org
4. ✅ Pages deployed to eventflow.hamstersame.org
5. ✅ Test end-to-end
6. Load production data (events, users, etc.) via admin API
7. Set up SSL/TLS (auto via Cloudflare)
8. Monitor & optimize

---

## Support & Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Guide](https://developers.cloudflare.com/workers/wrangler/)
