# 🚨 SECURITY INCIDENT - Database Credentials Exposed

**Date:** April 15, 2026  
**Severity:** CRITICAL  
**Status:** MITIGATED (credentials removed from files)

## What Happened

Supabase database credentials (connection string with password) were accidentally committed to the Git repository in the following files:
- `/docs/CARTO-SUPABASE-DEPLOYMENT.md`
- `/projects/4-CartographicProjectManager/backend/.env.render.example`

The credentials were detected by GitGuardian security monitoring.

## Exposure Details

**Exposed Information:**
- Database connection string with password
- Supabase project reference ID
- Database host/region information

**Commit:** 863689a (approximately)  
**Files Affected:** 2  
**Duration:** ~5-10 minutes

## Actions Taken

✅ **1. Credentials Removed (Completed)**
- Replaced real credentials with placeholders in all documentation
- Anonymized project ID and region information
- Verified no other files contain exposed secrets

✅ **2. Files Cleaned**
- `CARTO-SUPABASE-DEPLOYMENT.md` - placeholders added
- `.env.render.example` - anonymized
- `CHANGES.md` - sanitized

## ⚠️ REQUIRED ACTIONS (DO THIS NOW!)

### 1. **Reset Supabase Database Password** (CRITICAL)

Go to Supabase Dashboard and reset the database password immediately:

1. Open: https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/database
2. Click "Reset database password"
3. Generate a new strong password
4. Copy the new connection string

### 2. **Update Render Environment Variables**

After resetting the password, update Render with the new DATABASE_URL:

1. Go to: https://dashboard.render.com
2. Find service: `carto-backend` (or `carto-backend-gl8l`)
3. Environment → Edit `DATABASE_URL`
4. Paste new connection string with new password
5. Save changes

### 3. **Rewrite Git History** (Optional but Recommended)

Since the credentials are in Git history, consider using BFG Repo-Cleaner or `git filter-repo` to remove them from all commits:

**WARNING:** This rewrites history and requires force push! Coordinate with all collaborators first.

```bash
# Option 1: BFG Repo-Cleaner (recommended)
java -jar bfg.jar --replace-text passwords.txt TFG-Fabian-Gonzalez-Lence.git
cd TFG-Fabian-Gonzalez-Lence
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all

# Option 2: Git Filter-Repo
git filter-repo --replace-text <(echo 'G4A1Iq28C9IBc4==>***REMOVED***')
git push origin --force --all
```

### 4. **Monitor for Unauthorized Access**

Check Supabase dashboard for any suspicious:
- Database queries
- Connection attempts
- Data modifications
- New users created

## Prevention Measures

**✅ Implemented:**
1. All documentation now uses placeholders ([PROJECT_REF], [YOUR_DB_PASSWORD])
2. `.env` files are in `.gitignore`
3. Examples use anonymized templates

**📋 Recommended:**
1. Enable pre-commit hooks to scan for secrets (e.g., `git-secrets`, `trufflehog`)
2. Use GitHub secret scanning (enable in repo settings)
3. Rotate all API keys and secrets every 90 days
4. Use environment-specific secrets management (Render's encrypted variables)

## Status

- [x] Credentials removed from tracked files
- [ ] **Database password reset** ← **DO THIS NOW!**
- [ ] Render environment variables updated
- [ ] Git history cleaned (optional)
- [ ] Incident reviewed and logged

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**Next Step:** Reset your Supabase database password immediately before deploying to Render.
