# Security Guide

Complete guide to secret detection, prevention, and remediation in this repository.

## Table of Contents

1. [Overview](#overview)
2. [Secret Detection Strategy](#secret-detection-strategy)
3. [What Counts as a Secret](#what-counts-as-a-secret)
4. [Prevention](#prevention)
5. [Detection Tools](#detection-tools)
6. [When Secrets Are Detected](#when-secrets-are-detected)
7. [Removing Secrets from Git History](#removing-secrets-from-git-history)
8. [Best Practices](#best-practices)
9. [Emergency Response](#emergency-response)

## Overview

This repository implements a **dual-layer secret detection strategy** to prevent sensitive information from being committed to version control.

### Why This Matters

Committed secrets can lead to:
- **Security breaches**: Unauthorized access to systems
- **Data leaks**: Exposure of sensitive user data
- **Financial loss**: Compromised payment systems
- **Reputational damage**: Loss of customer trust

**Once committed**, secrets are very difficult to remove completely from Git history.

### Defense in Depth

```
Layer 1 (Pre-commit)  → Gitleaks (Fast scan)
Layer 2 (Pre-push)    → TruffleHog (Deep scan, optional)
Layer 3 (CI/CD)       → Weekly scans + PR scans
```

## Secret Detection Strategy

### Layer 1: Pre-commit (Gitleaks)

**When**: Before every commit
**Tool**: Gitleaks v8
**Speed**: Fast (1-3 seconds)
**Coverage**: Staged files only

Catches common secret patterns:
- API keys
- Passwords
- Private keys
- OAuth tokens
- AWS credentials
- Database connection strings

### Layer 2: Pre-push (TruffleHog - Optional)

**When**: Before pushing to remote (if enabled)
**Tool**: TruffleHog
**Speed**: Slow (1-5 minutes)
**Coverage**: Entire commit history

Provides:
- Entropy analysis (detects high-randomness strings)
- Historical scanning
- Verified secrets (fewer false positives)

**Enable**: Set `DEEP_SCAN_ENABLED=true` in environment

### Layer 3: CI/CD (GitHub Actions)

**When**:
- On every push/PR (Gitleaks)
- Weekly scheduled scan (TruffleHog)

Catches secrets that bypass local hooks.

## What Counts as a Secret

### Definitely Secrets ❌

**API Keys & Tokens**:
```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
API_KEY=sk_live_EXAMPLE_KEY_NOT_REAL_DO_NOT_USE
GITHUB_TOKEN=ghp_EXAMPLE_TOKEN_NOT_REAL_1234567890
```

**Passwords & Credentials**:
```
DB_PASSWORD=MySecretPassword123!
ADMIN_PASSWORD=admin123
MYSQL_ROOT_PASSWORD=rootpass
```

**Private Keys**:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
```

**OAuth Tokens**:
```
SLACK_TOKEN=xoxb-EXAMPLE-NOT-REAL-TOKEN-DO-NOT-USE
GOOGLE_OAUTH=ya29.EXAMPLE_NOT_REAL_TOKEN...
```

**Connection Strings**:
```
mongodb://admin:password@localhost:27017/mydb
postgres://user:pass@localhost:5432/db
redis://default:secret@localhost:6379
```

### Probably Safe ✅

**Public Information**:
```
API_URL=https://api.example.com
PUBLIC_KEY=pk_test_1234567890
PORT=3000
NODE_ENV=development
```

**Test/Mock Values**:
```
TEST_API_KEY=test_key_12345
MOCK_PASSWORD=password
EXAMPLE_TOKEN=example_token_abc123
```

**Placeholders**:
```
API_KEY=<your-api-key-here>
DB_PASSWORD=CHANGEME
SECRET_KEY=replace-with-actual-secret
```

### Gray Area ⚠️

**Low-Entropy Secrets**:
```
PASSWORD=admin
API_KEY=12345
TOKEN=abc
```

These might trigger false positives. Use `.gitleaks.toml` allowlist if legitimate.

## Prevention

### Use Environment Variables

**Never hardcode secrets**:

```typescript
// ❌ BAD
const apiKey = 'sk_live_EXAMPLE_KEY_NOT_REAL_DO_NOT_USE';

// ✅ GOOD
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable is required');
}
```

### Use .env Files

Create `.env` for local development:

```bash
# .env (gitignored)
API_KEY=sk_live_EXAMPLE_KEY_NOT_REAL_DO_NOT_USE
DB_PASSWORD=MySecretPassword123!
JWT_SECRET=your-jwt-secret-here
```

**Important**: `.env` is in `.gitignore` - never commit it!

### Use .env.example Template

Create `.env.example` with placeholders:

```bash
# .env.example (committed to repo)
API_KEY=<your-api-key-here>
DB_PASSWORD=<your-database-password>
JWT_SECRET=<your-jwt-secret>
```

Team members copy this to `.env` and fill in real values.

### Secret Management Services

For production, use dedicated secret management:

**AWS Secrets Manager**:
```typescript
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'prod/api-key' });
```

**HashiCorp Vault**:
```typescript
import Vault from 'node-vault';

const vault = Vault({ endpoint: 'https://vault.example.com' });
const secret = await vault.read('secret/data/api-key');
```

**Azure Key Vault**, **Google Secret Manager**, etc.

## Detection Tools

### Gitleaks Configuration

**File**: `.gitleaks.toml`

Defines patterns for detecting secrets:

```toml
[[rules]]
description = "AWS Access Key"
id = "aws-access-key"
regex = '''(?i)(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}'''
tags = ["aws", "secret", "key"]

[[rules]]
description = "Generic API Key"
id = "generic-api-key"
regex = '''(?i)(api[_-]?key|apikey)['\"]?\s*[:=]\s*['\"]?[0-9a-zA-Z\-_]{20,}['\"]?'''
tags = ["api", "secret", "key"]
```

### Allowlist Configuration

Add false positives to allowlist:

```toml
[allowlist]
regexes = [
  '''test[_-]?key''',      # Test keys
  '''example[_-]?token''', # Example tokens
  '''0{20,}''',            # All zeros
]

files = [
  '''.*\.md$''',           # Markdown files
  '''.*\.test\.ts$''',     # Test files
]

paths = [
  '''tests/fixtures/''',   # Test fixtures
  '''docs/''',             # Documentation
]
```

### Running Scans Manually

#### Quick Scan (Gitleaks)

```bash
# Scan staged files
npm run check:secrets

# Scan entire repo
gitleaks detect --source . --verbose

# Scan specific file
gitleaks detect --source ./path/to/file.ts
```

#### Deep Scan (TruffleHog)

```bash
# Scan entire git history
npm run check:secrets:deep

# Or directly
trufflehog git file://. --since-commit="" --only-verified --json > results.json
```

## When Secrets Are Detected

### Pre-commit Detection

When Gitleaks detects a secret during commit:

```bash
🔐 Scanning for secrets...

❌ Secret detected!

File: src/config/database.ts
Line: 12
Type: Generic Secret
Match: password = "MySecretPassword123!"

Remove the secret and try again.
```

**Action**:

1. **Remove the secret** from code
2. **Add to .env**:
   ```bash
   echo "DB_PASSWORD=MySecretPassword123!" >> .env
   ```
3. **Update code** to use environment variable:
   ```typescript
   const password = process.env.DB_PASSWORD;
   ```
4. **Try committing again**

### False Positives

If the detection is a false positive:

1. **Verify it's actually safe** (not a real secret)
2. **Add to .gitleaks.toml allowlist**:
   ```toml
   [allowlist]
   regexes = [
     '''test_api_key_12345''',  # Specific safe pattern
   ]
   ```
3. **Document why** it's safe (code comment)

### Secrets in Git History

If TruffleHog detects secrets in history:

```bash
❌ Secrets detected in git history!

Review: trufflehog-results.json
```

**This is serious** - the secret has been committed and is in Git history.

See [Removing Secrets from Git History](#removing-secrets-from-git-history).

## Removing Secrets from Git History

### ⚠️ IMPORTANT WARNINGS

- **Destructive operation**: Rewrites Git history
- **Requires team coordination**: All team members must re-clone
- **Breaks existing PRs**: Open PRs will need rebasing
- **Force push required**: Can't be undone

### Step 1: Rotate the Secret

**Before removing from Git**, rotate/invalidate the compromised secret:

- Change password
- Revoke API key
- Generate new token
- Update production systems

**Why**: Even after removal, secret may have been exposed.

### Step 2: Identify Secret Location

```bash
# Find commits containing the secret
git log -S "secret-value" --all

# Find files containing the secret
git grep "secret-value" $(git rev-list --all)
```

### Step 3: Remove Using git-filter-repo

#### Install git-filter-repo

```bash
# macOS
brew install git-filter-repo

# Linux
pip install git-filter-repo

# Windows
pip install git-filter-repo
```

#### Option A: Remove Specific File

```bash
# Remove file from entire history
git filter-repo --path path/to/secret/file.ts --invert-paths

# Example: Remove .env from history
git filter-repo --path .env --invert-paths --force
```

#### Option B: Remove Specific String

```bash
# Replace secret with placeholder
git filter-repo --replace-text <(echo "secret-value==>REMOVED")
```

#### Option C: Use Cleanup Script

```bash
# Interactive script
bash scripts/security/cleanup-secrets.sh
```

### Step 4: Verify Removal

```bash
# Scan again
npm run check:secrets:deep

# Check history
git log --all --full-history --source -- path/to/file
```

### Step 5: Force Push

```bash
# Push rewritten history
git push origin --force --all
git push origin --force --tags
```

### Step 6: Team Coordination

**Notify all team members**:

```
⚠️ Git history has been rewritten to remove secrets.

Action required:
1. Backup any local work
2. Delete local repo
3. Fresh clone: git clone <repo-url>
4. Rebase any open branches
```

**For open branches**:
```bash
git fetch origin
git rebase origin/main
git push --force-with-lease
```

## Best Practices

### Development

1. **Never hardcode secrets** in source code
2. **Use environment variables** for configuration
3. **Add .env to .gitignore** immediately
4. **Use .env.example** as template
5. **Run manual scans** periodically:
   ```bash
   npm run check:secrets
   ```

### Code Review

1. **Review for secrets** in PRs
2. **Check .env changes** carefully
3. **Verify environment variables** are used correctly
4. **Reject commits** with hardcoded secrets

### Testing

1. **Use mock values** in tests:
   ```typescript
   const TEST_API_KEY = 'test_key_12345';
   ```
2. **Use test databases** with non-sensitive credentials
3. **Document test credentials** clearly

### Production

1. **Use secret management services**:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
2. **Rotate secrets regularly** (quarterly minimum)
3. **Use different secrets** per environment (dev/staging/prod)
4. **Implement secret expiration** where possible
5. **Monitor secret access** and alert on anomalies

### CI/CD

1. **Use encrypted secrets** in CI:
   ```yaml
   # GitHub Actions
   - name: Deploy
     env:
       API_KEY: ${{ secrets.API_KEY }}
   ```
2. **Limit secret access** to necessary jobs
3. **Audit secret usage** regularly
4. **Rotate CI secrets** after personnel changes

## Emergency Response

### Secret Exposed in Commit

**Immediate actions** (within 1 hour):

1. ✅ **Rotate/revoke the secret immediately**
2. ✅ **Notify security team**
3. ✅ **Check for unauthorized access**
4. ✅ **Remove from Git history** (see above)
5. ✅ **Document incident** for post-mortem

### Secret Exposed in Production

**Critical actions** (within 15 minutes):

1. 🚨 **Revoke the secret** in production systems
2. 🚨 **Deploy with new secret**
3. 🚨 **Check audit logs** for unauthorized access
4. 🚨 **Alert security team** and stakeholders
5. 🚨 **Initiate incident response** protocol

### Secret Pushed to Public Repository

**Emergency actions** (within 5 minutes):

1. 🔥 **Make repository private** immediately (if possible)
2. 🔥 **Revoke all secrets** in the repository
3. 🔥 **Notify GitHub Support** (for public repos)
4. 🔥 **Scan for unauthorized access**
5. 🔥 **Consider full security audit**

## Tools Reference

### Gitleaks

**Documentation**: https://github.com/gitleaks/gitleaks

**Common Commands**:
```bash
# Detect secrets in current state
gitleaks detect --source . --verbose

# Scan specific commit
gitleaks detect --commit HEAD

# Generate report
gitleaks detect --source . --report-path report.json
```

### TruffleHog

**Documentation**: https://github.com/trufflesecurity/trufflehog

**Common Commands**:
```bash
# Scan entire history
trufflehog git file://. --json > results.json

# Scan since specific commit
trufflehog git file://. --since-commit abc123

# Only verified secrets
trufflehog git file://. --only-verified
```

### git-filter-repo

**Documentation**: https://github.com/newren/git-filter-repo

**Common Commands**:
```bash
# Remove file from history
git filter-repo --path file.txt --invert-paths

# Replace text in history
git filter-repo --replace-text replacements.txt

# Dry run (analyze only)
git filter-repo --analyze
```

## Summary

Secret detection in this repository:

- ✅ **Automated scanning** at every commit
- ✅ **Dual-layer detection** (fast + deep)
- ✅ **CI/CD integration** for additional safety
- ✅ **Clear remediation process** when secrets detected
- ✅ **Team best practices** enforced through hooks

**Remember**: Prevention is easier than remediation. Always use environment variables and secret management services.

For questions or incidents, contact the security team immediately.
