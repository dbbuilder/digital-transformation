# GitHub CI/CD Integration Setup

Complete guide to wire up GitHub → Vercel and GitHub → Supabase for fully automated CI/CD.

**Last Updated**: 2025-10-18

---

## 🎯 Overview

This guide sets up:
1. **GitHub → Vercel**: Automatic deployments on push to main
2. **GitHub → Supabase**: Automatic schema migrations on push
3. **Preview Deployments**: Automatic preview URLs for pull requests
4. **Domain Configuration**: digiform.tech with SSL

---

## 📋 Prerequisites

- [x] GitHub repository: `dbbuilder/digital-transformation`
- [x] Vercel account (logged in as `dbbuilder`)
- [x] Supabase project: `grglttyirzxfdpbyuxut`
- [x] Domain registered: `digiform.tech`
- [x] GitHub secrets configured:
  - `SUPABASE_PROJECT_ID`
  - `SUPABASE_DB_PASSWORD`
  - `SUPABASE_ACCESS_TOKEN`

---

## Part 1: GitHub → Vercel Integration

### Method A: Via Vercel Dashboard (Recommended)

1. **Visit Vercel Dashboard**:
   https://vercel.com/dashboard

2. **Import Git Repository**:
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose "dbbuilder/digital-transformation"
   - If not visible, click "Adjust GitHub App Permissions"

3. **Configure Project Settings**:
   ```
   Framework Preset: Vite
   Root Directory: app
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Development Command: npm run dev
   ```

4. **Environment Variables**:
   Add these for Production, Preview, and Development:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `VITE_SUPABASE_URL` | `https://grglttyirzxfdpbyuxut.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | (from `.env`) | Production, Preview, Development |
   | `VITE_APP_NAME` | `Digital Transformation Planner` | Production, Preview, Development |

5. **Deploy**:
   - Click "Deploy"
   - Wait for initial build
   - Note the production URL

### Method B: Via Vercel CLI

```bash
cd /mnt/d/Dev2/digital-transformation/app

# Link to GitHub (this connects GitHub repo to Vercel)
vercel link --repo

# Set environment variables
echo "VITE_SUPABASE_URL=https://grglttyirzxfdpbyuxut.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Digital Transformation Planner" | vercel env add production

