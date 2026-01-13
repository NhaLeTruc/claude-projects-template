# Command: /fix-violations

Auto-fix linting and formatting issues

## Description

This command automatically fixes common linting and formatting violations that can be resolved automatically, saving time and ensuring code consistency.

## Usage

```
/fix-violations
```

## What This Command Does

Automatically fixes:
1. **Code Style Issues**: ESLint auto-fixable rules
2. **Import Organization**: Sorts and organizes imports
3. **Code Formatting**: Prettier/Black formatting
4. **Whitespace**: Trailing spaces, line endings, etc.
5. **Simple Lint Rules**: Unused variables, missing semicolons, etc.

## Step-by-Step Execution

Let me run auto-fix for all detected languages:

### Step 1: Detect Languages

First, detect which languages are in the project:

```bash
LANGUAGES=$(node scripts/hooks/detect-languages.js)
echo "Detected languages: $LANGUAGES"
```

### Step 2: Fix TypeScript/JavaScript

If TypeScript or JavaScript is detected:

```bash
# Run ESLint with --fix flag
npm run lint:fix

# Run Prettier to format code
npm run format
```

This fixes:
- Missing semicolons
- Incorrect indentation
- Import order violations
- Unused variables (with safe removals)
- Arrow function conversions
- Const/let corrections
- And more...

### Step 3: Fix Python

If Python is detected:

```bash
# Format with Black
npm run format:python

# Or directly
black .

# Fix import order
isort .
```

This fixes:
- Code formatting (PEP 8)
- Line length violations
- Import organization
- Whitespace issues

### Step 4: Fix Java

If Java is detected:

```bash
# Format with Google Java Format
npm run format:java

# Or if using Maven plugin
mvn spotless:apply
```

This fixes:
- Code formatting
- Import organization
- Whitespace issues

### Step 5: Verify Fixes

After auto-fixing, verify that violations are resolved:

```bash
npm run check:all
```

## Example Output

### Before Fix

```
📝 Linting code...
❌ ESLint found 12 errors:

  src/services/user.service.ts
    Line 5:  Missing semicolon
    Line 12: Incorrect indentation (expected 2, got 4)
    Line 23: Unused variable 'temp'
    Line 35: Import order incorrect

  src/utils/validator.ts
    Line 8:  Trailing whitespace
    Line 15: Missing return type
```

### Running Fix

```bash
npm run lint:fix
npm run format
```

```
✓ Fixed 10 issues automatically
✓ Formatted 5 files

⚠ 2 issues require manual fix:
  - Line 15: Missing return type (requires type annotation)
  - Line 28: Circular dependency (requires refactoring)
```

### After Fix

```
📝 Linting code...
✓ ESLint: 0 auto-fixable errors
⚠ 2 warnings (require manual fix)

💅 Checking code formatting...
✓ All files properly formatted
```

## What Can Be Auto-Fixed

### TypeScript/JavaScript (ESLint + Prettier)

✅ **Auto-fixable**:
- Missing semicolons
- Incorrect indentation
- Import order
- Unused imports
- Trailing whitespace
- Inconsistent quotes
- Arrow function syntax
- Var to const/let
- And many more...

❌ **Manual fix required**:
- Missing return types
- Circular dependencies
- Complex logic violations
- Cognitive complexity
- Missing error handling

### Python (Black + isort)

✅ **Auto-fixable**:
- Code formatting (PEP 8)
- Import order
- Line length (by splitting)
- Whitespace issues
- Quote consistency

❌ **Manual fix required**:
- Type hints
- Docstrings
- Logic complexity
- Missing tests

### Java (Google Java Format)

✅ **Auto-fixable**:
- Code formatting
- Import order
- Whitespace issues
- Brace placement

❌ **Manual fix required**:
- Javadoc comments
- Complexity issues
- Design violations

## Individual Language Fixes

You can fix specific languages:

### TypeScript/JavaScript Only

```bash
# Fix linting issues
npm run lint:fix

# Fix formatting
npm run format
```

### Python Only

```bash
# Format code
black .

# Fix imports
isort .

# Or combined
npm run format:python
```

### Java Only

```bash
# Format code
npm run format:java
```

## Safe Auto-Fix Workflow

Follow this workflow for safe auto-fixing:

### Step 1: Check Current State

```bash
# See what issues exist
npm run lint
npm run format:check
```

### Step 2: Review Changes Before Auto-Fix

```bash
# See current diff
git diff
```

### Step 3: Run Auto-Fix

```bash
npm run lint:fix
npm run format
```

### Step 4: Review Auto-Fix Changes

```bash
# See what was changed
git diff

# Review carefully before committing
```

### Step 5: Verify All Checks Pass

```bash
npm run check:all
```

### Step 6: Commit Changes

If everything looks good:
```bash
git add .
npm run commit
```

## Troubleshooting

### Auto-fix Changes Too Much

If auto-fix makes unexpected changes:

```bash
# Revert changes
git checkout .

# Fix specific files only
npx eslint src/specific-file.ts --fix
npx prettier --write src/specific-file.ts
```

### Some Issues Still Remain

Issues that can't be auto-fixed require manual intervention:

```bash
# Run checks to see remaining issues
npm run lint
```

Example manual fixes needed:
```typescript
// Before: Missing return type
function getUser(id: string) {
  return userRepository.findById(id);
}

// After: Add return type
function getUser(id: string): Promise<User | null> {
  return userRepository.findById(id);
}
```

### Formatting Conflicts

If Prettier and ESLint conflict:

1. Prettier takes precedence for formatting
2. ESLint handles code quality rules
3. `eslint-config-prettier` disables conflicting rules

Ensure `prettier` is last in `.eslintrc.js` extends array:
```javascript
extends: [
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  'prettier', // Must be last
]
```

## Best Practices

1. **Run auto-fix frequently**: Before every commit
2. **Review changes**: Don't blindly commit auto-fixes
3. **Understand fixes**: Learn why changes were made
4. **Fix manually when needed**: Some issues require thought
5. **Keep tools updated**: Newer versions fix more issues

## Pre-commit Integration

Auto-fix is NOT run automatically in pre-commit hooks (to avoid surprise changes). You must run it manually.

However, pre-commit CHECKS if code is formatted:
```bash
# Pre-commit checks formatting
npm run format:check  # Fails if not formatted

# Fix before committing
npm run format        # Auto-formats code
```

## IDE Integration

For real-time auto-fix, configure your IDE:

### VS Code

In `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### JetBrains IDEs

1. Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable "Run eslint --fix on save"
3. Settings → Languages & Frameworks → JavaScript → Prettier
4. Enable "On save"

## Related Commands

- `/run-checks` - Run all checks without auto-fixing
- `/commit-push-pr` - Complete commit and PR workflow
- `/check-secrets` - Scan for secrets

## Summary

Use `/fix-violations` to:
- ✅ Quickly fix formatting and style issues
- ✅ Ensure code consistency
- ✅ Save time on manual fixes
- ✅ Prepare code for commit

Remember to review changes before committing!
