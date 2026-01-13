# Command: /commit-push-pr

Complete workflow: commit (with Commitizen), push, create PR

## Description

This command automates the entire workflow from committing changes to creating a pull request. It ensures all quality gates pass before pushing code.

## Usage

```
/commit-push-pr
```

## What This Command Does

1. **Stage Changes**: Stages all modified files
2. **Run Pre-commit Checks**: Ensures all quality gates pass
3. **Create Commit**: Uses Commitizen for structured commit message
4. **Push to Remote**: Pushes the commit to the remote branch
5. **Create Pull Request**: Creates a PR using GitHub CLI

## Step-by-Step Flow

### Step 1: Check Status

First, let me check the current git status to see what changes need to be committed.

```bash
git status
```

### Step 2: Stage Changes

Stage all modified files:

```bash
git add .
```

### Step 3: Create Commit

The pre-commit hooks will automatically run when we commit. If you have unstaged changes, we'll commit them using the conventional commit format.

Use the Commitizen tool for structured commits:

```bash
npm run commit
```

This will prompt you to:
1. Select the type of change (feat, fix, docs, etc.)
2. Specify the scope (core, api, ui, etc.)
3. Write a short description
4. Optionally provide a longer description
5. Indicate breaking changes (if any)
6. Reference issues (if any)

### Step 4: Push to Remote

After the commit is created successfully, push to the remote:

```bash
git push
```

Or if this is a new branch:

```bash
git push -u origin $(git branch --show-current)
```

### Step 5: Create Pull Request

Create a PR using GitHub CLI:

```bash
gh pr create --fill
```

This will:
- Use the commit message as PR title and description
- Open in browser for review
- Allow you to add reviewers, labels, etc.

## Prerequisites

- Changes are ready to commit
- All tests pass locally
- Code is formatted correctly
- No secrets in code
- GitHub CLI (`gh`) is installed and authenticated

## Example Output

```
✓ Staged 5 files
✓ Pre-commit checks passed
✓ Commit created: feat(api): Add user authentication endpoint
✓ Pushed to origin/feature/user-auth
✓ Pull request created: #42
  https://github.com/owner/repo/pull/42
```

## Troubleshooting

### Pre-commit checks fail

If pre-commit checks fail, fix the issues and try again:

```bash
# View failures
git status

# Fix issues
npm run lint:fix
npm run format

# Try again
npm run commit
```

### Push rejected

If push is rejected (e.g., remote has changes):

```bash
# Pull and rebase
git pull --rebase

# Resolve conflicts if any
# Then push again
git push
```

### GitHub CLI not authenticated

If `gh` is not authenticated:

```bash
gh auth login
```

Follow prompts to authenticate with GitHub.

## Related Commands

- `/run-checks` - Run all quality checks without committing
- `/fix-violations` - Auto-fix linting and formatting issues
- `/check-secrets` - Scan for secrets before committing
