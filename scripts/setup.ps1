# Setup script for Windows PowerShell
# Initializes the repository with all dependencies and quality gates

$ErrorActionPreference = "Stop"

function Print-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Repository Setup - Claude Code Template             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version
    Print-Success "Node.js $nodeVersion found"
} catch {
    Print-Error "Node.js is not installed"
    Print-Info "Install from: https://nodejs.org/"
    exit 1
}

try {
    $npmVersion = npm --version
    Print-Success "npm $npmVersion found"
} catch {
    Print-Error "npm is not installed"
    exit 1
}

# Check Node.js version
$nodeVersionNumber = $nodeVersion.TrimStart('v').Split('.')[0]
if ([int]$nodeVersionNumber -lt 18) {
    Print-Error "Node.js version must be 18 or higher (found: $nodeVersionNumber)"
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Print-Success "Git found"
} catch {
    Print-Error "Git is not installed"
    Print-Info "Install from: https://git-scm.com/"
    exit 1
}

Print-Header "Step 1: Installing Node.js dependencies"

try {
    npm install
    Print-Success "Node.js dependencies installed"
} catch {
    Print-Error "Failed to install Node.js dependencies"
    exit 1
}

Print-Header "Step 2: Initializing Husky git hooks"

try {
    npm run prepare
    Print-Success "Husky git hooks initialized"
} catch {
    Print-Error "Failed to initialize Husky"
    exit 1
}

# Verify hooks exist
if (Test-Path ".husky/pre-commit") {
    Print-Success "Pre-commit hook installed"
} else {
    Print-Error "Pre-commit hook missing"
}

if (Test-Path ".husky/prepare-commit-msg") {
    Print-Success "Prepare-commit-msg hook installed"
} else {
    Print-Error "Prepare-commit-msg hook missing"
}

if (Test-Path ".husky/commit-msg") {
    Print-Success "Commit-msg hook installed"
} else {
    Print-Error "Commit-msg hook missing"
}

if (Test-Path ".husky/pre-push") {
    Print-Success "Pre-push hook installed"
} else {
    Print-Error "Pre-push hook missing"
}

Print-Header "Step 3: Detecting project languages"

try {
    $languages = node scripts/hooks/detect-languages.js
    if ([string]::IsNullOrEmpty($languages)) {
        Print-Info "No source files detected yet (project is empty)"
    } else {
        Print-Success "Detected languages: $languages"

        # Check for Python
        if ($languages -match "python") {
            Write-Host ""
            Print-Info "Python detected. Checking for Python dependencies..."

            try {
                $pythonVersion = python --version 2>&1
                Print-Success "Python found: $pythonVersion"

                try {
                    pip install -r requirements-dev.txt
                    Print-Success "Python dependencies installed"
                } catch {
                    Print-Warning "Failed to install Python dependencies"
                    Print-Info "Install manually: pip install -r requirements-dev.txt"
                }
            } catch {
                Print-Warning "Python not found but Python files detected"
                Print-Info "Install Python 3.11+: https://www.python.org/"
            }
        }

        # Check for Java
        if ($languages -match "java") {
            Write-Host ""
            Print-Info "Java detected. Checking for Java dependencies..."

            try {
                $javaVersion = java -version 2>&1 | Select-String "version"
                Print-Success "Java found: $javaVersion"

                try {
                    mvn clean install -DskipTests
                    Print-Success "Java dependencies installed"
                } catch {
                    Print-Warning "Maven not found. Skipping Java dependencies."
                    Print-Info "Install Maven: https://maven.apache.org/"
                }
            } catch {
                Print-Warning "Java not found but Java files detected"
                Print-Info "Install Java 17+: https://adoptium.net/"
            }
        }
    }
} catch {
    Print-Warning "Language detection failed"
}

Print-Header "Step 4: Creating .env file"

if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Print-Success ".env file created from .env.example"
        Print-Warning "Remember to update .env with your actual configuration"
    } else {
        Print-Info ".env.example not found, skipping .env creation"
    }
} else {
    Print-Info ".env file already exists, skipping"
}

Print-Header "Step 5: Verifying installation"

# Check hooks again
$hooksOk = $true
if (Test-Path ".husky/pre-commit") {
    Print-Success "Pre-commit hook verified"
} else {
    Print-Error "Pre-commit hook missing"
    $hooksOk = $false
}

if (Test-Path ".husky/prepare-commit-msg") {
    Print-Success "Prepare-commit-msg hook verified"
} else {
    Print-Error "Prepare-commit-msg hook missing"
    $hooksOk = $false
}

if (Test-Path ".husky/commit-msg") {
    Print-Success "Commit-msg hook verified"
} else {
    Print-Error "Commit-msg hook missing"
    $hooksOk = $false
}

if (Test-Path ".husky/pre-push") {
    Print-Success "Pre-push hook verified"
} else {
    Print-Error "Pre-push hook missing"
    $hooksOk = $false
}

Print-Header "Optional Tools"

# Check for Gitleaks
try {
    $gitleaksVersion = gitleaks version 2>&1
    Print-Success "Gitleaks installed"
} catch {
    Print-Warning "Gitleaks not found (secret scanning will fail)"
    Print-Info "Install: choco install gitleaks (or see docs/SETUP.md)"
}

# Check for TruffleHog
try {
    trufflehog --version 2>&1 | Out-Null
    Print-Success "TruffleHog installed"
} catch {
    Print-Info "TruffleHog not found (deep secret scanning disabled)"
    Print-Info "Install: https://github.com/trufflesecurity/trufflehog"
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Setup Complete!                                      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($hooksOk) {
    Print-Success "Repository is ready for development"
} else {
    Print-Warning "Setup completed with warnings. Some hooks may not be installed."
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review docs/SETUP.md for detailed configuration"
Write-Host "  2. Review docs/HOOKS.md to understand git hooks"
Write-Host "  3. Review docs/SECURITY.md for secret detection"
Write-Host "  4. Review .claude/CLAUDE.md for Claude Code integration"
Write-Host ""
Write-Host "Quick commands:" -ForegroundColor Cyan
Write-Host "  npm run commit          - Create a conventional commit"
Write-Host "  npm run check:all       - Run all quality checks"
Write-Host "  npm run lint            - Run linting"
Write-Host "  npm run test            - Run tests"
Write-Host "  npm run check:secrets   - Scan for secrets"
Write-Host ""
Print-Warning "Remember: Update .env with your actual configuration!"
Write-Host ""
