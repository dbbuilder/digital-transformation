# Next Steps for Cloud Deployment

## ✅ What's Been Completed

### 1. Repository Infrastructure
- ✅ GitHub repository created and configured
- ✅ Public repository with comprehensive documentation
- ✅ MIT license for open-source distribution
- ✅ GitHub Actions workflows for CI/CD
- ✅ Code owners and contribution guidelines

### 2. Database Schema
- ✅ Multi-tenant PostgreSQL schema designed
- ✅ Row-Level Security (RLS) policies defined
- ✅ Version tracking for sync conflicts
- ✅ 10 tables with relationships and indexes
- ✅ Schema file ready: `supabase/schema.sql`

### 3. Deployment Configuration
- ✅ Vercel configuration (`app/vercel.json`)
- ✅ Netlify configuration (`app/netlify.toml`)
- ✅ PowerShell deployment script (`deploy-schema.ps1`)
- ✅ Environment variables template (`app/.env.example`)
- ✅ Comprehensive deployment guides

### 4. GitHub Secrets
- ✅ `SUPABASE_PROJECT_ID` configured
- ✅ `SUPABASE_DB_PASSWORD` configured
- ⏳ `SUPABASE_ACCESS_TOKEN` - needs to be created

---

## 🎯 Immediate Next Steps

Follow these steps in order to complete the deployment:

### Step 1: Deploy Database Schema (5-10 minutes)

**Option A: Using PowerShell Script (Recommended)**

1. Open **Windows PowerShell** (not WSL):
   - Press `Win+X`
   - Select "Windows PowerShell"

2. Navigate to project:
   ```powershell
   cd D:\Dev2\digital-transformation
   ```

3. Run deployment script:
   ```powershell
   .\deploy-schema.ps1
   ```

4. Verify success:
   - Script will show ✓ checkmarks for each step
   - Visit Table Editor: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor
   - Confirm 10 tables exist

**Option B: Using SQL Editor (Manual)**

1. Open SQL Editor:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new

2. Copy schema contents:
   ```bash
   # From any terminal
   cat supabase/schema.sql
   ```

3. Paste into SQL Editor and press `Ctrl+Enter`

4. Verify in Table Editor (same URL as above)

**Verification Checklist:**
- [ ] 10 tables created (profiles, projects, project_members, assessments, responses, architecture_states, tier_states, roadmaps, deliverables, stakeholder_assignments)
- [ ] RLS enabled on all tables (check "RLS enabled" badge)
- [ ] Policies visible in each table's "Policies" tab

---

### Step 2: Create Supabase Access Token (2 minutes)

This token is needed for GitHub Actions to deploy schema changes automatically.

1. Visit Supabase Access Tokens page:
   https://supabase.com/dashboard/account/tokens

2. Click "Generate new token"
   - Name: `GitHub Actions CI/CD`
   - Scope: Select all permissions

3. Copy the generated token

4. Set as GitHub secret:
   ```bash
   gh secret set SUPABASE_ACCESS_TOKEN --body 'YOUR_TOKEN_HERE' --repo dbbuilder/digital-transformation
   ```

5. Verify secret was set:
   ```bash
   gh secret list --repo dbbuilder/digital-transformation
   ```

   You should see:
   - SUPABASE_ACCESS_TOKEN
   - SUPABASE_DB_PASSWORD
   - SUPABASE_PROJECT_ID

---

### Step 3: Enable Authentication (3 minutes)

1. Open Supabase Auth Providers:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/providers

2. Enable "Email" provider:
   - Toggle "Enable Email provider" to ON
   - Keep "Confirm email" enabled
   - Save changes

