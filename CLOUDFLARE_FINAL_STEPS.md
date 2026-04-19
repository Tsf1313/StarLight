# Cloudflare Deployment - Final Setup Steps

Your Worker API is deployed and working! Now complete these final steps in the Cloudflare Dashboard.

## Completed ✅
- [x] D1 Database created: `eventflow-prod`
- [x] D1 Schema initialized (11 tables)
- [x] KV Namespace created: `eventflow-state`
- [x] R2 Bucket auto-created: `eventflow-uploads`
- [x] Worker API deployed: `https://eventflow-api.edmundtingyanyi0529.workers.dev`

## TODO - Remaining Steps (via Cloudflare Dashboard)

### Step 1: Add Custom Domain to Worker API
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **eventflow-api**
3. Settings → **Domains & Routes**
4. Click **Add route**
5. Fill in:
   - **Pattern:** `api.eventflow.hamstersame.org/api*`
   - **Zone:** `hamstersame.org`
6. Click **Save and deploy**
7. Wait for DNS to update (~2 minutes)

**Test:** `https://api.eventflow.hamstersame.org/api/events` should work

---

### Step 2: Deploy Frontend to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Pages** → **Create a project** → **Connect to Git**
3. Select repository: **Tsf1313/StarLight**
4. Authorize GitHub (may need to grant access)
5. Build settings:
   - **Branch:** `feature/event-sync-updates-2026-04-19`
   - **Framework:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. **Environment variables:**
   - Click **Add variable**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.eventflow.hamstersame.org`
7. Click **Deploy site**
8. Wait for build/deployment (~3-5 minutes)
9. Copy the auto-generated URL (something like `eventflow-xxxxx.pages.dev`)

---

### Step 3: Add Custom Domain to Pages
1. Go to Cloudflare Dashboard → **Pages**
2. Select your deployed project (eventflow-xxxxx.pages.dev)
3. **Settings** → **Domains**
4. Click **Add custom domain**
5. Enter: `eventflow.hamstersame.org`
6. Click **Continue**
7. Cloudflare should auto-add DNS records
8. Click **Activate domain**
9. Wait for DNS propagation (~1-5 minutes)

---

### Step 4: Verify Everything Works
Once DNS propagates:
1. Open `https://eventflow.hamstersame.org` in browser
2. You should see the EventFlow landing page
3. Open DevTools (F12) → Network tab
4. Try to login (use test credentials or register)
5. Verify API calls go to `api.eventflow.hamstersame.org`
6. Test creating an event
7. Switch to guest view and verify data syncs

---

## DNS Records Created
Both custom domains should auto-create CNAME records pointing to Cloudflare:
- `api.eventflow.hamstersame.org` → `eventflow-api.edmundtingyanyi0529.workers.dev`
- `eventflow.hamstersame.org` → `eventflow-xxxxx.pages.dev`

---

## Quick References
- **Worker Dashboard:** https://dash.cloudflare.com/workers
- **Pages Dashboard:** https://dash.cloudflare.com/pages
- **D1 Console:** https://dash.cloudflare.com/d1
- **R2 Bucket:** https://dash.cloudflare.com/r2-buckets

---

## Notes
- Your local data from `eventflow.db` was NOT migrated to D1 (it's a fresh database)
- If you need to copy over data, I can create a migration script
- The API is fully functional and ready for use
- All endpoints from API_REFERENCE.md are supported

---

Once you complete these dashboard steps, your site will be fully live at **eventflow.hamstersame.org**!

Questions? Check DEPLOYMENT.md for detailed troubleshooting.
