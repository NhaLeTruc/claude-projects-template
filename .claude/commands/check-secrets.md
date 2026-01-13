# Command: /check-secrets

Run comprehensive secret scan (Gitleaks + TruffleHog)

## Description

This command performs a comprehensive scan for secrets in the codebase using both Gitleaks (fast scan) and TruffleHog (deep historical scan).

## Usage

```
/check-secrets
```

## What This Command Does

Runs two-layer secret detection:

1. **Fast Scan (Gitleaks)**: Scans current state for common secret patterns
2. **Deep Scan (TruffleHog)**: Scans entire Git history with entropy analysis

## Step-by-Step Execution

### Step 1: Fast Scan with Gitleaks

First, run a fast scan of the current repository state:

```bash
npm run check:secrets
```

This scans for:
- AWS access keys and secret keys
- GitHub tokens (PAT, OAuth, App tokens)
- API keys (generic patterns)
- Passwords and generic secrets
- Private keys (RSA, DSA, EC, etc.)
- Slack tokens and webhooks
- Google API keys
- Heroku API keys
- Stripe API keys
- Twilio API keys
- And many more...

### Step 2: Deep Scan with TruffleHog

Run a comprehensive historical scan:

```bash
npm run check:secrets:deep
```

This scans:
- **Entire Git history**: All commits, all branches
- **Entropy analysis**: Detects high-randomness strings
- **Verified secrets**: Reduces false positives
- **Deleted files**: Even files removed from current state

⚠️ **Note**: This can take 1-5 minutes depending on repository size.

## Example Output

### No Secrets Found ✅

```
🔐 Fast scan (Gitleaks)...
✓ Scanned 245 files
✓ No secrets detected

🔍 Deep scan (TruffleHog)...
✓ Scanned 1,234 commits
✓ No secrets detected in history

✅ All secret scans passed!
```

### Secrets Found ❌

```
🔐 Fast scan (Gitleaks)...
❌ Secret detected!

File: src/config/database.ts
Line: 12
Type: Generic Secret
Pattern: DB_PASSWORD = "MySecretPassword123!"

File: src/api/client.ts
Line: 45
Type: AWS Access Key
Pattern: AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"

🔍 Deep scan (TruffleHog)...
❌ Secrets detected in git history!

Commit: abc123def (2024-12-15)
File: .env
Type: Private Key
Pattern: -----BEGIN RSA PRIVATE KEY-----

Review: trufflehog-results.json
```

## Understanding Results

### Gitleaks Output

**True Positive** (real secret):
```
File: src/config.ts
Line: 15
Type: AWS Access Key
Match: AKIAIOSFODNN7EXAMPLE

Action: Remove and rotate the key
```

**False Positive** (not a secret):
```
File: tests/fixtures/sample.ts
Line: 8
Type: Generic API Key
Match: test_api_key_12345

Action: Add to allowlist
```

### TruffleHog Output

Results saved to `trufflehog-results.json`:

```json
{
  "SourceMetadata": {
    "Commit": "abc123def456",
    "File": "src/config/database.ts",
    "Line": 12
  },
  "DetectorType": "AWS",
  "Verified": true,
  "Raw": "AKIAIOSFODNN7EXAMPLE"
}
```

## When Secrets Are Detected

### Step 1: Verify It's a Real Secret

Check if it's actually a secret or a false positive:

```bash
# View the file
cat path/to/file

# Check git history
git log -p -- path/to/file
```

### Step 2: Remove from Current State

If it's in current code:

```typescript
// ❌ Before: Hardcoded secret
const apiKey = 'sk_live_EXAMPLE_KEY_NOT_REAL_DO_NOT_USE';

// ✅ After: Use environment variable
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable is required');
}
```

Add to `.env` (gitignored):
```bash
echo "API_KEY=sk_live_EXAMPLE_KEY_NOT_REAL_DO_NOT_USE" >> .env
```

### Step 3: Rotate/Invalidate the Secret

**CRITICAL**: Even after removing from code, the secret is compromised:

- **AWS Keys**: Revoke in AWS Console → IAM → Access Keys
- **GitHub Tokens**: Revoke in GitHub → Settings → Developer settings → Personal access tokens
- **API Keys**: Regenerate in the service's dashboard
- **Passwords**: Change immediately
- **Database Credentials**: Update and rotate

### Step 4: Remove from Git History

If the secret is in Git history, it must be removed:

```bash
# Use automated cleanup script
bash scripts/security/cleanup-secrets.sh
```

Or manually with git-filter-repo:

```bash
# Remove specific file from history
git filter-repo --path path/to/secret/file --invert-paths --force

# Or replace specific string
git filter-repo --replace-text <(echo "secret-value==>REMOVED")
```

⚠️ **WARNING**: This rewrites Git history. Coordinate with team!

