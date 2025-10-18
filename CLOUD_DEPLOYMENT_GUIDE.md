# Cloud Deployment Guide

This guide walks you through deploying the Digital Transformation Planner to production.

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│  (React App + IndexedDB for offline storage)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel / Netlify CDN                       │
│  (Static hosting + Edge functions)                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ WebSocket + REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Cloud                         │
│  - PostgreSQL Database (Multi-tenant)                   │
│  - Real-time Subscriptions                              │
│  - Authentication (Email/OAuth)                          │
│  - Row-Level Security                                    │
│  - Automatic Backups                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

- [x] GitHub repository created
- [x] Supabase project created
- [x] GitHub secrets configured
- [ ] Vercel or Netlify account
- [ ] Domain name (optional)

---

## Step 1: Deploy Supabase Schema

### Option A: Manual Deployment (Recommended for First Time)

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new

2. **Copy schema:**
   ```bash
   cat supabase/schema.sql
   ```

3. **Paste and execute** (Ctrl+Enter)

4. **Verify tables created:**
   Go to Table Editor and confirm all 10 tables exist

### Option B: Automated via GitHub Actions

1. **Trigger workflow manually:**
   ```bash
   gh workflow run deploy-schema.yml
   ```

2. **Or push to main branch:**
   ```bash
   git commit --allow-empty -m "trigger: deploy schema"
   git push
   ```

3. **Monitor deployment:**
   ```bash
   gh run watch
   ```

---

## Step 2: Deploy Frontend to Vercel

### Setup Vercel Project

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link project:**
   ```bash
   cd app
   vercel link
   ```

4. **Configure environment variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   # Enter: https://grglttyirzxfdpbyuxut.supabase.co

   vercel env add VITE_SUPABASE_ANON_KEY production
   # Paste your anon key

   vercel env add VITE_APP_NAME production
   # Enter: Digital Transformation Planner
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via GitHub Integration

1. **Go to Vercel dashboard:** https://vercel.com/new

2. **Import Git Repository:**
   - Select `dbbuilder/digital-transformation`
   - Framework Preset: **Vite**
   - Root Directory: **app**

3. **Configure Environment Variables:**
   - `VITE_SUPABASE_URL`: `https://grglttyirzxfdpbyuxut.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
   - `VITE_APP_NAME`: `Digital Transformation Planner`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

---

## Step 3: Deploy Frontend to Netlify (Alternative)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize:**
   ```bash
   cd app
   netlify init
   ```

4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Set environment variables:**
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://grglttyirzxfdpbyuxut.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
   netlify env:set VITE_APP_NAME "Digital Transformation Planner"
   ```

6. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

---

## Step 4: Configure Custom Domain (Optional)

### Vercel

1. **Go to project settings** → **Domains**

2. **Add domain:**
   ```
   digital-transformation.dbbuilder.dev
   ```

3. **Configure DNS:**
   - Add CNAME record pointing to Vercel

4. **Enable SSL** (automatic)

### Netlify

1. **Go to site settings** → **Domain management**

2. **Add custom domain**

3. **Configure DNS:**
   - Point domain to Netlify DNS servers

