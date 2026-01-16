# Git Hooks Documentation

Complete guide to the Git hooks configured in this repository.

## Table of Contents

1. [Overview](#overview)
2. [Hook Workflow](#hook-workflow)
3. [Pre-commit Hook](#pre-commit-hook)
4. [Prepare-commit-msg Hook](#prepare-commit-msg-hook)
5. [Commit-msg Hook](#commit-msg-hook)
6. [Pre-push Hook](#pre-push-hook)
7. [Bypassing Hooks](#bypassing-hooks)
8. [Troubleshooting](#troubleshooting)

## Overview

This repository uses [Husky v9](https://typicode.github.io/husky/) to manage Git hooks that enforce code quality and consistency. The hooks run automatically at different stages of the Git workflow.

### Why Git Hooks?

Git hooks provide automated quality gates that:
- **Prevent bad code** from entering the repository
- **Catch issues early** before code review
- **Enforce consistency** across team members
- **Save time** by automating repetitive checks
- **Improve code quality** without manual intervention

### Hook Architecture

```
Git Workflow Stage → Hook → Checks → Pass/Fail → Continue/Block
```

## Hook Workflow

### Complete Commit Flow

```
1. Developer makes code changes
2. git add <files>
3. git commit
   ↓
4. PRE-COMMIT HOOK runs
   - Language detection
   - Linting (ESLint/pylint/Checkstyle)
   - Unit tests
   - File size check
   - Documentation location check
   - Secret scanning
   - Format checking
   ↓ (if all pass)
5. PREPARE-COMMIT-MSG HOOK runs
   - Launches Commitizen
   - Interactive commit message prompt
   ↓
6. Developer enters commit details
   ↓
7. COMMIT-MSG HOOK runs
   - Validates commit message format
   - Ensures Conventional Commits compliance
   ↓ (if valid)
8. Commit created successfully
   ↓
9. git push
   ↓
10. PRE-PUSH HOOK runs
    - Circular dependency check
    - Full test coverage
    - Build verification
    - Optional deep secret scan
    ↓ (if all pass)
11. Push succeeds
```

## Pre-commit Hook

**Location**: `.husky/pre-commit`

**When**: Runs before commit is created

**Purpose**: Validate code quality and prevent common issues

### Checks Performed

#### 1. Language Detection
Automatically detects languages in the project (TypeScript, Python, Java, etc.) to run appropriate checks.

```bash
🌐 Detecting project languages...
```

#### 2. Code Linting
Runs language-specific linters to enforce code style and catch errors.

**TypeScript/JavaScript**:
```bash
npm run lint
# Uses ESLint with plugins:
# - @typescript-eslint (TypeScript rules)
# - sonarjs (Code quality, SOLID principles)
# - import (Import organization, circular dependencies)
```

**Python**:
```bash
npm run lint:python
# Uses pylint with configured rules
```

**Java**:
```bash
npm run lint:java
# Uses Checkstyle with Sun conventions
```

#### 3. Unit Tests
Runs fast unit tests to catch regressions.

```bash
npm run test        # Jest (TypeScript)
npm run test:python # pytest (Python)
npm run test:java   # JUnit (Java)
```

#### 4. File Size Check
Ensures files don't exceed 500 lines (enforces Single Responsibility Principle).

```bash
node scripts/hooks/check-file-size.js
```

**Exceptions**: Add patterns to `.filesize-exceptions`

#### 5. Documentation Location Check
Ensures all `.md` and `.pdf` files are in `docs/` directory.

```bash
node scripts/hooks/check-documentation.js
```

**Allowed root files**:
- README.md
- LICENSE / LICENSE.md
- CHANGELOG.md
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md

#### 6. Secret Scanning
Scans staged files for potential secrets (API keys, passwords, tokens).

```bash
npm run check:secrets
# Uses Gitleaks with custom patterns
```

#### 7. Format Checking
Verifies code is properly formatted.

```bash
npm run format:check  # Prettier (TypeScript)
black --check .       # Black (Python)
```

### Execution Time

Typical pre-commit hook execution: **5-15 seconds**

- Language detection: < 1s
- Linting: 2-5s
- Unit tests: 3-10s
- File checks: < 1s
- Secret scanning: 1-3s

### Example Output

```bash
🔍 Running pre-commit checks...

🌐 Detecting project languages...

📝 Linting code...
✓ ESLint passed (0 errors, 0 warnings)

🧪 Running tests...
✓ 45 tests passed in 3.2s

📏 Checking file sizes...
✓ All files within size limits

📚 Checking documentation location...
✓ All documentation correctly placed

🔐 Scanning for secrets...
✓ No secrets detected

💅 Checking code formatting...
✓ All files properly formatted

✅ All pre-commit checks passed!
```

### When Checks Fail

```bash
❌ Pre-commit checks failed!

📝 Linting errors found:
  src/services/user.service.ts:23:5
    Error: Missing return type annotation

Fix errors above or use --no-verify to skip (not recommended)
```

**Action**: Fix the errors and try committing again.

## Prepare-commit-msg Hook

**Location**: `.husky/prepare-commit-msg`

**When**: After pre-commit passes, before commit message is entered

**Purpose**: Launch Commitizen for interactive commit message creation

### Commitizen Flow

Commitizen guides you through creating a properly formatted commit message:

```
? Select the type of change you are committing:
  feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Formatting changes
❯ refactor: Code change that neither fixes a bug nor adds a feature
  test:     Adding or updating tests
  chore:    Maintenance tasks

? What is the scope of this change (component/feature)?
❯ api

? Write a short, imperative tense description of the change:
❯ Add user authentication endpoint

? Provide a longer description of the change (optional):
❯ Implemented JWT-based authentication with refresh tokens

? Are there any breaking changes?
❯ No

? Add issue references (e.g., "fix #123", "re #456"):
❯ re #42
```

### Resulting Commit Message

```
refactor(api): Add user authentication endpoint

Implemented JWT-based authentication with refresh tokens

re #42

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Benefits

- **Consistent format**: All commits follow Conventional Commits
- **Clear history**: Easy to understand what each commit does
- **Automated changelogs**: Tools can generate changelogs from commits
- **Semantic versioning**: Auto-determine version bumps

## Commit-msg Hook

**Location**: `.husky/commit-msg`

**When**: After commit message is entered, before commit is created

**Purpose**: Validate commit message format

### Validation Rules

Enforced by commitlint with Conventional Commits standard:

1. **Format**: `type(scope): subject`
2. **Type**: Must be one of:
   - feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
3. **Scope**: Must be one of:
   - core, cli, api, ui, db, auth, tests, docs, deps, config, hooks, ci, security
4. **Subject**:
   - Sentence case
   - Max 100 characters
   - No period at end
5. **Body**: Max 100 characters per line
6. **Footer**: Max 100 characters per line

### Valid Examples

```bash
✅ feat(api): Add user registration endpoint
✅ fix(core): Resolve memory leak in data loader
✅ docs(setup): Update installation instructions
✅ refactor(db): Extract connection pool to separate module
```

### Invalid Examples

```bash
❌ Added stuff
   → Missing type and scope

❌ FEAT(API): ADD USER ENDPOINT
   → Wrong case (should be sentence case)

❌ fix(invalid-scope): Fix bug
   → Invalid scope

❌ feat: this subject is way too long and exceeds the maximum character limit that is enforced by commitlint
   → Subject too long (> 100 chars)
```

### Bypass Warning

If you try to bypass with `--no-verify`, the hook won't run and you might commit a non-compliant message. This will cause issues with:
- Changelog generation
- Semantic versioning
- Git history clarity

## Pre-push Hook

**Location**: `.husky/pre-push`

**When**: Before code is pushed to remote

**Purpose**: Run comprehensive checks before sharing code

### Checks Performed

#### 1. Dependency Health Checks
Runs comprehensive dependency analysis to ensure codebase health.

**TypeScript**: Uses Madge for circular dependency detection
```bash
npm run check:deps
```

**Python**: Uses two complementary tools:

1. **Circular dependencies** (pydeps):
```bash
npm run check:deps:python
```

2. **Full dependency health** (deptry):
```bash
npm run check:deps:python:full
```
Checks for:
- Missing dependencies (DEP001)
- Unused dependencies (DEP002)
- Transitive dependencies (DEP003)
- Misplaced dev dependencies (DEP004)

**Why**:
- Circular dependencies create tight coupling
- Unused dependencies bloat installation size and attack surface
- Missing dependencies cause runtime errors
- Transitive dependencies should be explicitly declared

**Example output**:
```bash
✓ No circular dependencies found (pydeps)
✓ No dependency issues found (deptry)
```

or

```bash
❌ Circular dependency detected:
  src/services/user.service.ts → src/repositories/user.repository.ts → src/services/user.service.ts

❌ Dependency issues found:
  DEP002: 'requests' defined as a dependency but not used
  DEP001: 'click' imported but not defined in dependencies
```

#### 2. Full Test Coverage
Runs all tests with coverage reporting (80% minimum).

```bash
npm run test:coverage
```

**Coverage thresholds**:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

#### 3. Build Verification
Ensures the project builds successfully.

```bash
npm run build        # TypeScript compilation
npm run build:python # Python build (if applicable)
npm run build:java   # Maven build (if applicable)
```

#### 4. Deep Secret Scan (Optional)
If `DEEP_SCAN_ENABLED=true` is set, runs TruffleHog for deep historical secret scanning.

```bash
npm run check:secrets:deep
```

**Note**: This is slow (1-5 minutes) and disabled by default.

### Execution Time

Typical pre-push hook execution: **30-60 seconds**

- Circular dependency check: 2-5s
- Full test suite: 20-40s
- Build: 5-15s
- Deep scan (if enabled): 60-300s

### Example Output

```bash
🚀 Running pre-push checks...

🔄 Checking for circular dependencies...
✓ No circular dependencies found

📊 Running tests with coverage...
✓ 45/45 tests passed
✓ Coverage: 87.5% (threshold: 80%)

🏗️  Building project...
✓ Build succeeded

✅ All pre-push checks passed!
```

## Bypassing Hooks

### When to Bypass

Hooks should **ONLY** be bypassed in these situations:
1. **Emergencies**: Critical hotfix needed immediately
2. **Work in Progress**: Committing incomplete work to save progress
3. **Hook Bugs**: When a hook itself has a bug

### How to Bypass

```bash
# Bypass pre-commit and commit-msg hooks
git commit --no-verify

# Bypass pre-push hook
git push --no-verify
```

### Important Warnings

⚠️ **Never bypass hooks for routine commits**
⚠️ **Always fix violations as soon as possible**
⚠️ **Create follow-up issue to fix violations**
⚠️ **Get user approval before bypassing**

### Bypass Policy

When bypassing hooks:

1. **Ask user permission** first
2. **Document reason** in commit message
3. **Create follow-up issue** to fix violations
4. **Fix violations** in next commit

**Example**:
```bash
git commit --no-verify -m "fix(critical): Emergency hotfix for production issue

Bypassed hooks due to production outage.
Follow-up issue: #123
```

## Troubleshooting

### Hook Not Running

**Symptoms**: Commit succeeds without any checks

**Solution**:
```bash
# Reinstall Husky
npm run prepare

# Make hooks executable (Linux/macOS)
chmod +x .husky/*

# Verify hooks exist
ls -la .husky/
```

### Hook Fails on Fresh Checkout

**Symptoms**: Hooks fail immediately after cloning

**Solution**:
```bash
# Install dependencies first
npm install

# Initialize hooks
npm run prepare

# Try again
git commit
```

### Commitizen Not Launching

**Symptoms**: Hook runs but Commitizen prompt doesn't appear

**Solution**:
```bash
# Run commit command explicitly
npm run commit

# Or check if terminal is interactive
# Some CI environments don't support interactive prompts
```

### Slow Pre-commit Hook

**Symptoms**: Pre-commit takes > 30 seconds

**Solution**:

1. **Check test suite**:
   ```bash
   npm run test -- --verbose
   ```
   Identify slow tests and optimize

2. **Use test filters** (modify hook):
   ```bash
   npm run test -- --onlyChanged
   ```

3. **Skip secret scan** temporarily:
   Comment out in `.husky/pre-commit` (with team agreement)

### False Positive Secret Detection

**Symptoms**: Gitleaks flags non-secret as secret

**Solution**:

Add to `.gitleaks.toml` allowlist:
```toml
[allowlist]
regexes = [
  '''test_api_key_12345''',  # Specific test key
]
```

### File Size Violation

**Symptoms**: Hook blocks commit due to large file

**Solution**:

Option 1: **Refactor file** (preferred)
```bash
# Break down large file into smaller modules
```

Option 2: **Add exception** (temporary)
```bash
# Add to .filesize-exceptions
src/legacy/large-file.ts
```

### Circular Dependency Detected

**Symptoms**: Pre-push hook fails with circular dependency error

**Solution**:

1. **View dependency graph**:
   ```bash
   npx madge --image graph.svg --circular src/
   open graph.svg
   ```

2. **Refactor code**:
   - Extract shared code to new module
   - Use dependency injection
   - Invert dependencies

See [.claude/architecture_decisions.md](../.claude/architecture_decisions.md) for patterns.

### Python Dependency Issues

**Symptoms**: Pre-push hook fails with deptry errors

**Solution**:

1. **View detailed report**:
   ```bash
   deptry . --config .config/python/pyproject.toml
   ```

2. **For unused dependencies (DEP002)**:
   ```bash
   pip uninstall package-name
   # Remove from requirements.txt or pyproject.toml
   ```

3. **For missing dependencies (DEP001)**:
   ```bash
   pip install package-name
   echo "package-name>=1.0.0" >> requirements.txt
   ```

4. **For false positives**, edit `.config/python/pyproject.toml`:
   ```toml
   [tool.deptry]
   ignore_obsolete = ["package-name"]  # For DEP002
   ignore_missing = ["package-name"]   # For DEP001
   ```

5. **Visualize dependencies**:
   ```bash
   npm run check:deps:python:graph
   open dependency-graph-python.svg
   ```

## Hook Modification

### Disabling Specific Checks

To disable a check (requires team agreement):

Edit `.husky/pre-commit`:
```bash
# Comment out the check
# echo "🔐 Scanning for secrets..."
# npm run check:secrets || FAILED=1
```

### Adding Custom Checks

To add new checks:

1. Create script in `scripts/hooks/`
2. Add to appropriate hook file
3. Update documentation
4. Test thoroughly

**Example**:
```bash
# In .husky/pre-commit

echo "🔍 Running custom check..."
node scripts/hooks/my-custom-check.js || FAILED=1
```

## Best Practices

1. **Run checks locally** before committing:
   ```bash
   npm run check:all
   ```

2. **Fix issues incrementally** rather than bypassing

3. **Keep hooks fast** (< 30s for pre-commit)

4. **Document bypasses** with clear reasons

5. **Review hook logs** to understand failures

## Summary

Git hooks in this repository ensure:
- ✅ Code quality through automated linting
- ✅ Test coverage through automated testing
- ✅ Security through secret scanning
- ✅ Consistency through format checking
- ✅ Architecture through circular dependency prevention
- ✅ Documentation through conventional commits

Follow hook guidelines to maintain high code quality and smooth collaboration.

For questions or issues, refer to [SETUP.md](./SETUP.md) or contact the team lead.
