# CI/CD Setup Guide for Supabase Schema Deployment

This guide explains how to set up automated deployments for the digital transformation project.

---

## 🎯 Overview

We have 3 GitHub Actions workflows:

1. **`deploy-schema.yml`** - Deploys schema changes to Supabase (runs on push to main)
2. **`test-schema.yml`** - Tests schema changes in PRs (runs on pull requests)
3. **`backup-schema.yml`** - Daily automated backups (runs at 2 AM UTC)

---

## 🔧 Setup Instructions

### Step 1: Configure GitHub Secrets

Go to your GitHub repository:
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `SUPABASE_PROJECT_ID` | `grglttyirzxfdpbyuxut` | Supabase dashboard URL |
| `SUPABASE_DB_PASSWORD` | `#DBBuilder01!` | Database settings |
| `SUPABASE_ACCESS_TOKEN` | (Create new) | See instructions below |

#### Getting the Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Name: `GitHub Actions CI/CD`
4. Copy the token (you won't see it again!)
5. Add as `SUPABASE_ACCESS_TOKEN` secret

---

### Step 2: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under **"Workflow permissions"**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

---

### Step 3: Test the Workflows

#### Test Schema Deployment (Manual Trigger)

1. Go to **Actions** tab
2. Select **"Deploy Supabase Schema"**
3. Click **"Run workflow"**
4. Select branch: `main`
5. Click **"Run workflow"**

Watch the logs to see:
- ✅ Schema file verification
- ✅ PostgreSQL client installation
- ✅ Schema deployment
- ✅ Table count verification

#### Test on Pull Request

1. Create a new branch:
   ```bash
   git checkout -b test/schema-change
   ```

2. Make a small change to `supabase/schema.sql`:
   ```sql
   -- Add a comment at the end
   COMMENT ON DATABASE postgres IS 'Digital Transformation Database';
   ```

3. Commit and push:
   ```bash
   git add supabase/schema.sql
   git commit -m "test: add database comment"
   git push origin test/schema-change
   ```

4. Create a pull request on GitHub

5. Watch **"Test Schema Changes"** workflow run automatically

---

## 📋 Workflow Details

### 1. Deploy Schema (`deploy-schema.yml`)

**Triggers:**
- Push to `main` branch
- Changes to `supabase/migrations/**` or `supabase/schema.sql`
- Manual trigger via workflow dispatch

**What it does:**
1. Checks out code
2. Installs Supabase CLI and PostgreSQL client
3. Links to Supabase project
4. Deploys schema using `psql`
5. Verifies deployment (counts tables)
6. Creates deployment tag
7. Notifies on failure

**Environment:** Ubuntu GitHub runner (has IPv6 support ✅)

---

### 2. Test Schema (`test-schema.yml`)

**Triggers:**
- Pull requests affecting `supabase/**`
- Pushes to non-main branches

**What it does:**
1. Lints SQL with sqlfluff
2. Starts local PostgreSQL
3. Applies schema to test database
4. Verifies tables and RLS policies
5. Comments on PR with results

**Why it's useful:**
- Catches syntax errors before merge
- Validates schema structure
- Prevents breaking changes

---

### 3. Backup Schema (`backup-schema.yml`)

**Triggers:**
- Daily at 2 AM UTC (cron schedule)
- Manual trigger via workflow dispatch

**What it does:**
1. Dumps schema from Supabase (no data)
2. Saves as artifact (30 day retention)
3. Commits to `backups/` directory
4. Pushes to repository

**Why it's useful:**
- Recovery from accidental changes
- Audit trail of schema evolution
- Rollback capability

---

## 🚀 Deployment Flow

### Automatic Deployment (Recommended)

```bash
# 1. Create feature branch
git checkout -b feature/add-new-table

# 2. Make schema changes
vim supabase/schema.sql

# 3. Commit changes
git add supabase/schema.sql
git commit -m "feat: add new analytics table"

# 4. Push and create PR
git push origin feature/add-new-table
# Create PR on GitHub

# 5. Wait for tests to pass
# "Test Schema Changes" workflow runs automatically

# 6. Merge PR
# "Deploy Supabase Schema" workflow runs automatically
```

### Manual Deployment

```bash
# Go to GitHub Actions
# → Select "Deploy Supabase Schema"
# → Click "Run workflow"
# → Select environment and branch
# → Click "Run workflow"
```

---

## 🔍 Monitoring & Debugging

### View Deployment Logs

1. Go to **Actions** tab
2. Click on the workflow run
3. Expand **"Deploy schema via psql"** step
4. Check for errors

### Common Issues

#### ❌ "SUPABASE_DB_PASSWORD not found"

**Fix:** Add secret in repository settings

```bash
# Verify secrets are set
gh secret list
```

#### ❌ "password authentication failed"

**Fix:** Update `SUPABASE_DB_PASSWORD` secret with correct value

#### ❌ "relation already exists"

**Fix:** Schema is idempotent. Add `IF NOT EXISTS` clauses:

```sql
CREATE TABLE IF NOT EXISTS projects (...);
```

#### ❌ "Network unreachable"

**Cause:** GitHub runners have full IPv6 support, this shouldn't happen

**Debug:**
```yaml
- name: Debug network
  run: |
    ping6 db.grglttyirzxfdpbyuxut.supabase.co
    nslookup db.grglttyirzxfdpbyuxut.supabase.co
```

---

## 🛡️ Security Best Practices

### Secrets Management

✅ **DO:**
- Store all credentials in GitHub Secrets
- Use `SUPABASE_ACCESS_TOKEN` for CLI operations
- Rotate tokens every 90 days

❌ **DON'T:**
- Commit secrets to repository
- Share secrets in logs
- Use personal access tokens (use project-specific tokens)

### Schema Changes

✅ **DO:**
- Test locally first
- Use pull requests for review
- Add `IF NOT EXISTS` for idempotency
- Use migrations for tracking changes

❌ **DON'T:**
- Deploy directly to production without testing
- Drop tables without backups
- Remove RLS policies without careful review

---

## 📊 Alternative CI/CD Platforms

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
deploy:
  image: ubuntu:latest
  before_script:
    - apt-get update && apt-get install -y postgresql-client curl
  script:
    - psql "postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres?sslmode=require" -f supabase/schema.sql
  only:
    - main
```

### Azure DevOps

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- script: |
    sudo apt-get update
    sudo apt-get install -y postgresql-client
  displayName: 'Install PostgreSQL client'

- script: |
    psql "postgresql://postgres:$(SUPABASE_DB_PASSWORD)@db.$(SUPABASE_PROJECT_ID).supabase.co:5432/postgres?sslmode=require" -f supabase/schema.sql
  displayName: 'Deploy schema'
  env:
    SUPABASE_DB_PASSWORD: $(SUPABASE_DB_PASSWORD)
    SUPABASE_PROJECT_ID: $(SUPABASE_PROJECT_ID)
```

### CircleCI

Create `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  deploy:
    docker:
      - image: ubuntu:latest
    steps:
      - checkout
      - run:
          name: Install PostgreSQL client
          command: |
            apt-get update && apt-get install -y postgresql-client
      - run:
          name: Deploy schema
          command: |
            psql "postgresql://postgres:$SUPABASE_DB_PASSWORD@db.$SUPABASE_PROJECT_ID.supabase.co:5432/postgres?sslmode=require" -f supabase/schema.sql

workflows:
  deploy:
    jobs:
      - deploy:
          filters:
            branches:
              only: main
```

---

## 🎓 Advanced: Migration-Based Deployment

For production systems, use numbered migration files instead of one large schema file:

```bash
# Create migrations directory structure
mkdir -p supabase/migrations

# Split schema into migrations
supabase/migrations/
  ├── 20250118000001_initial_tables.sql
  ├── 20250118000002_rls_policies.sql
  ├── 20250118000003_triggers.sql
  └── 20250118000004_indexes.sql
```

**Benefits:**
- Version control of schema changes
- Rollback capability
- Clear audit trail
- Incremental deployments

---

## 📞 Support

### Workflow Issues

Check GitHub Actions logs and search for:
- `❌` - Errors
- `⚠️` - Warnings
- `✅` - Success messages

### Database Issues

Connect manually to verify:

```bash
PGPASSWORD='#DBBuilder01!' psql "postgresql://postgres@db.grglttyirzxfdpbyuxut.supabase.co:5432/postgres?sslmode=require"
```

### Supabase CLI Issues

Check Supabase status:
```bash
curl https://status.supabase.com/api/v2/status.json
```

---

## ✅ Checklist

Before going to production:

- [ ] GitHub secrets configured
- [ ] Workflows enabled
- [ ] Test deployment successful
- [ ] Backup workflow scheduled
- [ ] Schema is idempotent (`IF NOT EXISTS`)
- [ ] RLS policies tested
- [ ] Team members have access to GitHub repo
- [ ] Documentation updated

---

**Last Updated:** 2025-10-18
