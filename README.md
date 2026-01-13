# Claude Code Repository Template

Production-ready Git repository boilerplate template optimized for Claude Code assisted development. Enforces code quality and architectural best practices through automated Git hooks, multi-language static analysis, and CI/CD integration.

## Features

- ✅ **Automatic Quality Gates**: Pre-commit hooks prevent bad code from entering the repository
- ✅ **Multi-Language Support**: Auto-detect and lint TypeScript, Python, and Java
- ✅ **Dual-Layer Security**: Gitleaks (fast) + TruffleHog (deep) secret detection
- ✅ **SOLID Principles**: Static analysis enforces Single Responsibility, Open/Closed, etc.
- ✅ **Zero Configuration**: One-command setup script for new team members
- ✅ **Claude Code Optimized**: Custom documentation files and slash commands
- ✅ **CI/CD Ready**: GitHub Actions workflows included
- ✅ **Conventional Commits**: Structured commit messages for automated changelogs

## Quick Start

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Git v2.30.0 or higher

### Setup

#### Linux/macOS

```bash
bash scripts/setup.sh
```

#### Windows

```powershell
.\scripts\setup.ps1
```

### Manual Setup

```bash
# Install dependencies
npm install

# Initialize git hooks
npm run prepare

# Verify installation
npm run check:all
```

## Repository Structure

```
.
├── .claude/                 # Claude Code integration
│   ├── CLAUDE.md           # Main instructions for Claude
│   ├── project_conventions.md
│   ├── architecture_decisions.md
│   ├── common_patterns.md
│   └── commands/           # Slash commands
│       ├── commit-push-pr.md
│       ├── run-checks.md
│       ├── fix-violations.md
│       └── check-secrets.md
│
├── .config/                # All configuration files
│   ├── README.md           # Configuration documentation
│   ├── typescript/         # TypeScript/JavaScript configs
│   │   ├── tsconfig.json
│   │   ├── eslint.config.js
│   │   ├── prettier.config.json
│   │   ├── jest.config.js
│   │   └── madge.config.json
│   ├── python/             # Python configs
│   │   ├── pylintrc
│   │   ├── pyproject.toml
│   │   └── requirements-dev.txt
│   ├── java/               # Java configs
│   │   └── checkstyle.xml
│   ├── git/                # Git configs
│   │   └── commitlint.config.js
│   └── security/           # Security configs
│       ├── gitleaks.toml
│       ├── trufflehog.yaml
│       └── filesize-exceptions.txt
│
├── .github/
│   └── workflows/
│       ├── ci.yml          # Main CI pipeline
│       └── security-scan.yml  # Weekly security scan
│
├── .husky/                 # Git hooks
│   ├── pre-commit
│   ├── prepare-commit-msg
│   ├── commit-msg
│   └── pre-push
│
├── docs/                   # Documentation
│   ├── repo_template_plan.md
│   ├── SETUP.md
│   ├── HOOKS.md
│   └── SECURITY.md
│
├── scripts/
│   ├── hooks/              # Hook utility scripts
│   │   ├── check-file-size.js
│   │   ├── check-documentation.js
│   │   └── detect-languages.js
│   ├── security/           # Security scripts
│   │   ├── scan-history.sh
│   │   └── cleanup-secrets.sh
│   ├── setup.sh            # Linux/macOS setup
│   └── setup.ps1           # Windows setup
│
├── src/                    # Source code (create as needed)
├── tests/                  # Tests (create as needed)
│
├── .editorconfig           # Editor configuration (must be in root)
├── package.json            # Node.js dependencies and scripts
└── README.md               # This file
```

## Quality Gates

### Pre-commit (Automatic)

Runs before every commit:
- ✅ Language detection
- ✅ Code linting (ESLint/pylint/Checkstyle)
- ✅ Unit tests
- ✅ File size check (500 lines max)
- ✅ Documentation location check
- ✅ Secret scanning (Gitleaks)
- ✅ Format checking (Prettier/Black)

### Commit Message (Automatic)

Enforces Conventional Commits format:
```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

### Pre-push (Automatic)

Runs before pushing to remote:
- ✅ Circular dependency check
- ✅ Full test coverage (80% minimum)
- ✅ Build verification
- ✅ Optional: Deep secret scan (TruffleHog)

### CI/CD (GitHub Actions)

Runs on every push and PR:
- ✅ Multi-version testing (Node 18.x, 20.x)
- ✅ Quality checks (linting, formatting, secrets)
- ✅ Full test suite with coverage
- ✅ Build verification
- ✅ Weekly deep security scan

## Common Commands

### Development

```bash
# Create a commit (with Commitizen)
npm run commit

# Run all quality checks
npm run check:all

# Run linting
npm run lint
npm run lint:fix          # Auto-fix issues

# Run formatting
npm run format:check
npm run format            # Auto-format code

# Run tests
npm run test
npm run test:coverage     # With coverage report
```

### Security

```bash
# Fast secret scan
npm run check:secrets

# Deep historical scan
npm run check:secrets:deep

# Emergency secret cleanup
bash scripts/security/cleanup-secrets.sh
```

### Code Quality

```bash
# Check file sizes
npm run check:file-size

# Check documentation location
npm run check:docs

# Check circular dependencies
npm run check:deps