### Step 5: Verify Removal

Run scans again to confirm:

```bash
npm run check:secrets
npm run check:secrets:deep
```

## Handling False Positives

If Gitleaks flags something that's not a secret:

### Option 1: Add to Allowlist

Edit `.gitleaks.toml`:

```toml
[allowlist]
# Specific patterns
regexes = [
  '''test_api_key_12345''',     # Test key in fixtures
  '''example_token_abc''',       # Example in documentation
]

# Specific files
files = [
  '''.*\.md$''',                 # All markdown files
  '''.*\.test\.ts$''',           # All test files
]

# Specific paths
paths = [
  '''tests/fixtures/''',         # Test fixture directory
  '''docs/examples/''',          # Documentation examples
]
```

### Option 2: Document in Code

Add a comment explaining why it's safe:

```typescript
// This is a test API key used in fixtures, not a real secret
const TEST_API_KEY = 'test_key_12345'; // gitleaks:allow
```

## Scan Configuration

### Gitleaks Configuration

Customize patterns in `.gitleaks.toml`:

```toml
# Add custom pattern
[[rules]]
description = "Custom API Key Pattern"
id = "custom-api-key"
regex = '''my_company_api_[0-9a-zA-Z]{32}'''
tags = ["api", "custom"]
```

### TruffleHog Configuration

Customize in `.trufflehog.yaml`:

```yaml
# Only verified secrets (fewer false positives)
only-verified: true

# Exclude patterns
exclude:
  - path: "tests/fixtures/"
  - path: ".*\\.md$"
```

## Scan Specific Files

### Scan Single File

```bash
# Gitleaks
gitleaks detect --source ./path/to/file.ts --verbose

# TruffleHog
trufflehog filesystem ./path/to/file.ts
```

### Scan Specific Commit

```bash
# Gitleaks
gitleaks detect --log-opts="--commit-hash abc123"

# TruffleHog
trufflehog git file://. --since-commit abc123 --max-depth 1
```

### Scan Specific Branch

```bash
# TruffleHog
trufflehog git file://. --branch feature/my-branch
```

## CI/CD Integration

These scans also run in CI/CD:

### On Every Push (Fast Scan)

GitHub Actions runs Gitleaks on every push:
```yaml
- name: Scan for secrets
  run: npm run check:secrets
```

### Weekly Deep Scan

TruffleHog runs weekly:
```yaml
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM
```

## Prevention Best Practices

### 1. Use Environment Variables

```typescript
// ✅ Good
const config = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD,
};
```

### 2. Use .env Files

```bash
# .env (gitignored)
API_KEY=your-key-here
DB_PASSWORD=your-password-here
```

### 3. Use Secret Management Services

```typescript
// AWS Secrets Manager
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
const secret = await secretsManager.getSecretValue({ SecretId: 'prod/api-key' });

// HashiCorp Vault
import Vault from 'node-vault';
const secret = await vault.read('secret/data/api-key');
```

### 4. Never Commit .env Files

Ensure `.env` is in `.gitignore`:
```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 5. Use .env.example Templates

```bash
# .env.example (safe to commit)
API_KEY=<your-api-key-here>
DB_PASSWORD=<your-database-password>
```

## Emergency Response

If secrets are exposed:

### 1. Immediate Actions (< 5 minutes)

- 🔥 Revoke the secret in the service
- 🔥 Generate new secret
- 🔥 Update production systems
- 🔥 Check audit logs for unauthorized access

### 2. Short-term Actions (< 1 hour)

- ⚠️ Remove from codebase
- ⚠️ Remove from Git history
- ⚠️ Notify security team
- ⚠️ Document incident

### 3. Long-term Actions

- 📋 Post-mortem analysis
- 📋 Update security practices
- 📋 Team training
- 📋 Implement additional safeguards

## Troubleshooting

### Gitleaks Not Found

Install Gitleaks:
```bash
# macOS
brew install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Windows
choco install gitleaks
```

### TruffleHog Not Found

Install TruffleHog:
```bash
# Using installer script
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin

# Or with pip
pip install truffleHog
```

### Scan Takes Too Long

For large repositories:
```bash
# Scan only recent commits
trufflehog git file://. --since-commit HEAD~100

# Skip verification (faster but more false positives)
trufflehog git file://. --no-verification
```

## Related Commands

- `/run-checks` - Run all quality checks including secret scan
- `/commit-push-pr` - Complete workflow with secret scanning
- `/fix-violations` - Auto-fix code issues

## Summary

Use `/check-secrets` to:
- ✅ Detect exposed secrets in code
- ✅ Scan entire Git history
- ✅ Prevent security breaches
- ✅ Maintain security compliance

**Remember**: Prevention is easier than remediation. Always use environment variables!
