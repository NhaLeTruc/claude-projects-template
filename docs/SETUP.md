# Setup Guide

Complete guide for setting up this repository template for development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Verification](#verification)
5. [IDE Configuration](#ide-configuration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher

### Optional (for multi-language support)

- **Python**: v3.11 or higher (if using Python)
- **Java**: v17 or higher (if using Java)
- **pip**: Latest version (for Python dependencies)
- **Maven**: v3.8.0 or higher (for Java)

### Tool Installation

#### Node.js and npm

**macOS** (using Homebrew):
```bash
brew install node
```

**Linux** (using nvm):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

**Windows**:
Download from [nodejs.org](https://nodejs.org/)

#### Python

**macOS**:
```bash
brew install python@3.11
```

**Linux**:
```bash
sudo apt-get update
sudo apt-get install python3.11 python3-pip
```

**Windows**:
Download from [python.org](https://www.python.org/)

#### Java

**macOS**:
```bash
brew install openjdk@17
```

**Linux**:
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk maven
```

**Windows**:
Download from [adoptium.net](https://adoptium.net/)

## Quick Start

For immediate setup, use the automated setup scripts:

### Linux/macOS

```bash
bash scripts/setup.sh
```

### Windows (PowerShell)

```powershell
.\scripts\setup.ps1
```

The setup script will:
1. Install npm dependencies
2. Initialize Husky git hooks
3. Install Python dependencies (if Python files detected)
4. Run initial quality checks
5. Display setup summary

## Detailed Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Step 2: Install Dependencies

#### JavaScript/TypeScript Dependencies

```bash
npm install
```

This installs:
- Husky (Git hooks manager)
- ESLint and plugins (Linting)
- Prettier (Code formatting)
- Jest (Testing framework)
- TypeScript (Type checking)
- Commitizen & Commitlint (Commit message enforcement)
- Madge (Circular dependency detection)
- And more...

#### Python Dependencies (if applicable)

```bash
pip install -r requirements-dev.txt
```

This installs:
- pylint (Linting)
- black (Code formatting)
- pytest (Testing framework)
- mypy (Type checking)

#### Java Dependencies (if applicable)

Maven will automatically download dependencies when you first run:
```bash
mvn clean install
```

### Step 3: Initialize Git Hooks

```bash
npm run prepare
```

This sets up Husky and installs all git hooks:
- `pre-commit`: Runs linting, tests, file size checks, secret scanning
- `prepare-commit-msg`: Launches Commitizen for structured commits
- `commit-msg`: Validates commit message format
- `pre-push`: Runs full test suite, circular dependency check, build

### Step 4: Configure Environment

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```bash
# Example .env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_dev
DB_USER=myuser
DB_PASSWORD=mypassword

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Email
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@example.com
```

**Important**: Never commit `.env` file. It's already in `.gitignore`.

### Step 5: Create Initial Directories

Create source and test directories:

```bash
mkdir -p src/{core,api,data,config}
mkdir -p tests/{unit,integration,e2e}
```

### Step 6: Run Initial Checks

Verify everything is working:

```bash
# Detect languages
npm run check:languages

# Run all checks
npm run check:all
```

## Verification

### Verify Git Hooks

Test that hooks are installed:

```bash
# Check hook files exist
ls -la .husky/

# Should see:
# pre-commit
# prepare-commit-msg
# commit-msg
# pre-push
```

### Verify Linting

```bash
# TypeScript
npm run lint

# Python (if applicable)
npm run lint:python

# Java (if applicable)
npm run lint:java
```

### Verify Testing

```bash
# TypeScript
npm run test

# Python (if applicable)
npm run test:python

# Java (if applicable)
npm run test:java
```

### Verify Secret Scanning

```bash
npm run check:secrets
```

### Test Commit Flow

Create a test commit to verify the entire flow:

```bash
# Make a trivial change
echo "# Test" >> README.md

# Stage the change
git add README.md

# Try to commit (will trigger hooks)
git commit

# Commitizen will prompt you for commit details
# Follow the prompts to create a properly formatted commit
```

## IDE Configuration

### Visual Studio Code

Install recommended extensions:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
code --install-extension redhat.java
```

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.formatOnSave": true
  },
  "[java]": {
    "editor.defaultFormatter": "redhat.java"
  },
  "files.associations": {
    "*.toml": "toml",
    ".gitleaks.toml": "toml"
  }
}
```

### JetBrains IDEs (WebStorm, PyCharm, IntelliJ)

1. Enable ESLint:
   - Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Select "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

2. Enable Prettier:
   - Settings → Languages & Frameworks → JavaScript → Prettier
   - Enable "On code reformat" and "On save"

3. Configure Python (PyCharm):
   - Settings → Tools → Python Integrated Tools
   - Set default test runner to pytest
   - Enable black as formatter

## Troubleshooting

### Issue: Hooks not running

**Solution**:
```bash
# Reinstall Husky
rm -rf .husky
npm run prepare

# Make hooks executable (Linux/macOS)
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Issue: "gitleaks: command not found"

**Solution**:

**macOS**:
```bash
brew install gitleaks
```

**Linux**:
```bash
# Download latest release
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Windows**:
```powershell
choco install gitleaks
```

Or add to package.json scripts and use via npx.

### Issue: "madge: command not found"

**Solution**:
```bash
# Already in package.json, ensure it's installed
npm install

# Run via npx if needed
npx madge --version
```

### Issue: Python tests failing

**Solution**:
```bash
# Ensure Python dependencies are installed
pip install -r requirements-dev.txt

# Check Python version
python --version  # Should be 3.11+

# Run tests with verbose output
pytest -v
```

### Issue: Commitizen not launching

**Solution**:
```bash
# Check if commitizen is installed
npm list commitizen

# Reinstall if missing
npm install commitizen @commitlint/cz-commitlint --save-dev

# Try committing with explicit command
npm run commit
```

### Issue: Pre-commit hook too slow

**Solution**:

The pre-commit hook runs many checks. To speed it up:

1. **Skip specific checks** (with user approval):
   ```bash
   git commit --no-verify
   ```

2. **Run tests in parallel** (future enhancement):
   Modify `.husky/pre-commit` to run tests concurrently

3. **Optimize test suite**:
   - Use `--onlyChanged` flag for Jest
   - Configure pytest to run only changed tests

### Issue: "Module not found" errors

**Solution**:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# TypeScript: Check tsconfig.json paths
npm run build
```

### Issue: Circular dependency detected

**Solution**:

1. View dependency graph:
   ```bash
   npx madge --image graph.svg --circular src/
   open graph.svg
   ```

2. Identify circular dependencies in the graph

3. Refactor using patterns from [.claude/architecture_decisions.md](.claude/architecture_decisions.md)

### Getting Help

If you encounter issues not covered here:

1. Check [HOOKS.md](./HOOKS.md) for hook-specific issues
2. Check [SECURITY.md](./SECURITY.md) for secret scanning issues
3. Review [repo_template_plan.md](./repo_template_plan.md) troubleshooting section
4. Open an issue in the repository
5. Contact the team lead

## Next Steps

After setup is complete:

1. Read [HOOKS.md](./HOOKS.md) to understand git hook workflow
2. Read [SECURITY.md](./SECURITY.md) for secret detection guidelines
3. Review [.claude/CLAUDE.md](../.claude/CLAUDE.md) for Claude Code integration
4. Start coding! All quality gates are now active.

## Verification Checklist

Before starting development, ensure:

- [ ] Node.js v18+ installed
- [ ] npm install completed successfully
- [ ] Husky hooks installed (`.husky/` directory exists)
- [ ] Git hooks are executable
- [ ] npm run lint passes
- [ ] npm run test passes
- [ ] npm run check:secrets passes
- [ ] Test commit flow works with Commitizen
- [ ] IDE configured with ESLint and Prettier
- [ ] .env file created and configured
- [ ] All documentation reviewed

**Congratulations!** Your development environment is ready.
