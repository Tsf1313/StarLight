# Cloudflare Deployment Guide - feature/cloudflare-deployment Branch

**Status:** ✅ Backend infrastructure ready (D1 + KV + R2 + Worker deployed)
**Branch:** feature/cloudflare-deployment

---

## 📍 Current State

Your Cloudflare backend is already deployed and live:
- **Worker API:** https://eventflow-api.edmundtingyanyi0529.workers.dev
- **D1 Database:** eventflow-prod (c86cee4a-71e7-4f51-9ee5-c10828d4e886)
- **KV Namespace:** eventflow-state (f06b9d4ace1743498f1235fe9feca89e)
- **R2 Bucket:** eventflow-uploads (auto-created)

---

## 🚀 Complete Deployment Steps

### Step 1: Build Frontend
```bash
npm run build
```
This creates the `dist/` folder with production-ready files.

### Step 2: Connect GitHub to Cloudflare Pages (ONE TIME SETUP)

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project** → **Connect to Git**
3. **Authorize GitHub** (grant Cloudflare access to your repo)
4. **Select repository:** `Tsf1313/StarLight`
5. Configure deployment:
   - **Production branch:** `feature/cloudflare-deployment`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

6. **Add environment variables:**
   - Click **Add variable**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://api.eventflow.hamstersame.org`

7. Click **Deploy site**
8. Wait 3-5 minutes for first deployment

### Step 3: Add Custom Domain to Worker API

1. Cloudflare Dashboard → **Workers & Pages** → **eventflow-api**
2. **Settings** → **Domains & Routes**
3. Click **Add route**
   - **Pattern:** `api.eventflow.hamstersame.org/api*`
   - **Zone:** `hamstersame.org`
4. Save and deploy
5. Test: `https://api.eventflow.hamstersame.org/api/events`

### Step 4: Add Custom Domain to Pages

1. Cloudflare Dashboard → **Pages** → Your deployed project
2. **Settings** → **Domains**  
3. Click **Add custom domain**
4. Enter: `eventflow.hamstersame.org`
5. Continue → Cloudflare auto-adds DNS records
6. Activate domain
7. Wait 1-5 minutes for DNS propagation

---

## ✅ Verification Checklist

After deployment, verify these:

- [ ] Frontend loads: `https://eventflow.hamstersame.org`
- [ ] Can see landing page
- [ ] API accessible: `https://api.eventflow.hamstersame.org/api/events`
- [ ] DevTools Network tab shows API calls to `api.eventflow.hamstersame.org`
- [ ] Can login/register
- [ ] Can create event
- [ ] File uploads work

---

## 🔄 Future Deployments

Once Pages is connected to GitHub, deployments happen automatically:

**Automatic deploy on:**
- Push to `feature/cloudflare-deployment` branch
- Cloudflare rebuilds and deploys in 3-5 minutes

**Manual deploy from Pages:**
1. Pages → Your project → **Deployments**
2. Click **Retry** on any deployment to redeploy

---

## 📊 Architecture Summary

```
Your Domain: eventflow.hamstersame.org
    ↓
Cloudflare Pages (Frontend)
    ↓ API calls to
api.eventflow.hamstersame.org
    ↓
Cloudflare Worker (Backend)
    ↓
├─ D1 Database (eventflow-prod)
├─ KV Store (eventflow-state)
└─ R2 Bucket (eventflow-uploads)
```

---

## 🆘 Troubleshooting

**Pages deployment stuck?**
- Check **Deployments** tab for error logs
- Ensure `VITE_API_URL` environment variable is set correctly

**API returning 404?**
- Verify worker custom domain is set to `api.eventflow.hamstersame.org`
- Test direct URL: https://eventflow-api.edmundtingyanyi0529.workers.dev/api/events

**DNS not propagating?**
- Wait 5-10 minutes for DNS
- Clear browser cache (Ctrl+Shift+Del)
- Try incognito/private window

**Files not uploading?**
- R2 bucket `eventflow-uploads` must have public read access
- Check Cloudflare R2 → **Settings** → **CORS configuration**

---

## 📝 Important Notes

1. **Branch:** Keep using `feature/cloudflare-deployment` for all deployments
2. **Data:** Database is fresh (empty) - not migrated from local SQLite
3. **Migrations:** Can be applied anytime via Dashboard D1 console
4. **Costs:** See [Cloudflare Pricing](https://www.cloudflare.com/pricing/) - most features free tier

---

## Next Steps

1. ✅ You're on the right branch (`feature/cloudflare-deployment`)
2. ⏳ Run `npm run build` to prepare frontend
3. ⏳ Connect GitHub to Pages (Steps 2-4 above)
4. ⏳ Test at `https://eventflow.hamstersame.org`

**Questions?** Check [Cloudflare Docs](https://developers.cloudflare.com/)
