# Security Checklist

This document outlines security measures implemented in the Digital Transformation Planner project and provides guidelines for maintaining security.

**Last Updated**: 2025-10-18

---

## 🔒 Secrets Management

### ✅ Implemented

- [x] **Enhanced .gitignore** with comprehensive secret patterns
- [x] **Environment variables** stored in `.env` files (gitignored)
- [x] **Secret files** (`.secrets.json`) excluded from git
- [x] **GitHub Secrets** configured for CI/CD
- [x] **Template files** (`.env.example`) provided for reference
- [x] **Claude memory** stores credentials separately
- [x] **No secrets in code** - all credentials externalized

### 📋 Protected File Types

The following files are **NEVER** committed to git:

#### Environment Variables
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `.env.staging`
- `*.env` (all variations)

#### Secret Files
- `*.secrets.json`
- `app.secrets.json`
- `credentials.json`
- `service-account*.json`

#### SSH Keys
- `*.key`
- `*.pem`
- `id_rsa*`
- `id_dsa*`
- `.ssh/`

#### Cloud Provider Credentials
- `.aws/`
- `.azure/`
- `.gcloud/`
- `aws-*.json`
- `gcp-*.json`

#### Database Credentials
- `database.yml`
- `database.json`
- `pgpass`
- `.pgpass`

#### Certificates
- `*.p12`
- `*.pfx`
- `*.cer`
- `*.crt`

---

## 🛡️ Current Secrets Inventory

### Supabase Credentials

**Storage Locations**:
1. `app/.env` (gitignored)
2. `app/app.secrets.json` (gitignored)
3. `/home/ted/.claude/CLAUDE.md` (user-level)
4. GitHub Secrets (encrypted)

**Variables**:
- `VITE_SUPABASE_URL` = `https://grglttyirzxfdpbyuxut.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (public/anon key - safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` = (CRITICAL - server-side only)
- `SUPABASE_DB_PASSWORD` = `#DBBuilder01!`

### GitHub Secrets

**Configured**:
- ✅ `SUPABASE_PROJECT_ID`
- ✅ `SUPABASE_DB_PASSWORD`
- ⏳ `SUPABASE_ACCESS_TOKEN` (pending)

**View/Update**:
```bash
gh secret list --repo dbbuilder/digital-transformation
gh secret set SECRET_NAME --body 'value' --repo dbbuilder/digital-transformation
```

---

## 🔍 Verification Procedures

### 1. Check for Leaked Secrets in Git History

```bash
# Check if any secret files were committed
git log --all --full-history --pretty=format:"%H" -- app/.env app/app.secrets.json

# Search for potential secrets in commit history
git log --all --pretty=format: --name-only --diff-filter=A | \
  sort -u | \
  grep -E '\.(env|secret|key|pem|crt)'

# Check current tracked files
git ls-files | grep -E '\.(env|secret|key|pem)'
```

### 2. Verify .gitignore Protection

```bash
# Test if secret files are properly ignored
git check-ignore -v app/.env
git check-ignore -v app/app.secrets.json

# Should show the .gitignore rule that's protecting these files
```

### 3. Scan for Hardcoded Secrets

```bash
# Search for potential hardcoded secrets in source code
cd app/src
grep -r "api[_-]key" .
grep -r "secret" .
grep -r "password" .
grep -r "token" .
grep -r "eyJ" .  # JWT tokens start with eyJ

# These should only appear in type definitions or comments, never as values
```

### 4. Check Environment Variable Usage

```bash
# Verify all env vars use import.meta.env (Vite) or process.env (Node)
cd app/src
grep -r "VITE_" . | grep -v "import.meta.env"

# Should return no results (all should use import.meta.env)
```

---

## 🚨 Incident Response

### If Secrets Are Accidentally Committed

1. **Immediately rotate all compromised credentials**:
   - Supabase: Reset database password
   - Supabase: Regenerate service role key
   - GitHub: Regenerate access token