3. **Skip** Site URL and Redirect URLs for now (we'll set these after frontend deployment)

---

### Step 4: Test GitHub Actions (2 minutes)

Now that all secrets are configured, test the deployment workflow:

1. Trigger schema deployment workflow:
   ```bash
   gh workflow run deploy-schema.yml
   ```

2. Watch the workflow execution:
   ```bash
   gh run watch
   ```

3. Verify success:
   - Workflow should complete with ✓
   - Check GitHub Actions page: https://github.com/dbbuilder/digital-transformation/actions

---

### Step 5: Deploy Frontend to Vercel (10-15 minutes)

**Option A: Vercel CLI (Quick)**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```
   - Follow the prompts to authenticate

3. Navigate to app directory:
   ```bash
   cd app
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

5. Follow the prompts:
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N
   - Project name: `digital-transformation`
   - Directory: `./` (current directory)
   - Override settings: N

6. The CLI will:
   - Build your app
   - Deploy to Vercel
   - Output the production URL (e.g., `https://digital-transformation-abc123.vercel.app`)

7. **Important**: Note the production URL for next steps

**Option B: Vercel Dashboard (GitHub Integration)**

1. Visit Vercel Dashboard:
   https://vercel.com/new

2. Import Git Repository:
   - Click "Import Git Repository"
   - Select `dbbuilder/digital-transformation`
   - Authorize GitHub access if needed

3. Configure Project:
   - Framework Preset: **Vite**
   - Root Directory: **app**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add the following:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://grglttyirzxfdpbyuxut.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | (Copy from `app/.env`) |
   | `VITE_APP_NAME` | `Digital Transformation Planner` |

5. Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Note the production URL

---

### Step 6: Update Supabase Auth URLs (2 minutes)

Now that the frontend is deployed, configure authentication redirects:

1. Go back to Supabase Auth settings:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/url-configuration

2. Set **Site URL**:
   ```
   https://your-vercel-url.vercel.app
   ```

3. Add **Redirect URLs**:
   ```
   https://your-vercel-url.vercel.app/**
   http://localhost:5173/**
   ```

4. Save changes

---

### Step 7: Test Production Deployment (10 minutes)

1. **Visit production URL**:
   - Open `https://your-vercel-url.vercel.app`
   - Verify app loads correctly

2. **Create test account**:
   - Click "Sign Up"
   - Enter email and password
   - Check email for confirmation link
   - Confirm account

3. **Create test project**:
   - Click "New Project"
   - Fill in project details
   - Select transformation path (AI Included or AI Free)
   - Save project

4. **Test offline mode**:
   - Open browser DevTools (F12)
   - Go to Application → Service Workers
   - Check "Offline" checkbox
   - Navigate around the app
   - Verify app still works
   - Make some changes (they should save locally)

5. **Test sync**:
   - Uncheck "Offline"
   - Reload page
   - Verify changes synced to database

6. **Test multi-user** (optional):
   - Open app in incognito/private window
   - Create second account
   - Open browser console
   - Run:
     ```javascript
     // Get current project ID from URL or state
     // Manually add second user to project_members in Supabase SQL Editor
     ```
   - Make changes in one window
   - Verify real-time updates in other window

---

## 📊 Deployment Verification Checklist

After completing all steps, verify:

### Database
- [ ] 10 tables exist in Supabase
- [ ] RLS enabled on all tables
- [ ] Policies created and active
- [ ] Test data can be inserted

### Authentication
- [ ] Email provider enabled
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] Test user can sign up
- [ ] Email confirmation works

### Frontend
- [ ] Production URL accessible
- [ ] App loads without errors
- [ ] Environment variables correct
- [ ] Static assets loading
- [ ] No console errors

### GitHub Actions
- [ ] All secrets configured
- [ ] deploy-schema.yml workflow passing
- [ ] test-schema.yml ready for PRs
- [ ] backup-schema.yml scheduled

### Functionality
- [ ] User signup/login works
- [ ] Project creation works
- [ ] Assessment questions load
- [ ] Offline mode functional
- [ ] Data syncs to Supabase
- [ ] Export features work

---

## 🔄 Automated Workflows

Once deployed, these workflows run automatically:

### Schema Deployment
- **Trigger**: Push to `main` branch with schema changes
- **Action**: Deploys schema to Supabase
- **File**: `.github/workflows/deploy-schema.yml`

### Schema Testing
- **Trigger**: Pull request with schema changes
- **Action**: Tests schema in local PostgreSQL
- **File**: `.github/workflows/test-schema.yml`

### Database Backups
- **Trigger**: Daily at 2 AM UTC
- **Action**: Dumps schema, saves as artifact
- **File**: `.github/workflows/backup-schema.yml`

---

## 🚀 Optional Enhancements

After basic deployment works, consider:

### Custom Domain
1. Purchase domain (or use subdomain)
2. Add to Vercel: Project Settings → Domains
3. Configure DNS (CNAME to Vercel)
4. Update Supabase Site URL

### Monitoring
1. **Vercel Analytics**:
   ```bash
   npm install @vercel/analytics
   ```
   Add to `app/src/main.tsx`

2. **Sentry Error Tracking**:
   ```bash
   npm install @sentry/react
   ```
   Configure with DSN

3. **Supabase Monitoring**:
   - Check Reports dashboard
   - Set up alerts for high usage

### OAuth Providers
1. Go to Supabase Auth Providers
2. Enable Google, GitHub, or Microsoft
3. Configure OAuth apps
4. Add client IDs and secrets

---

## 📞 Support

If you encounter issues:

1. **Check logs**:
   - Vercel: Project → Deployments → View logs
   - GitHub Actions: Actions tab → Select workflow run
   - Supabase: Database → Logs

2. **Common issues**:
   - Build fails: Check `package.json` dependencies
   - Auth not working: Verify redirect URLs
   - Database errors: Check RLS policies
   - Offline mode: Verify service worker registration

3. **Documentation**:
   - `CLOUD_DEPLOYMENT_GUIDE.md` - Full deployment guide
   - `DEPLOY_SCHEMA.md` - Schema deployment details
   - `DEPLOYMENT_STATUS.md` - Complete status tracker

4. **Resources**:
   - Vercel Docs: https://vercel.com/docs
   - Supabase Docs: https://supabase.com/docs
   - GitHub Actions: https://docs.github.com/actions

---

## 🎉 Success!

Once all steps are complete, you'll have:

- ✅ Production-ready application on Vercel
- ✅ Multi-tenant database on Supabase
- ✅ Real-time collaboration
- ✅ Offline-first functionality
- ✅ Automated CI/CD pipeline
- ✅ Daily backups
- ✅ Secure authentication

**Share your deployment**:
- Update README with production URL
- Share with team members
- Start using for real projects!

---

**Last Updated**: 2025-10-18