# Deploy
vercel --prod
```

### Verify GitHub Integration

After setup, every push to `main` will:
1. Trigger automatic Vercel deployment
2. Build and deploy to production
3. Update production URL

Every pull request will:
1. Create preview deployment
2. Add preview URL as comment on PR
3. Auto-delete when PR is closed

---

## Part 2: GitHub → Supabase Integration

### Already Configured! ✓

Your `.github/workflows/deploy-schema.yml` is already set up:

```yaml
name: Deploy Supabase Schema

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/migrations/**'
      - 'supabase/schema.sql'
```

**How it works**:
1. Push changes to `supabase/schema.sql` or `supabase/migrations/`
2. GitHub Actions automatically runs
3. Schema is deployed to Supabase
4. You get notification of success/failure

**Test it**:
```bash
# Make a schema change
echo "-- Test comment" >> supabase/schema.sql

# Commit and push
git add supabase/schema.sql
git commit -m "test: verify GitHub Actions deployment"
git push origin main

# Watch it run
gh run watch
```

---

## Part 3: Configure digiform.tech Domain

### Step 1: Add DNS Records (via name.com API)

Run the provided script:
```bash
cd /mnt/d/Dev2/digital-transformation
bash setup-digiform-domain.sh
```

Or manually add these DNS records in name.com dashboard:

| Type | Host | Answer/Value | TTL |
|------|------|--------------|-----|
| A | @ | 76.76.21.21 | 300 |
| CNAME | www | cname.vercel-dns.com. | 300 |

### Step 2: Add Domain to Vercel

**Via Dashboard**:
1. Go to project settings → Domains
2. Add `digiform.tech`
3. Add `www.digiform.tech`
4. Vercel will auto-detect DNS and issue SSL

**Via CLI**:
```bash
vercel domains add digiform.tech
vercel domains add www.digiform.tech
```

### Step 3: Wait for DNS Propagation

Check DNS status:
```bash
dig digiform.tech A +short
# Should show: 76.76.21.21

dig www.digiform.tech CNAME +short
# Should show: cname.vercel-dns.com.
```

DNS propagation takes 5-60 minutes.

### Step 4: Verify SSL Certificate

1. Go to Vercel project → Settings → Domains
2. Wait for SSL status to show "Valid"
3. Visit https://digiform.tech
4. Verify SSL padlock in browser

---

## Part 4: Update Supabase Auth URLs

Once domain is live, update Supabase:

1. **Visit Supabase Auth Settings**:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/url-configuration

2. **Set Site URL**:
   ```
   https://digiform.tech
   ```

3. **Add Redirect URLs**:
   ```
   https://digiform.tech/**
   https://www.digiform.tech/**
   https://*.vercel.app/**
   http://localhost:5173/**
   ```

4. **Save Changes**

---

## Part 5: Environment-Specific Deployments

### Production Environment
- **URL**: https://digiform.tech
- **Branch**: `main`
- **Trigger**: Push to main
- **Environment**: production

### Preview Environment
- **URL**: https://app-*-dbbuilder.vercel.app
- **Branch**: Any PR branch
- **Trigger**: Open PR
- **Environment**: preview

### Development Environment
- **URL**: http://localhost:5173
- **Branch**: Local
- **Trigger**: `npm run dev`
- **Environment**: development

---

## Part 6: Automated Workflow Summary

### On Push to `main`:

```
┌──────────────┐
│ git push     │
└──────┬───────┘
       │
       ├──→ GitHub Actions
       │    └─→ Deploy Schema to Supabase ✓
       │
       └──→ Vercel
            ├─→ Build app
            ├─→ Run tests
            ├─→ Deploy to production
            └─→ Update digiform.tech ✓
```

### On Pull Request:

```
┌──────────────┐
│ Open PR      │
└──────┬───────┘
       │
       ├──→ GitHub Actions
       │    └─→ Test Schema Changes ✓
       │
       └──→ Vercel
            ├─→ Build app
            ├─→ Deploy to preview URL
            └─→ Comment on PR with URL ✓
```

---

## Part 7: Monitoring & Notifications

### Vercel Notifications

**Enable Slack/Email notifications**:
1. Go to Settings → Notifications
2. Add Slack webhook or email
3. Choose events:
   - Deployment Started
   - Deployment Ready
   - Deployment Failed

### GitHub Notifications

**Already enabled** via GitHub Actions:
- Email notifications on workflow failure
- PR status checks
- Deployment status badges

### Supabase Monitoring

**Monitor via dashboard**:
- Database size: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/reports
- API requests
- Error logs
- Schema migrations

---

## Part 8: Troubleshooting

### Build Fails on Vercel

**Check build logs**:
```bash
vercel inspect [deployment-url]
```

**Common issues**:
- TypeScript errors → Fix in code
- Missing env vars → Add in Vercel settings
- Build timeout → Optimize build process

### Schema Deployment Fails

**Check GitHub Actions logs**:
```bash
gh run list --limit 5
gh run view [run-id]
```

**Common issues**:
- Invalid SQL syntax → Test locally first
- Permission errors → Check GitHub secrets
- Connection timeout → Verify Supabase is accessible

### Domain Not Resolving

**Check DNS propagation**:
```bash
dig digiform.tech A +short
nslookup digiform.tech
```

**Fix**:
- Wait 5-60 minutes for DNS propagation
- Verify DNS records in name.com
- Check Vercel domain status

---

## Part 9: Security Checklist

Before going live:

- [ ] All secrets in environment variables (not code)
- [ ] `.env` files gitignored
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Supabase RLS policies enabled
- [ ] Supabase Auth configured with correct URLs
- [ ] CSP headers configured (in `vercel.json`)
- [ ] Rate limiting enabled (Supabase dashboard)
- [ ] Monitoring enabled
- [ ] Backup strategy configured

---

## Part 10: Useful Commands

### Vercel CLI
```bash
vercel                    # Deploy to preview
vercel --prod             # Deploy to production
vercel logs [url]         # View deployment logs
vercel inspect [url]      # Inspect deployment
vercel domains ls         # List domains
vercel env ls             # List environment variables
vercel rollback [url]     # Rollback deployment
```

### GitHub CLI
```bash
gh repo view                        # View repo info
gh run list                         # List workflow runs
gh run watch                        # Watch current run
gh pr create                        # Create pull request
gh pr checks                        # Check PR status
```

### Supabase CLI
```bash
supabase status                     # Check status
supabase db push                    # Push schema changes
supabase db diff                    # Show schema diff
supabase functions deploy           # Deploy edge functions
```

---

## 📊 Cost Estimates

| Service | Free Tier | Current Usage | Monthly Cost |
|---------|-----------|---------------|--------------|
| **Vercel** | 100GB bandwidth | <10GB | $0 |
| **Supabase** | 500MB database | <100MB | $0 |
| **GitHub Actions** | 2,000 minutes | <100 min | $0 |
| **name.com** | N/A | 1 domain | $0 (annual: $84.99) |
| **Total** | | | **$0/month** |

---

## 🎯 Success Criteria

Your CI/CD is working when:

- [ ] Push to `main` automatically deploys to https://digiform.tech
- [ ] PRs get automatic preview deployments
- [ ] Schema changes auto-deploy to Supabase
- [ ] SSL certificate is valid
- [ ] All environment variables are set
- [ ] Monitoring is active
- [ ] Rollback works if needed

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Git Integration**: https://vercel.com/docs/concepts/git
- **GitHub Actions**: https://docs.github.com/actions
- **Supabase CLI**: https://supabase.com/docs/reference/cli
- **name.com API**: https://www.name.com/api-docs

---

**Last Updated**: 2025-10-18
**Status**: Ready to configure
**Domain**: digiform.tech
**Environment**: Production