2. **Remove from git history**:
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo

   # Install BFG
   wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

   # Remove secrets file from history
   java -jar bfg-1.14.0.jar --delete-files app.secrets.json

   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive

   # Force push
   git push origin --force --all
   ```

3. **Verify removal**:
   ```bash
   git log --all --full-history --pretty=format:"%H" -- app/app.secrets.json
   # Should return nothing
   ```

4. **Update all secret storage locations** with new credentials

5. **Document incident** in security log

---

## 🔐 Best Practices

### Development

1. **Never hardcode secrets** - always use environment variables
   ```typescript
   // ❌ BAD
   const apiKey = "sk-1234567890abcdef"

   // ✅ GOOD
   const apiKey = import.meta.env.VITE_API_KEY
   ```

2. **Use type-safe env vars**:
   ```typescript
   // src/env.ts
   export const env = {
     supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
     supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
   } as const
   ```

3. **Validate env vars at startup**:
   ```typescript
   // src/config.ts
   function validateEnv() {
     const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
     const missing = required.filter(key => !import.meta.env[key])
     if (missing.length > 0) {
       throw new Error(`Missing required env vars: ${missing.join(', ')}`)
     }
   }
   ```

4. **Never log secrets**:
   ```typescript
   // ❌ BAD
   console.log('Connecting with key:', apiKey)

   // ✅ GOOD
   console.log('Connecting to Supabase...')
   ```

### Deployment

1. **Use platform-specific secret management**:
   - Vercel: Environment Variables UI
   - Netlify: Environment Variables UI
   - GitHub Actions: Encrypted secrets

2. **Rotate secrets regularly**:
   - Database passwords: Every 90 days
   - API keys: Every 180 days
   - Service role keys: On team member departure

3. **Use different credentials per environment**:
   - Development: Local `.env`
   - Staging: Platform env vars
   - Production: Platform env vars (different from staging)

4. **Limit secret access**:
   - Grant least privilege
   - Use read-only keys when possible
   - Audit access regularly

### Code Review

1. **Check every PR** for potential secret leaks:
   ```bash
   # Add to PR checklist
   - [ ] No hardcoded secrets
   - [ ] All env vars use import.meta.env
   - [ ] No API keys in code
   - [ ] No .env files in changeset
   ```

2. **Use GitHub secret scanning**:
   - Enabled by default for public repos
   - Alerts on detected secrets
   - Check Settings → Security → Secret scanning

---

## 📚 Reference Documents

### `.gitignore` Coverage

Our `.gitignore` protects against:

1. **All environment file variations**:
   - `.env`, `.env.local`, `.env.*`
   - Explicitly allows `.env.example` (template)

2. **All secret file patterns**:
   - `*.secrets.json`, `*.secret.json`
   - `secrets/`, `.secrets/`

3. **All key/certificate files**:
   - `*.key`, `*.pem`, `*.p12`, `*.pfx`
   - `id_rsa*`, `id_dsa*`, `id_ecdsa*`

4. **Cloud provider credentials**:
   - `.aws/`, `.azure/`, `.gcloud/`
   - `service-account*.json`

5. **Database credentials**:
   - `database.yml`, `pgpass`
   - `*.sql.gz`, `*.dump`

### Environment Variable Files

**Public (Can be committed)**:
- `.env.example` - Template with placeholder values
- `.env.sample` - Alternative template name
- `.env.template` - Another template variant

**Private (NEVER commit)**:
- `.env` - Local development secrets
- `.env.local` - Local overrides
- `.env.production` - Production secrets
- `.env.staging` - Staging secrets

### Secret Storage Hierarchy

1. **Development**: `app/.env` (local only)
2. **CI/CD**: GitHub Secrets
3. **Staging**: Vercel/Netlify Environment Variables
4. **Production**: Vercel/Netlify Environment Variables
5. **Backup**: `/home/ted/.claude/CLAUDE.md` (user-level)
6. **Archive**: `app/app.secrets.json` (local only)

---

## ✅ Security Audit Checklist

Before each release:

### Git Repository
- [ ] No `.env` files in git history
- [ ] No `*.secrets.json` files in git
- [ ] No API keys in source code
- [ ] No database passwords in code
- [ ] `.gitignore` up to date

### Environment Variables
- [ ] All required vars documented in `.env.example`
- [ ] All vars validated at startup
- [ ] Production vars different from staging
- [ ] No secrets in client-side code

### GitHub Configuration
- [ ] All required secrets configured
- [ ] Branch protection enabled on main
- [ ] Secret scanning enabled
- [ ] No admin tokens with write access

### Deployment Platforms
- [ ] Environment variables set correctly
- [ ] Build logs don't expose secrets
- [ ] Secrets not in build artifacts
- [ ] HTTPS enforced

### Access Control
- [ ] Database: Row-Level Security enabled
- [ ] API: Rate limiting configured
- [ ] Authentication: Strong password policy
- [ ] Service accounts: Least privilege

---

## 🔗 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)

---

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. **DO NOT** commit any proof-of-concept code
3. **DO** email security concerns to: (add email when project goes live)
4. **DO** include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested remediation

We will respond within 48 hours.

---

**Remember**: Security is everyone's responsibility. When in doubt, ask!