# Detect languages
npm run check:languages
```

### Building

```bash
# TypeScript
npm run build

# Python
npm run build:python

# Java
npm run build:java
```

## Claude Code Integration

This repository is optimized for use with [Claude Code](https://claude.ai/claude-code).

### Main Instructions

See [.claude/CLAUDE.md](.claude/CLAUDE.md) for detailed guidelines on:
- Documentation location rules
- File size limits
- Commit message format
- Code quality requirements
- Architecture patterns
- Testing conventions
- Git workflow
- Secret detection

### Slash Commands

- `/commit-push-pr` - Complete workflow: commit, push, create PR
- `/run-checks` - Run all quality checks without committing
- `/fix-violations` - Auto-fix linting and formatting issues
- `/check-secrets` - Run comprehensive secret scan

### Additional Resources

- [project_conventions.md](.claude/project_conventions.md) - Coding standards
- [architecture_decisions.md](.claude/architecture_decisions.md) - ADRs
- [common_patterns.md](.claude/common_patterns.md) - Reusable patterns

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[SETUP.md](docs/SETUP.md)** - Complete setup guide
  - Prerequisites installation
  - Manual and automated setup
  - IDE configuration
  - Verification steps
  - Troubleshooting

- **[HOOKS.md](docs/HOOKS.md)** - Git hooks documentation
  - Hook workflow explanation
  - Pre-commit checks
  - Commit message format
  - Pre-push checks
  - Bypassing hooks (when necessary)
  - Troubleshooting hooks

- **[SECURITY.md](docs/SECURITY.md)** - Security and secret detection
  - Secret detection strategy
  - What counts as a secret
  - Prevention best practices
  - Removing secrets from Git history
  - Emergency response procedures

- **[repo_template_plan.md](docs/repo_template_plan.md)** - Full implementation plan
  - Tool stack and rationale
  - Complete configuration files
  - Phase-by-phase implementation
  - Enforcement matrix
  - Troubleshooting guide

## Multi-Language Support

### TypeScript/JavaScript

- **Linting**: ESLint with TypeScript, SonarJS, and import plugins
- **Formatting**: Prettier
- **Testing**: Jest with ts-jest
- **Building**: TypeScript compiler

### Python

- **Linting**: pylint
- **Formatting**: Black
- **Testing**: pytest with coverage
- **Type Checking**: mypy

### Java

- **Linting**: Checkstyle
- **Formatting**: Google Java Format
- **Testing**: JUnit
- **Building**: Maven

## Enforcement Matrix

| Best Practice | Enforcement | Stage | Bypassable |
|---------------|-------------|-------|------------|
| Documentation in docs/ | Script check | Pre-commit | With --no-verify |
| Tests pass | Jest/pytest/JUnit | Pre-commit | With --no-verify |
| Code linted | ESLint/pylint/Checkstyle | Pre-commit | With --no-verify |
| Code formatted | Prettier/Black | Pre-commit | With --no-verify |
| Max 500 lines/file | Script + exceptions | Pre-commit | Via .filesize-exceptions |
| SOLID principles | ESLint rules | Pre-commit | Only by fixing |
| No secrets | Gitleaks | Pre-commit | With --no-verify |
| Conventional Commits | Commitlint | Commit-msg | With --no-verify |
| No circular deps | Madge | Pre-push | With --no-verify |
| 80% test coverage | Jest/pytest thresholds | Pre-push | With --no-verify |
| Build succeeds | Compilers | Pre-push | With --no-verify |

## Bypassing Hooks

Hooks can be bypassed in emergencies:

```bash
# Bypass pre-commit and commit-msg
git commit --no-verify

# Bypass pre-push
git push --no-verify
```

**⚠️ WARNING**: Only bypass hooks:
- In emergencies (production hotfix)
- With user approval
- With follow-up issue created
- NEVER for routine commits

## Contributing

1. Clone the repository
2. Run setup script: `bash scripts/setup.sh`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make changes and commit: `npm run commit`
5. Push to remote: `git push`
6. Create a pull request

## Troubleshooting

### Common Issues

**Hooks not running**:
```bash
npm run prepare
chmod +x .husky/*
```

**Gitleaks not found**:
```bash
brew install gitleaks  # macOS
```

**Commitizen not launching**:
```bash
npm run commit
```

**Tests failing**:
```bash
npm run test -- --verbose
```

For more troubleshooting, see [SETUP.md](docs/SETUP.md) and [HOOKS.md](docs/HOOKS.md).

## License

MIT

## Support

For questions or issues:
- Review documentation in `docs/`
- Check `.claude/` for Claude Code specific guidance
- Open an issue in the repository
- Contact the team lead

## Credits

Built with:
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Commitizen](https://github.com/commitizen/cz-cli) - Commit messages
- [Commitlint](https://commitlint.js.org/) - Commit validation
- [ESLint](https://eslint.org/) - JavaScript/TypeScript linting
- [Prettier](https://prettier.io/) - Code formatting
- [Jest](https://jestjs.io/) - Testing
- [Gitleaks](https://github.com/gitleaks/gitleaks) - Secret detection
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Deep secret scanning
- [Madge](https://github.com/pahen/madge) - Circular dependency detection

---

**Version**: 1.0.0
**Last Updated**: 2026-01-13
**Optimized for**: Claude Code
