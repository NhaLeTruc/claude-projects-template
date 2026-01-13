# Configuration Files

This directory contains all configuration files for the project, organized by technology and purpose.

## Directory Structure

```
.config/
├── typescript/         # TypeScript/JavaScript configurations
│   ├── tsconfig.json          # TypeScript compiler config
│   ├── eslint.config.js       # ESLint linting config
│   ├── prettier.config.json   # Prettier formatting config
│   ├── jest.config.js         # Jest testing config
│   └── madge.config.json      # Circular dependency detection
│
├── python/            # Python configurations
│   ├── pylintrc              # Pylint linting config
│   ├── pyproject.toml        # Python project config (Black, pytest, mypy)
│   └── requirements-dev.txt  # Development dependencies
│
├── java/              # Java configurations
│   └── checkstyle.xml        # Checkstyle config
│
├── git/               # Git-related configurations
│   └── commitlint.config.js  # Commit message linting
│
└── security/          # Security configurations
    ├── gitleaks.toml         # Fast secret scanning (Gitleaks)
    ├── trufflehog.yaml       # Deep secret scanning (TruffleHog)
    └── filesize-exceptions.txt  # File size limit exceptions
```

## Usage

All npm scripts in `package.json` reference these config files with explicit paths:

```bash
# Examples
npm run lint          # Uses .config/typescript/eslint.config.js
npm run test          # Uses .config/typescript/jest.config.js
npm run check:secrets # Uses .config/security/gitleaks.toml
```

## IDE Integration

For better IDE integration, the following entries are added to `package.json`:

```json
{
  "eslintConfig": {
    "extends": "./.config/typescript/eslint.config.js"
  },
  "prettier": "./.config/typescript/prettier.config.json",
  "jest": "./.config/typescript/jest.config.js"
}
```

This allows IDEs to automatically discover and use these configurations.

## Modifying Configurations

When modifying configuration files:

1. **TypeScript/JavaScript**: Edit files in `.config/typescript/`
2. **Python**: Edit files in `.config/python/`
3. **Java**: Edit files in `.config/java/`
4. **Security**: Edit files in `.config/security/`

No changes to `package.json` scripts are needed unless you're changing file names.

## File Locations

| Tool | Config File | Location |
|------|-------------|----------|
| TypeScript | tsconfig.json | `.config/typescript/` |
| ESLint | eslint.config.js | `.config/typescript/` |
| Prettier | prettier.config.json | `.config/typescript/` |
| Jest | jest.config.js | `.config/typescript/` |
| Madge | madge.config.json | `.config/typescript/` |
| Pylint | pylintrc | `.config/python/` |
| Black/pytest | pyproject.toml | `.config/python/` |
| Python deps | requirements-dev.txt | `.config/python/` |
| Checkstyle | checkstyle.xml | `.config/java/` |
| Commitlint | commitlint.config.js | `.config/git/` |
| Gitleaks | gitleaks.toml | `.config/security/` |
| TruffleHog | trufflehog.yaml | `.config/security/` |
| File size | filesize-exceptions.txt | `.config/security/` |

## Why This Structure?

Benefits of organizing configs in `.config/`:

1. **Clean Root**: Reduces clutter in the project root
2. **Logical Grouping**: Configs are grouped by purpose/technology
3. **Easy Discovery**: Clear where to find each config
4. **Maintainability**: Easier to manage and update configs
5. **Scalability**: Easy to add new configs as project grows

## Root Directory

The following files remain in the root directory for technical reasons:

- `.editorconfig` - Must be in root for editor detection
- `package.json` - Required by npm in root
- `README.md` - Convention for project documentation