4. **Enable HTTPS** (automatic with Let's Encrypt)

---

## Step 5: Configure Supabase Authentication

### Enable Email Authentication

1. **Go to Supabase Authentication settings:**
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/providers

2. **Enable Email provider:**
   - Toggle "Enable Email provider" ON
   - Configure email templates (optional)

3. **Set Site URL:**
   - Production URL: `https://your-domain.com`
   - Or Vercel URL: `https://digital-transformation-abc123.vercel.app`

4. **Add Redirect URLs:**
   - `https://your-domain.com/**`
   - `http://localhost:5173/**` (for development)

### Enable OAuth Providers (Optional)

1. **Google OAuth:**
   - Enable Google provider
   - Add OAuth client ID and secret

2. **GitHub OAuth:**
   - Enable GitHub provider
   - Create GitHub OAuth App
   - Add client ID and secret

---

## Step 6: Test Production Deployment

### Automated Tests

```bash
# Run E2E tests against production
PLAYWRIGHT_BASE_URL=https://your-domain.com npm run test:e2e
```

### Manual Testing Checklist

- [ ] **Load homepage** - Verify app loads
- [ ] **Create account** - Sign up with email
- [ ] **Create project** - Create new transformation project
- [ ] **Offline mode** - Disconnect internet, verify app works
- [ ] **Sync** - Reconnect, verify changes sync
- [ ] **Multi-user** - Open in two browsers, test collaboration
- [ ] **Export** - Generate PDF/PPTX deliverables
- [ ] **Mobile** - Test on phone/tablet

---

## Step 7: Enable Monitoring & Analytics

### Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/src/main.tsx
import { inject } from '@vercel/analytics'
inject()
```

### Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/react

# Configure in app/src/main.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
})
```

### Supabase Monitoring

1. **Go to Supabase Reports:**
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/reports

2. **Monitor:**
   - API requests per day
   - Database size
   - Active connections
   - Query performance

---

## Step 8: Set Up Automated Deployments

### GitHub Actions (Already Configured)

Every push to `main` will:
1. ✅ Deploy schema changes to Supabase
2. ✅ Run tests
3. ✅ Deploy frontend to Vercel/Netlify (if connected)

### Vercel Git Integration

- Push to `main` → Production deployment
- Push to other branches → Preview deployments
- Pull requests → Automatic preview URLs

---

## Step 9: Configure Backups

### Database Backups (Automated)

GitHub Actions workflow runs daily at 2 AM UTC:
- Dumps schema to `backups/` directory
- Uploads as GitHub artifact (30-day retention)
- Commits to repository

### Manual Backup

```bash
# Backup entire database
gh workflow run backup-schema.yml

# Download backup
gh run download --name schema-backup-latest
```

---

## Step 10: Performance Optimization

### Enable Caching

**Vercel:**
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Netlify:**
```toml
# netlify.toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Enable Compression

Both Vercel and Netlify automatically enable gzip/brotli compression.

---

## 🚀 Production Checklist

Before going live:

### Security
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables configured
- [ ] Secrets not in code
- [ ] Row-Level Security enabled
- [ ] Rate limiting configured

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.9s
- [ ] Cumulative Layout Shift < 0.1

### Functionality
- [ ] All features tested
- [ ] Offline mode works
- [ ] Multi-user sync works
- [ ] Export features work
- [ ] Mobile responsive

### Monitoring
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Uptime monitoring
- [ ] Database backups running

### Documentation
- [ ] README updated with live URL
- [ ] User guide published
- [ ] API documentation generated
- [ ] Changelog maintained

---

## 📊 Cost Estimates

### Free Tier (Good for MVP)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Vercel** | 100GB bandwidth/month | $20/month (Pro) |
| **Supabase** | 500MB database, 1GB file storage | $25/month (Pro) |
| **Netlify** | 100GB bandwidth/month | $19/month (Pro) |
| **Total** | $0/month | ~$45-65/month |

### Expected Usage (100 users)

- **Database**: ~100 MB (well within free tier)
- **Bandwidth**: ~20 GB/month (within free tier)
- **API Requests**: ~10K/day (within free tier)

**Recommendation:** Start with free tier, upgrade when needed.

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Error:** `Cannot find module`

**Fix:**
```bash
# Clear cache and redeploy
vercel --force
```

### Supabase Connection Errors

**Error:** `Failed to connect to database`

**Fix:**
1. Check environment variables are set
2. Verify anon key is correct
3. Check Supabase project is active

### Offline Mode Not Working

**Error:** Service worker not registered

**Fix:**
```bash
# Check vite.config.ts includes PWA plugin
npm install vite-plugin-pwa
```

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Actions**: https://docs.github.com/actions

---

## 🔗 Quick Links

- **Production URL**: TBD (will be your-domain.com)
- **Staging URL**: TBD (preview deployments)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut
- **GitHub Actions**: https://github.com/dbbuilder/digital-transformation/actions

---

**Last Updated:** 2025-10-18
