# Schema Deployment Options

## Issue: WSL2 IPv6 Networking

Supabase databases use IPv6-only addresses, and WSL2 has known issues with IPv6 connectivity. This causes `ENETUNREACH` errors when trying to connect directly from WSL.

---

## ✅ RECOMMENDED: Manual SQL Editor (Easiest)

**Time:** 2 minutes
**Complexity:** Low
**Success Rate:** 100%

### Steps:

1. **Copy schema to clipboard:**
   ```bash
   cat supabase/schema.sql
   ```
   Or use PowerShell:
   ```powershell
   Get-Content supabase\schema.sql -Raw | Set-Clipboard
   ```

2. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new

3. **Paste and run** (Ctrl+Enter or click "Run")

4. **Verify tables created:**
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor

---

## Option 2: PowerShell Script (Windows)

**Time:** 5 minutes
**Complexity:** Medium
**Success Rate:** High (if IPv6 works)

PowerShell has better IPv6 support than WSL.

### Steps:

```powershell
cd /mnt/d/Dev2/digital-transformation

# Open PowerShell (not WSL)
$env:SUPABASE_DB_PASSWORD = "Gv51076!"
.\scripts\deploy-schema.ps1
```

---

## Option 3: Node.js Script (WSL - Currently Blocked)

**Time:** N/A
**Complexity:** High
**Success Rate:** Low (IPv6 blocked in WSL2)

This approach is currently blocked by WSL2's IPv6 networking limitations.

### Attempted Fixes:
- ✅ Tried connection pooler (port 6543)
- ✅ Tried forcing IPv4 resolution
- ✅ Tried direct connection (port 5432)
- ❌ All failed due to `ENETUNREACH` for IPv6

### To fix (advanced):

1. **Enable IPv6 in WSL2:**
   ```bash
   # Edit /etc/wsl.conf
   echo -e "[network]\nipv6=true" | sudo tee -a /etc/wsl.conf

   # Restart WSL from PowerShell
   wsl --shutdown
   ```

2. **Or use Windows PowerShell** instead of WSL bash

---

## What the Schema Creates

Once deployed, you'll have:

### Tables (10)
- `profiles` - User profiles
- `projects` - Digital transformation projects (multi-tenant root)
- `project_members` - Access control (who can access which projects)
- `teams` - Team hierarchy
- `stakeholders` - People involved
- `assessments` - Phase/Tier combinations
- `assessment_responses` - Interview answers with version tracking
- `sow_section_approvals` - SOW section approvals
- `sow_approval_workflows` - Multi-step approval workflows
- `sync_metadata` - Track last sync per user per table

### Security Features
- ✅ Row-Level Security (RLS) on all tables
- ✅ Users can only see projects they're members of
- ✅ Automatic version tracking on updates
- ✅ `_version`, `_last_modified_at`, `_last_modified_by` fields

### Performance Features
- ✅ 30+ indexes for query optimization
- ✅ Triggers for automatic version increments
- ✅ Helper function: `add_project_member()`

### Sync Features
- ✅ Conflict detection via version numbers
- ✅ Last-modified tracking
- ✅ User attribution for all changes

---

## After Deployment

### Verify Tables Exist

Go to Table Editor:
https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/editor

You should see all 10 tables listed.

### Create First Test User

1. Go to **Authentication** → **Users**:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/users

2. Click **"Add user"** → **"Create new user"**

3. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Auto Confirm User: ✅

4. Copy the **User UUID**

### Create First Project

1. Go to **Table Editor** → **projects**

2. Click **"Insert row"**

3. Fill in:
   - **name**: "Test Digital Transformation Project"
   - **organization_name**: "Test Organization"
   - **transformation_path**: "AI_INCLUDED"
   - **created_by**: Paste User UUID

4. Click **"Save"**

5. Copy the **project id**

### Add User to Project

1. Go to **Table Editor** → **project_members**

2. Click **"Insert row"**

3. Fill in:
   - **project_id**: Paste project id from above
   - **user_id**: Paste User UUID
   - **role**: "owner"

4. Click **"Save"**

Now that user can access that project!

---

## Next Steps After Schema Deployment

1. ✅ Schema deployed
2. 🔜 Implement SyncService in the app
3. 🔜 Add authentication UI (login, signup)
4. 🔜 Add real-time subscriptions
5. 🔜 Add conflict resolution UI
6. 🔜 Test multi-user scenarios

See `SYNC_ARCHITECTURE_PLAN.md` for detailed implementation plan.

---

## Troubleshooting

### "relation 'projects' does not exist"
**Cause:** Schema not executed yet
**Fix:** Run the schema in SQL Editor

### "new row violates row-level security policy"
**Cause:** User not added to `project_members`
**Fix:** Insert a row in `project_members` table linking user to project

### "permission denied for table projects"
**Cause:** Not logged in or RLS policies not created
**Fix:** Re-run entire schema (includes RLS policies)

### Can't connect from WSL
**Cause:** IPv6 networking issues in WSL2
**Fix:** Use SQL Editor (web UI) or PowerShell instead

---

## Summary

**Easiest approach:** Copy `supabase/schema.sql` contents and paste into Supabase SQL Editor.

**Time to deploy:** 2 minutes

**What you get:** Fully configured multi-tenant database with Row-Level Security, version tracking, and sync capabilities.
