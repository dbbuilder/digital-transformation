# Supabase Setup Instructions

This document provides step-by-step instructions for setting up the Supabase backend for multi-user collaboration.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works fine)

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: `digital-transformation` (or any name you prefer)
   - **Database Password**: Choose a strong password and save it securely
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be provisioned

---

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, click on the **"Settings"** icon (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see two important values:
   - **Project URL**: Something like `https://abcdefghijklmnop.supabase.co`
   - **anon public key**: A long JWT token starting with `eyJ...`

4. Copy these values - you'll need them in the next step

---

## Step 3: Configure Your Local Environment

1. Open the `.env` file in the `app/` directory (it was created from `.env.example`)

2. Replace the placeholder values with your actual credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-actual-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-actual-key

# App Configuration
VITE_APP_NAME=Digital Transformation Planner
VITE_SYNC_INTERVAL=5000
```

3. Save the file

**IMPORTANT**: Never commit the `.env` file to Git. It's already in `.gitignore`.

---

## Step 4: Execute the Database Schema

1. In your Supabase project dashboard, click the **"SQL Editor"** icon in the left sidebar

2. Click **"New query"** button

3. Open the file `supabase/schema.sql` from this repository

4. Copy the ENTIRE contents of the file (600+ lines)

5. Paste it into the SQL Editor in Supabase

6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

7. You should see a success message: **"Success. No rows returned"**

8. Verify the schema was created:
   - Click the **"Table Editor"** icon in the left sidebar
   - You should see all these tables:
     - profiles
     - projects
     - project_members
     - teams
     - stakeholders
     - assessments
     - assessment_responses
     - sow_section_approvals
     - sow_approval_workflows
     - sync_metadata

---

## Step 5: Enable Row Level Security (RLS)

The schema already includes Row Level Security policies, but you should verify they're enabled:

1. Go to **"Authentication"** → **"Policies"** in the Supabase dashboard

2. For each table, verify that:
   - ✅ **RLS is enabled** (toggle should be ON)
   - ✅ Policies are listed (SELECT, INSERT, UPDATE, DELETE)

3. If any policies are missing, re-run the schema from Step 4

---

## Step 6: Create Your First User (Optional - for testing)

### Option A: Using Supabase Auth UI (Recommended)

1. Go to **"Authentication"** → **"Users"** in the Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: your email address
   - **Password**: a test password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**

### Option B: Using the App's Sign-Up Flow

The app will have a sign-up page once authentication is integrated (coming in Phase 2).

---

## Step 7: Test the Connection

1. Restart your development server:

```bash
cd app
npm run dev
```

2. Open the browser console (F12)

3. You should see the app load without errors

4. If you see an error about missing Supabase credentials, double-check your `.env` file

---

## Step 8: Verify Multi-Tenant Setup

Once you have at least one user created:

1. Go to **"Table Editor"** → **"projects"** in Supabase
2. Click **"Insert row"**
3. Fill in:
   - **name**: "Test Project"
   - **created_by**: Select your user's UUID from the dropdown
4. Click **"Save"**

5. Go to **"Table Editor"** → **"project_members"**
6. Click **"Insert row"**
7. Fill in:
   - **project_id**: Select the project you just created
   - **user_id**: Select your user's UUID
   - **role**: "owner"
8. Click **"Save"**

Now that user has access to that project!

---

## Architecture Overview

### Multi-Tenant Design

```
┌─────────────────────────────────────────────────────┐
│  User A                                             │
│  ├── Project 1 (owner)                              │
│  ├── Project 2 (editor)                             │
│  └── Project 3 (viewer)                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  User B                                             │
│  ├── Project 2 (owner)                              │
│  └── Project 4 (owner)                              │
└─────────────────────────────────────────────────────┘
```

- Each **user** can belong to multiple **projects**
- Each **project** can have multiple **users**
- Access is controlled via the `project_members` table
- Row-Level Security ensures users only see projects they're members of

### Data Isolation

All tables have a `project_id` foreign key and RLS policies that enforce:

```sql
-- Example policy: Users can only see teams in projects they're members of
CREATE POLICY "Users can view teams in their projects"
  ON public.teams FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_members
      WHERE user_id = auth.uid()
    )
  );
