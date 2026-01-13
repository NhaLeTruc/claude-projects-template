# Command: /run-checks

Run all pre-commit checks manually without committing

## Description

This command runs all quality gates that would normally run during pre-commit, allowing you to verify your changes before attempting to commit.

## Usage

```
/run-checks
```

## What This Command Does

Runs the following checks in sequence:
1. **Language Detection**: Detects languages in the project
2. **Linting**: Runs ESLint, pylint, or Checkstyle based on detected languages
3. **Format Checking**: Verifies code is properly formatted
4. **Unit Tests**: Runs fast unit tests
5. **File Size Check**: Ensures no files exceed 500 lines
6. **Documentation Check**: Verifies all docs are in `docs/` directory
7. **Secret Scanning**: Scans for potential secrets
8. **Circular Dependencies**: Checks for circular dependencies (optional)

## Step-by-Step Execution

Let me run all quality checks:

```bash
npm run check:all
```

This runs:

### 1. Language Detection
```bash
npm run check:languages
```

Detects which languages are used in the project (TypeScript, Python, Java, etc.) to run appropriate checks.

### 2. Linting
```bash
# TypeScript/JavaScript
npm run lint

# Python (if detected)
npm run lint:python

# Java (if detected)
npm run lint:java
```

### 3. Format Checking
```bash
# TypeScript/JavaScript
npm run format:check

# Python (if detected)
black --check .
```

### 4. Unit Tests
```bash
# TypeScript/JavaScript
npm run test

# Python (if detected)
npm run test:python

# Java (if detected)
npm run test:java
```

### 5. File Size Check
```bash
npm run check:file-size
```

Ensures all source files are under 500 lines (enforces Single Responsibility Principle).

### 6. Documentation Check
```bash
npm run check:docs
```

Ensures all `.md` and `.pdf` files are in the `docs/` directory (except allowed root files).

### 7. Secret Scanning
```bash
npm run check:secrets
```

Scans for potential secrets (API keys, passwords, tokens) using Gitleaks.

### 8. Circular Dependencies
```bash
npm run check:deps
```

Checks for circular dependencies using Madge.

## Example Output

### All Checks Pass

```
🌐 Detecting project languages...
✓ Languages: typescript, python

📝 Linting code...
✓ ESLint: 0 errors, 0 warnings
✓ pylint: Your code has been rated at 10.00/10

💅 Checking code formatting...
✓ All files properly formatted

🧪 Running tests...
✓ 45 tests passed in 3.2s
✓ 23 tests passed in 1.8s

📏 Checking file sizes...
✓ All files within size limits

📚 Checking documentation location...
✓ All documentation correctly placed

🔐 Scanning for secrets...
✓ No secrets detected

🔄 Checking circular dependencies...
✓ No circular dependencies found

✅ All checks passed!
```

### Some Checks Fail

```
📝 Linting code...
❌ ESLint found 3 errors:

  src/services/user.service.ts:23:5
    Error: Missing return type annotation
    @typescript-eslint/explicit-function-return-type

  src/utils/validator.ts:45:12
    Error: Unexpected any type
    @typescript-eslint/no-explicit-any

  src/api/routes.ts:89:20
    Error: Circular dependency detected
    import/no-cycle

Fix these errors and run checks again.
```

## Individual Checks

You can also run checks individually:

```bash
# Run only linting
npm run lint

# Run only tests
npm run test

# Run only secret scanning
npm run check:secrets

# Run only file size check
npm run check:file-size

# Run only documentation check
npm run check:docs

# Run only circular dependency check
npm run check:deps
```

## Troubleshooting

### Linting Errors

Auto-fix most linting errors:
```bash
npm run lint:fix
```

### Format Errors

Auto-fix formatting:
```bash
npm run format
```

### Test Failures

Run tests with verbose output:
```bash
npm run test -- --verbose
```

### Secret Detection False Positives

Add to `.gitleaks.toml` allowlist:
```toml
[allowlist]
regexes = [
  '''test_api_key_12345''',
]
```

### File Size Violations

Option 1: Refactor file (preferred)
Option 2: Add exception to `.filesize-exceptions`

### Circular Dependencies

View dependency graph:
```bash
npx madge --image graph.svg --circular src/
open graph.svg
```

Then refactor to break the cycle.

## When to Use This Command

Use `/run-checks` before:
- Creating a commit
- Creating a pull request
- Pushing code to remote
- Requesting code review
- End of work session (verify clean state)

## Benefits

- **Catch issues early**: Before commit hooks
- **Save time**: Fix all issues at once
- **Confidence**: Know your code will pass CI
- **Fast feedback**: No waiting for CI pipeline

## Related Commands

- `/commit-push-pr` - Complete commit and PR workflow
- `/fix-violations` - Auto-fix linting and formatting issues
- `/check-secrets` - Deep secret scan (includes TruffleHog)
