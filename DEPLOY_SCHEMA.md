# Deploying Supabase Schema

There are two methods to deploy the database schema to Supabase. Choose the method that works best for your environment.

---

## Method 1: PowerShell Script (Recommended)

This method uses a PowerShell script that runs `psql` directly. It works on Windows and can connect to Supabase's IPv6 database.

### Prerequisites

1. **PostgreSQL Client** installed:
   ```powershell
   winget install PostgreSQL.PostgreSQL
   ```

2. **Windows PowerShell** (not WSL) - WSL2 has IPv6 networking issues with Supabase

### Steps

1. **Open Windows PowerShell** (not PowerShell in WSL):
   ```powershell
   # Press Win+X, select "Windows PowerShell" or "Terminal"
   ```

2. **Navigate to project directory**:
   ```powershell
   cd D:\Dev2\digital-transformation
   ```

3. **Run deployment script**:
   ```powershell
   .\deploy-schema.ps1
   ```

4. **Verify deployment**:
   - Script will show success message
   - Visit Supabase Table Editor: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor
   - Verify all 10 tables exist:
     - profiles
     - projects
     - project_members
     - assessments
     - responses
     - architecture_states
     - tier_states
     - roadmaps
     - deliverables
     - stakeholder_assignments

---

## Method 2: Supabase SQL Editor (Manual)

This method uses the Supabase web interface. It's the most reliable method and works from any environment.

### Steps

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new

2. **Copy schema file contents**:
   ```bash
   # From WSL or any terminal
   cat supabase/schema.sql
   ```

3. **Paste into SQL Editor**:
   - Select all contents of `schema.sql`
   - Paste into the SQL Editor

4. **Execute**:
   - Press `Ctrl+Enter` or click "Run"
   - Wait for completion (should take 2-5 seconds)

5. **Verify**:
   - Go to Table Editor: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor
   - Confirm all 10 tables created successfully
   - Check that Row-Level Security (RLS) is enabled on all tables

---

## Method 3: GitHub Actions (Automated)

Once the schema is deployed manually the first time, subsequent updates can be automated via GitHub Actions.

### Prerequisites

1. **GitHub secrets configured**:
   - ✅ `SUPABASE_PROJECT_ID`
   - ✅ `SUPABASE_DB_PASSWORD`
   - ⏳ `SUPABASE_ACCESS_TOKEN` (needs to be created)

### Steps

1. **Create Supabase Access Token**:
   - Visit: https://supabase.com/dashboard/account/tokens
   - Click "Generate new token"
   - Name: "GitHub Actions CI/CD"
   - Copy the token

2. **Set GitHub secret**:
   ```bash
   gh secret set SUPABASE_ACCESS_TOKEN --body 'your-token-here' --repo dbbuilder/digital-transformation
   ```

3. **Trigger workflow**:
   ```bash
   # Manual trigger
   gh workflow run deploy-schema.yml

   # Or push changes to main branch
   git add supabase/schema.sql
   git commit -m "feat: update schema"
   git push origin main
   ```

4. **Monitor deployment**:
   ```bash
   gh run watch
   ```

---

## Troubleshooting

### Error: "psql: command not found"

**Solution**: Install PostgreSQL client

**Windows**:
```powershell
winget install PostgreSQL.PostgreSQL
# Or download: https://www.postgresql.org/download/windows/
```

**WSL/Linux**:
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

**macOS**:
```bash
brew install postgresql
```

---

### Error: "ENETUNREACH" or "connection refused"

**Cause**: Running from WSL2, which has broken IPv6 routing to Supabase

**Solution**: Use Windows PowerShell instead:
1. Close WSL terminal
2. Open Windows PowerShell (Win+X → Windows PowerShell)
3. Run `.\deploy-schema.ps1`

---

### Error: "password authentication failed"

**Cause**: Incorrect database password

**Solution**: Verify password in `app.secrets.json`:
```json
{
  "supabase": {
    "databasePassword": "#DBBuilder01!"
  }
}
```

If password is different, update the script:
```powershell
.\deploy-schema.ps1 -DbPassword "your-actual-password"
```

---

### Error: "relation already exists"

**Cause**: Schema already deployed

**Solution**: Either:
1. **Drop and recreate**: Run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` in SQL Editor first
2. **Ignore**: If tables already exist with correct structure, this is fine

---

## Verification Checklist

After deployment, verify:

- [ ] **10 tables created**:
  - profiles
  - projects
  - project_members
  - assessments
  - responses
  - architecture_states
  - tier_states
  - roadmaps
  - deliverables
  - stakeholder_assignments

- [ ] **RLS enabled** on all tables (check "RLS enabled" badge in Table Editor)

- [ ] **Policies created** (click table → Policies tab):
  - Each table should have 3-4 policies
  - Policies should reference `auth.uid()` and `project_members`

- [ ] **Indexes created** (click table → Indexes tab):
  - Foreign key indexes
  - Composite indexes for queries

- [ ] **Functions created**:
  - `increment_version()`
  - Check in SQL Editor: `SELECT proname FROM pg_proc WHERE pronamespace = 'public'::regnamespace;`

- [ ] **Triggers created**:
  - Version triggers on all main tables
  - Check: `SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname LIKE '%version%';`

---

## Next Steps

Once schema is deployed:

1. **Enable Email Authentication**:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/providers

2. **Configure Site URL**:
   - Set to your production URL (or Vercel preview URL)
   - Add redirect URLs for auth callbacks

3. **Create first user**:
   ```sql
   -- Run in SQL Editor
   INSERT INTO auth.users (email, encrypted_password)
   VALUES ('your-email@example.com', crypt('your-password', gen_salt('bf')));
   ```

4. **Deploy frontend** (see `CLOUD_DEPLOYMENT_GUIDE.md`)

5. **Test multi-user sync**:
   - Create project
   - Invite second user via `project_members`
   - Test real-time updates

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **GitHub Actions Logs**: https://github.com/dbbuilder/digital-transformation/actions
