#!/bin/bash
# Setup script for Linux/macOS
# Initializes the repository with all dependencies and quality gates

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  Repository Setup - Claude Code Template             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    print_info "Install from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node --version) found"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm --version) found"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher (found: $NODE_VERSION)"
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git $(git --version | cut -d' ' -f3) found"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Step 1: Installing Node.js dependencies"
echo "═══════════════════════════════════════════════════════"
echo ""

npm install
print_success "Node.js dependencies installed"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Step 2: Initializing Husky git hooks"
echo "═══════════════════════════════════════════════════════"
echo ""

npm run prepare
print_success "Husky git hooks initialized"

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/prepare-commit-msg
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
print_success "Git hooks made executable"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Step 3: Detecting project languages"
echo "═══════════════════════════════════════════════════════"
echo ""

LANGUAGES=$(node scripts/hooks/detect-languages.js)
if [ -z "$LANGUAGES" ]; then
    print_info "No source files detected yet (project is empty)"
else
    print_success "Detected languages: $LANGUAGES"

    # Check for Python
    if echo "$LANGUAGES" | grep -q "python"; then
        echo ""
        print_info "Python detected. Checking for Python dependencies..."

        if command -v python3 &> /dev/null; then
            PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
            print_success "Python $PYTHON_VERSION found"

            if command -v pip3 &> /dev/null; then
                print_info "Installing Python dependencies..."
                pip3 install -r requirements-dev.txt
                print_success "Python dependencies installed"
            else
                print_warning "pip3 not found. Skipping Python dependencies."
                print_info "Install manually: pip3 install -r requirements-dev.txt"
            fi
        else
            print_warning "Python not found but Python files detected"
            print_info "Install Python 3.11+: https://www.python.org/"
        fi
    fi

    # Check for Java
    if echo "$LANGUAGES" | grep -q "java"; then
        echo ""
        print_info "Java detected. Checking for Java dependencies..."

        if command -v java &> /dev/null; then
            JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
            print_success "Java $JAVA_VERSION found"

            if command -v mvn &> /dev/null; then
                print_info "Installing Java dependencies..."
                mvn clean install -DskipTests
                print_success "Java dependencies installed"
            else
                print_warning "Maven not found. Skipping Java dependencies."
                print_info "Install Maven: https://maven.apache.org/"
            fi
        else
            print_warning "Java not found but Java files detected"
            print_info "Install Java 17+: https://adoptium.net/"
        fi
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Step 4: Creating .env file"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success ".env file created from .env.example"
        print_warning "Remember to update .env with your actual configuration"
    else
        print_info ".env.example not found, skipping .env creation"
    fi
else
    print_info ".env file already exists, skipping"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Step 5: Verifying installation"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if hooks are installed
if [ -f .husky/pre-commit ]; then
    print_success "Pre-commit hook installed"
else
    print_error "Pre-commit hook missing"
fi

if [ -f .husky/prepare-commit-msg ]; then
    print_success "Prepare-commit-msg hook installed"
else
    print_error "Prepare-commit-msg hook missing"
fi

if [ -f .husky/commit-msg ]; then
    print_success "Commit-msg hook installed"
else
    print_error "Commit-msg hook missing"
fi

if [ -f .husky/pre-push ]; then
    print_success "Pre-push hook installed"
else
    print_error "Pre-push hook missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Optional Tools"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check for Gitleaks
if command -v gitleaks &> /dev/null; then
    print_success "Gitleaks $(gitleaks version | head -n 1) installed"
else
    print_warning "Gitleaks not found (secret scanning will fail)"
    print_info "Install: brew install gitleaks (macOS) or see docs/SETUP.md"
fi

# Check for TruffleHog
if command -v trufflehog &> /dev/null; then
    print_success "TruffleHog installed"
else
    print_info "TruffleHog not found (deep secret scanning disabled)"
    print_info "Install: https://github.com/trufflesecurity/trufflehog"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

print_success "Repository is ready for development"
echo ""
echo "Next steps:"
echo "  1. Review docs/SETUP.md for detailed configuration"
echo "  2. Review docs/HOOKS.md to understand git hooks"
echo "  3. Review docs/SECURITY.md for secret detection"
echo "  4. Review .claude/CLAUDE.md for Claude Code integration"
echo ""
echo "Quick commands:"
echo "  npm run commit          - Create a conventional commit"
echo "  npm run check:all       - Run all quality checks"
echo "  npm run lint            - Run linting"
echo "  npm run test            - Run tests"
echo "  npm run check:secrets   - Scan for secrets"
echo ""
print_warning "Remember: Update .env with your actual configuration!"
echo ""
