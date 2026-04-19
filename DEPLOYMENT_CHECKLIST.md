# EventFlow Cloudflare Deployment Checklist

Use this checklist to keep track of your deployment progress.

## Pre-Deployment Checklist
- [ ] Cloudflare account created (free or paid)
- [ ] hamstersame.org domain added to Cloudflare
- [ ] Node.js installed locally
- [ ] npm installed
- [ ] GitHub account with Tsf1313/StarLight repo access
- [ ] Working feature branch pushed to GitHub: `feature/event-sync-updates-2026-04-19`

## Step 1: D1 Database Setup (~5 min)
- [ ] Open terminal in project root
- [ ] cd to `worker` directory
- [ ] Run `npm install`
- [ ] Run `wrangler login` and authenticate
- [ ] Run `wrangler d1 create eventflow-prod`
- [ ] **Copy the Database ID output**
- [ ] Open `worker/wrangler.toml`
- [ ] Replace `your-database-id-here` with the actual ID
- [ ] Run `wrangler d1 execute eventflow-prod --file=d1-schema.sql`
- [ ] Verify: You should see "✓ All 11 tables created"

## Step 2: KV Namespace Setup (~2 min)
- [ ] From `worker` directory, run: `wrangler kv:namespace create eventflow-state`
- [ ] **Copy the Namespace ID**
- [ ] Open `worker/wrangler.toml`
- [ ] Replace `your-kv-namespace-id-here` with the actual ID

## Step 3: R2 Bucket Setup (~3 min)
- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Select your account
- [ ] Navigate to R2
- [ ] Click "Create bucket"
- [ ] Name: `eventflow-uploads`
- [ ] Region: Default (or your preference)
- [ ] Click "Create bucket"
- [ ] Go to R2 → eventflow-uploads → Settings
- [ ] Note the bucket domain (look for "R2 API" section)
- [ ] Update `worker/wrangler.toml` R2_DOMAIN variable with this domain

## Step 4: Deploy Worker Backend (~2 min)
- [ ] In `worker` directory, run: `wrangler deploy`
- [ ] Wait for deployment to complete
- [ ] Copy the Worker URL from output (e.g., https://eventflow-api.xxxxx.workers.dev)
- [ ] Test: Open browser and go to Worker URL + `/api/events`
  - Should return `[]` (empty JSON array)
- [ ] Run: `wrangler publish --env production` (to deploy with custom domain config)

## Step 5: Add Worker Custom Domain (~3 min)
- [ ] Go to Cloudflare Dashboard
- [ ] Workers → eventflow-api (or click your worker)
- [ ] Settings → Routes
- [ ] Click "Add route"
- [ ] Pattern: `api.eventflow.hamstersame.org/api/*`
- [ ] Zone: hamstersame.org
- [ ] Save
- [ ] Test: `curl https://api.eventflow.hamstersame.org/api/events`

## Step 6: Deploy Frontend to Pages (~5 min)
- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Pages → Create a project → Connect to Git
- [ ] Select repository: **Tsf1313/StarLight**
- [ ] Authorize GitHub if prompted
- [ ] Choose branch: **feature/event-sync-updates-2026-04-19** (or main)
- [ ] Build settings:
  - [ ] Framework: **Vite**
  - [ ] Build command: `npm run build`
  - [ ] Build output directory: `dist`
- [ ] Environment variables:
  - [ ] Add `VITE_API_URL` = `https://api.eventflow.hamstersame.org`
- [ ] Click **Deploy site**
- [ ] Wait for deployment (usually 2-3 minutes)
- [ ] Note the auto-generated URL (something like `eventflow-xxxxx.pages.dev`)

## Step 7: Add Pages Custom Domain (~2 min)
- [ ] Pages → Settings
- [ ] In "Domain" section, click "Add custom domain"
- [ ] Enter: `eventflow.hamstersame.org`
- [ ] Click "Continue"
- [ ] Cloudflare should auto-configure DNS
- [ ] Wait ~1-2 minutes for DNS to propagate

## Step 8: Test End-to-End (~5 min)
- [ ] Open browser: `https://eventflow.hamstersame.org`
- [ ] Verify landing page loads
- [ ] Try login with test credentials (or register new user)
- [ ] Open browser DevTools (F12) → Network tab
- [ ] Create a test event
- [ ] Verify network requests go to `api.eventflow.hamstersame.org`
- [ ] Check that event is saved in database
- [ ] Test guest side: Switch to guest view, verify data from backend
- [ ] Try uploading an image/file (verify goes to R2)

## Step 9: Optional - Set Up Monitoring
- [ ] Cloudflare Dashboard → Analytics
- [ ] Enable analytics for Pages and Workers
- [ ] Set up error tracking/alerts (if desired)

## Post-Deployment Checklist
- [ ] Both domains working (eventflow.hamstersame.org and api.eventflow.hamstersame.org)
- [ ] SSL/TLS certificates active (should be automatic)
- [ ] Database migrations successful (11 tables created)
- [ ] File uploads working to R2
- [ ] Guest event state persisting in KV
- [ ] All API endpoints responding correctly

## Troubleshooting
If something doesn't work:
1. Check **DEPLOYMENT.md** for detailed troubleshooting section
2. Run local dev server as backup: `node server.js`
3. Check Cloudflare dashboard for error logs
4. Verify all IDs (Database ID, KV ID, etc.) are correct in wrangler.toml

## Rollback (If Needed)
- [ ] Pages: Can instantly rollback to previous deployment
- [ ] Worker: Can deploy previous version with `wrangler deploy --version X`
- [ ] Frontend: Still works with local backend at http://localhost:3000

## Success Criteria
- ✅ eventflow.hamstersame.org loads and is fully functional
- ✅ api.eventflow.hamstersame.org responds to API calls
- ✅ Database persists data
- ✅ Users can login, create events, upload files
- ✅ Guest interface shows data from host

---

**Estimated Total Time: 25-30 minutes**

Having trouble? See **DEPLOYMENT.md** for detailed instructions and troubleshooting.