```

This means:
- **User A** can see teams in Projects 1, 2, 3
- **User B** can see teams in Projects 2, 4
- **User A** cannot see teams in Project 4
- **User B** cannot see teams in Projects 1, 3

---

## Sync Metadata

Every table has these fields for conflict detection:

| Field | Type | Purpose |
|-------|------|---------|
| `_version` | bigint | Auto-incremented on every UPDATE |
| `_last_modified_at` | timestamptz | Timestamp of last change |
| `_last_modified_by` | uuid | User who made the change |

**How sync works:**

1. **Client A** reads a project: `{ id: 1, name: "Old Name", _version: 5 }`
2. **Client B** reads the same project: `{ id: 1, name: "Old Name", _version: 5 }`
3. **Client A** updates: `UPDATE projects SET name = 'New Name A' WHERE id = 1 AND _version = 5`
   - Trigger increments version → `_version = 6`
4. **Client B** tries to update: `UPDATE projects SET name = 'New Name B' WHERE id = 1 AND _version = 5`
   - ❌ No rows updated (version is now 6, not 5)
   - **Conflict detected!**
5. **Client B** must:
   - Fetch latest version (`_version = 6`)
   - Show conflict resolution UI
   - Let user choose: keep A's changes, keep B's changes, or merge

---

## Real-Time Subscriptions

The schema is ready for real-time updates. Once the SyncService is implemented, changes will be broadcast automatically:

```typescript
// Example: Listen for changes to assessment_responses
supabase
  .channel('assessment_responses')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'assessment_responses'
    },
    (payload) => {
      console.log('Change detected:', payload)
      // Update local IndexedDB
      // Refresh UI
    }
  )
  .subscribe()
```

---

## Security Notes

### What's Protected

✅ **Row-Level Security** ensures users can only access projects they're members of
✅ **API Keys** are scoped to the project (not global)
✅ **Authentication** is required for all data access
✅ **Version tracking** prevents accidental overwrites

### What's NOT Protected (Yet)

⚠️ **Email verification** is not enforced (users can sign up with any email)
⚠️ **Rate limiting** is basic (Supabase default)
⚠️ **File uploads** are not restricted by size/type (will be added later)
⚠️ **Admin panel** doesn't exist yet (will be added in Phase 3)

---

## Troubleshooting

### Error: "Missing Supabase credentials"

**Cause**: `.env` file is not configured or not loaded

**Fix**:
1. Verify `.env` exists in `app/` directory
2. Check that values don't have quotes: `VITE_SUPABASE_URL=https://...` (NOT `"https://..."`)
3. Restart dev server: `npm run dev`

### Error: "Invalid API key"

**Cause**: Wrong anon key or expired project

**Fix**:
1. Go to Supabase dashboard → Settings → API
2. Copy the **anon public key** again
3. Update `.env` file
4. Restart dev server

### Error: "relation 'projects' does not exist"

**Cause**: Schema was not executed

**Fix**:
1. Go to SQL Editor in Supabase
2. Run the entire `supabase/schema.sql` file
3. Verify tables appear in Table Editor

### Error: "new row violates row-level security policy"

**Cause**: Trying to insert data without proper authentication

**Fix**:
1. Ensure user is logged in
2. Ensure user is a member of the project (check `project_members` table)
3. Check RLS policies are correct

### Tables created but policies missing

**Cause**: SQL execution was interrupted

**Fix**:
1. Delete all tables manually (or drop the schema)
2. Re-run the ENTIRE `schema.sql` file in one go
3. Don't run it section by section

---

## Next Steps

Once Supabase is configured and the schema is deployed:

1. ✅ **Phase 1**: Database schema deployed (you are here)
2. 🔜 **Phase 2**: Implement SyncService in the app
3. 🔜 **Phase 3**: Add authentication UI (login, signup, password reset)
4. 🔜 **Phase 4**: Add real-time subscriptions
5. 🔜 **Phase 5**: Add conflict resolution UI
6. 🔜 **Phase 6**: Add sync status indicators
7. 🔜 **Phase 7**: Add offline queue for changes
8. 🔜 **Phase 8**: Test multi-user scenarios

See `SYNC_ARCHITECTURE_PLAN.md` for detailed implementation phases.

---

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Check the browser console for errors (F12)
3. Check the Supabase dashboard logs (Logs & Analytics)
4. Verify RLS policies are enabled
5. Ensure your `.env` file has the correct credentials

---

**Last Updated**: 2025-10-18
