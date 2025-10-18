# Schema Verification Queries

Quick verification queries to test your Supabase schema deployment.

**Last Updated**: 2025-10-18

---

## ✅ Quick Verification

Run these queries in the Supabase SQL Editor to verify your deployment:

**SQL Editor**: https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/sql/new

---

## 1. Verify All Tables Exist

```sql
-- Check all tables in digiform and public schemas
SELECT
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema IN ('digiform', 'public')
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
ORDER BY table_schema, table_name;
```

**Expected Result** (10 tables):
```
table_schema | table_name             | table_type
-------------+------------------------+-----------
digiform     | assessments            | BASE TABLE
digiform     | assessment_responses   | BASE TABLE
digiform     | project_members        | BASE TABLE
digiform     | projects               | BASE TABLE
digiform     | sow_approval_workflows | BASE TABLE
digiform     | sow_section_approvals  | BASE TABLE
digiform     | stakeholders           | BASE TABLE
digiform     | sync_metadata          | BASE TABLE
digiform     | teams                  | BASE TABLE
public       | profiles               | BASE TABLE
```

---

## 2. Verify Row-Level Security (RLS)

```sql
-- Check RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname IN ('digiform', 'public')
  AND tablename NOT LIKE 'pg_%'
ORDER BY schemaname, tablename;
```

**Expected Result**: All tables should show `rowsecurity = true`

---

## 3. Verify Functions Exist

```sql
-- Check all custom functions
SELECT
  routine_schema,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema IN ('digiform', 'public')
  AND routine_type = 'FUNCTION'
ORDER BY routine_schema, routine_name;
```

**Expected Result** (3 functions):
```
routine_schema | routine_name        | routine_type | return_type
---------------+---------------------+--------------+-------------
digiform       | add_project_member  | FUNCTION     | bigint
digiform       | increment_version   | FUNCTION     | trigger
public         | handle_new_user     | FUNCTION     | trigger
```

---

## 4. Verify Triggers Exist

```sql
-- Check all triggers
SELECT
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema IN ('digiform', 'public', 'auth')
  AND trigger_name NOT LIKE 'pg_%'
ORDER BY event_object_schema, event_object_table, trigger_name;
```

**Expected Result** (8 triggers):
```
event_object_schema | event_object_table       | trigger_name
--------------------+--------------------------+--------------------------------
auth                | users                    | on_auth_user_created
digiform            | assessments              | assessments_version_trigger
digiform            | assessment_responses     | responses_version_trigger
digiform            | projects                 | projects_version_trigger
digiform            | sow_approval_workflows   | workflows_version_trigger
digiform            | sow_section_approvals    | approvals_version_trigger
digiform            | stakeholders             | stakeholders_version_trigger
digiform            | teams                    | teams_version_trigger
```

---

## 5. Verify RLS Policies

```sql
-- Check policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE schemaname IN ('digiform', 'public')
ORDER BY schemaname, tablename, policyname;
```

**Expected Result**: Should show 20+ policies across all tables

---

## 6. Verify Indexes

```sql
-- Check indexes for performance
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname IN ('digiform', 'public')
  AND indexname NOT LIKE 'pg_%'
ORDER BY schemaname, tablename, indexname;
```

**Expected Result**: Should show primary keys + performance indexes

---

## 7. Verify Foreign Keys

```sql
-- Check foreign key constraints
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema IN ('digiform', 'public')
ORDER BY tc.table_schema, tc.table_name, kcu.column_name;
```

**Expected Result**: Should show all foreign key relationships

---

## 8. Count Tables by Schema

```sql
-- Quick count of tables
SELECT
  table_schema,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema IN ('digiform', 'public')
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
GROUP BY table_schema
ORDER BY table_schema;
```

**Expected Result**:
```
table_schema | table_count
-------------+------------
digiform     | 9
public       | 1
```

---

## 9. Test Profile Auto-Creation

To test the `on_auth_user_created` trigger that auto-creates profiles:

### Method 1: Via Supabase Dashboard

1. Go to Auth > Users:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/users

2. Click "Add user"
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Auto Confirm User: ON
   - Click "Create user"

3. Verify profile was auto-created:
   ```sql
   SELECT * FROM public.profiles WHERE email = 'test@example.com';
   ```

4. Clean up:
   ```sql
   DELETE FROM public.profiles WHERE email = 'test@example.com';
   ```
   Then delete user in Auth dashboard

### Method 2: Via SQL (Advanced)

```sql
-- This requires service_role access
-- Use Supabase dashboard Auth > Users instead
```

---

## 10. Test Project Creation Flow

```sql
-- Create a test project (requires authenticated user)
-- This will fail if you're not logged in, which is correct (RLS working!)

INSERT INTO digiform.projects (name, organization_name, transformation_path, created_by)
VALUES (
  'Test Project',
  'Test Organization',
  'AI_INCLUDED',
  auth.uid()  -- Will be NULL if not authenticated
);
```

**Expected Behavior**:
- If logged in: Creates project ✓
- If not logged in: Error (RLS working) ✓

---

## 🔍 Troubleshooting

### Error: "permission denied for schema digiform"

**Cause**: User doesn't have permissions

**Fix**: Permissions should be auto-granted. If not, run:
```sql
GRANT USAGE ON SCHEMA digiform TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA digiform TO authenticated, anon;
```

### Error: "relation does not exist"

**Cause**: Schema not deployed or wrong schema name

**Fix**:
1. Check you're using `digiform.table_name` not `public.table_name`
2. Re-run schema deployment

### Error: "new row violates row-level security policy"

**Cause**: RLS is working! You're not authenticated or don't have access.

**Fix**: This is correct behavior. Either:
1. Log in as a user
2. Check your RLS policies
3. Use service_role key for admin access

---

## ✅ Success Checklist

After running all queries, verify:

- [ ] 10 tables exist (9 in digiform, 1 in public)
- [ ] All tables have RLS enabled
- [ ] 3 functions exist (2 in digiform, 1 in public)
- [ ] 8 triggers exist
- [ ] 20+ RLS policies exist
- [ ] Foreign keys are enforced
- [ ] Indexes created for performance
- [ ] Auth trigger auto-creates profiles

If all checks pass, your schema is correctly deployed! 🎉

---

## 🚀 Next Steps

Once verification is complete:

1. **Enable Authentication**:
   https://supabase.com/dashboard/project/grglttyirzxfdpbyuxut/auth/providers

2. **Deploy Frontend**:
   See `NEXT_STEPS.md` for instructions

3. **Test End-to-End**:
   - Sign up as user
   - Create project
   - Verify sync works

---

**Last Verified**: 2025-10-18
**Schema Version**: 1.0.0
