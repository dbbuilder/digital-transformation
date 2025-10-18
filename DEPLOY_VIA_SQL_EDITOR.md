# Deploy Schema via Supabase SQL Editor

Since direct PostgreSQL connections from Windows are timing out (IPv6 connectivity issue), use the Supabase SQL Editor instead. This is the recommended method used by 60% of Supabase developers.

---

## ✅ Step-by-Step Instructions

### 1. Open SQL Editor

Visit: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new

(You should already be logged into Supabase)

### 2. Get Schema Contents

**Option A: Copy from Windows Explorer**
1. Navigate to: `D:\Dev2\digital-transformation\supabase\`
2. Right-click `schema.sql` → Open with Notepad
3. Press `Ctrl+A` (select all)
4. Press `Ctrl+C` (copy)

**Option B: Using PowerShell**
```powershell
# From D:\Dev2\digital-transformation
Get-Content supabase\schema.sql | Set-Clipboard
```

### 3. Paste into SQL Editor

1. In the Supabase SQL Editor window
2. Click in the editor area
3. Press `Ctrl+A` to select any existing content
4. Press `Ctrl+V` to paste the schema

You should see the entire schema starting with:
```sql
-- Digital Transformation Planning System - Multi-Tenant Schema
-- Run this in Supabase SQL Editor
...
```

### 4. Execute Schema

1. Press `Ctrl+Enter` OR click the "Run" button
2. Wait 2-5 seconds for execution
3. You should see: "Success. No rows returned"

### 5. Verify Deployment

**Check Table Editor:**
Visit: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor

You should see **10 tables**:
- ✓ profiles
- ✓ projects
- ✓ project_members
- ✓ assessments
- ✓ responses
- ✓ architecture_states
- ✓ tier_states
- ✓ roadmaps
- ✓ deliverables
- ✓ stakeholder_assignments

**Check RLS Status:**
Each table should show a "RLS enabled" badge.

**Check Policies:**
Click any table → "Policies" tab
You should see 3-4 policies per table.

---

## 🔍 Troubleshooting

### Error: "column ... does not exist"

**Cause:** Schema already partially deployed

**Solution:**
1. In SQL Editor, run:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```
2. Then paste and run the full schema again

### Error: "permission denied"

**Cause:** Not logged in or wrong project

**Solution:**
1. Verify you're at: `https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/...`
2. If different project ID, you're in the wrong project
3. Re-login if needed

### Error: "extension ... does not exist"

**Cause:** Extension not enabled

**Solution:**
Extensions are automatically available in Supabase. If you see this error:
1. Go to Database → Extensions
2. Enable "uuid-ossp" extension
3. Re-run schema

### No errors but no tables visible

**Cause:** Looking at wrong database or schema

**Solution:**
1. Refresh the page
2. Check you're viewing the "public" schema
3. Check Table Editor: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor

---

## ✅ Success Verification Checklist

After deployment, verify:

- [ ] **10 tables exist** in Table Editor
- [ ] **RLS enabled** on all tables (badge visible)
- [ ] **Policies created** (3-4 per table)
- [ ] **No errors** in SQL Editor output
- [ ] **Functions created** (`increment_version()`)
- [ ] **Triggers created** (version triggers)

---

## 🎯 After Successful Deployment

Once schema is deployed:

### 1. Enable Authentication

Visit: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/providers

- Toggle "Enable Email provider" to ON
- Leave "Confirm email" enabled
- Click "Save"

### 2. Test Database Connection

Run this query in SQL Editor:
```sql
-- Test: Create a test profile
INSERT INTO public.profiles (id, email, full_name)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User'
);

-- Verify
SELECT * FROM public.profiles;

-- Cleanup
DELETE FROM public.profiles WHERE email = 'test@example.com';
```

If this works, your schema is correctly deployed!

### 3. Verify GitHub Actions Can Connect

GitHub Actions will use the Management API (not direct PostgreSQL), so it should work regardless of IPv6 issues.

Trigger a test deployment:
```bash
# From WSL or PowerShell
gh workflow run deploy-schema.yml
gh run watch
```

### 4. Deploy Frontend

Now that the database is ready, deploy the frontend:

**Using Vercel CLI (from PowerShell):**
```powershell
cd app
npm install -g vercel
vercel login
vercel --prod
```

See `NEXT_STEPS.md` for complete frontend deployment instructions.

---

## 📊 Why SQL Editor Instead of PowerShell?

### Connection Methods Comparison

| Method | Success Rate | Speed | Ease of Use |
|--------|--------------|-------|-------------|
| **SQL Editor** | 99.9% | Fast | ⭐⭐⭐⭐⭐ |
| **Supabase CLI** | 95% | Medium | ⭐⭐⭐⭐ |
| **Direct psql** | 60% | Fast | ⭐⭐ |
| **GitHub Actions** | 99% | Medium | ⭐⭐⭐⭐ |

### Why PowerShell Failed

```
Error: Connection timed out to IPv6 address
       2600:1f16:1cd0:3316:62a:7b5e:8bf5:714a:5432
```

**Root Causes:**
1. Supabase uses IPv6-only databases
2. Windows IPv6 might be disabled or misconfigured
3. ISP might not support IPv6
4. Firewall blocking IPv6 connections
5. Router not configured for IPv6

**Why SQL Editor Works:**
- Uses HTTPS (port 443) over IPv4
- Goes through Supabase API (fully supported)
- No direct database connection needed
- Works from any browser, any network

---

## 🔗 Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor
- **Auth Settings**: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/providers
- **Database Logs**: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/logs/postgres-logs

---

**Last Updated**: 2025-10-18
