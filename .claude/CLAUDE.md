# Claude Code Instructions

This repository uses automated quality gates to ensure code quality and architectural consistency. Please follow these guidelines when working with Claude Code.

## Repository Best Practices

### 1. Documentation Location

**Rule**: ALL `.md` and `.pdf` files MUST be in the `docs/` directory

**Exceptions**: These files are allowed in root:
- README.md
- LICENSE / LICENSE.md
- CHANGELOG.md
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md

**Why**: Centralized documentation improves discoverability and maintains clean repository structure.

**Example**:
```
✅ docs/api-guide.md
✅ docs/setup-instructions.pdf
❌ src/README.md
❌ components/guide.md
```

### 2. File Size Limits

**Rule**: Maximum 500 lines per file

**Exceptions**: Add patterns to `.filesize-exceptions`

**Why**: Enforces Single Responsibility Principle and improves code maintainability.

**When to add exceptions**:
- Generated files (e.g., `src/generated/*.ts`)
- Complex parsers with justification
- Temporary: Legacy code with refactoring ticket

**Example .filesize-exceptions**:
```txt
# Generated files
src/generated/*.ts

# Complex parser - justified
src/core/parser/sql-parser.ts

# TODO: Refactor by Q2 2026 - Issue #456
src/legacy/monolithic-service.ts
```

### 3. Commit Messages

**Rule**: ALWAYS use Conventional Commits format

**Command**: Run `npm run commit` for interactive commit creation

**Format**: `type(scope): description`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting changes
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Maintenance, dependency updates
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

**Scopes**: core, cli, api, ui, db, auth, tests, docs, deps, config, hooks, ci, security

**Examples**:
```
✅ feat(api): add user authentication endpoint
✅ fix(core): resolve circular dependency in data loader
✅ docs(setup): update installation instructions
✅ refactor(db): extract connection pool to separate module
❌ Added stuff
❌ Fix bug
```

### 4. Code Quality Requirements

**All checks MUST pass before commit**:
- ✅ ESLint (TypeScript/JavaScript)
- ✅ pylint (Python, if present)
- ✅ Checkstyle (Java, if present)
- ✅ Prettier formatting
- ✅ Jest/pytest/JUnit tests (80% coverage minimum)
- ✅ No secrets in codebase
- ✅ No circular dependencies
- ✅ File size limits

**Manual check**: `npm run check:all`

### 5. Architecture Patterns

**SOLID Principles** (enforced via ESLint):

1. **Single Responsibility Principle**:
   - Max 50 lines per function
   - Max 15 cognitive complexity
   - Break down large functions

2. **Open/Closed Principle**:
   - Explicit function return types
   - Explicit module boundary types

3. **Liskov Substitution Principle**:
   - No `any` types
   - Strict boolean expressions

4. **Interface Segregation Principle**:
   - Prefer readonly properties
   - Small, focused interfaces

5. **Dependency Inversion Principle**:
   - Use constructor injection
   - Depend on abstractions (interfaces), not concretions

**Dependency Injection Example**:
```typescript
// ✅ Good: Constructor injection
class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  async createUser(data: UserData): Promise<User> {
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}

// ❌ Bad: Direct instantiation
class UserService {
  private userRepository = new UserRepository();
  private emailService = new EmailService();

  async createUser(data: UserData): Promise<User> {
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}
```

#### Dependency Management

**Python Projects**:
- Use `deptry` to detect unused, missing, and transitive dependencies
- Use `pydeps` to visualize dependency graphs
- Run `npm run check:deps:python:full` before major refactors

**Example**: Clean up dependencies
```bash
# Find unused dependencies
npm run check:deps:python:full

# Remove unused package
pip uninstall unused-package
# Update requirements-dev.txt or pyproject.toml
```

### 6. Testing

**Requirements**:
- Write tests for all new features
- Maintain 80% code coverage minimum
- Use Jest for TypeScript unit/integration tests
- Use pytest for Python tests
- Use JUnit for Java tests

**Test file location**:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests

**Example**:
```typescript
// src/services/user.service.ts → tests/unit/services/user.service.test.ts
```

### 7. Git Workflow

**Pre-commit hooks automatically run**:
1. Language detection
2. Linting (ESLint/pylint/Checkstyle)
3. Testing (Jest/pytest/JUnit)
4. File size check
5. Documentation location check
6. Secret scanning (Gitleaks)
7. Format checking (Prettier/Black/Google Java Format)

**Pre-push hooks automatically run**:
1. Circular dependency check (Madge)
2. Full test coverage (80% threshold)
3. Build verification
4. Optional: Deep secret scan (TruffleHog)

**Bypass**: Use `--no-verify` ONLY in emergencies with user approval

### 8. Secret Detection

**Fast scan** (pre-commit): Gitleaks
**Deep scan** (pre-push, optional): TruffleHog

**If secrets detected**:
1. Remove secret from code
2. Add to `.gitignore`
3. Rotate/invalidate the secret
4. If in git history: Run `npm run check:secrets:deep`
5. Emergency cleanup: Use `scripts/security/cleanup-secrets.sh`

**Never commit**:
- API keys
- Passwords
- Private keys
- OAuth tokens
- Database credentials
- AWS access keys

**Use instead**:
- Environment variables
- `.env` files (gitignored)
- Secret management services (AWS Secrets Manager, Vault)

## Slash Commands

Use these commands for common workflows:

### /commit-push-pr
Complete workflow: commit (with Commitizen), push, create PR

### /run-checks
Run all pre-commit checks manually without committing

### /fix-violations
Auto-fix linting and formatting issues

### /check-secrets
Run comprehensive secret scan (Gitleaks + TruffleHog)

## Common Pitfalls

### 1. Don't bypass hooks without permission
**Why**: Hooks exist for quality assurance. Bypassing defeats the purpose.
**When to ask**: User explicitly requests urgent fix with `--no-verify`

### 2. Don't create large files
**Why**: Violates Single Responsibility Principle.
**Fix**: Break down into smaller, focused modules.

### 3. Don't ignore circular dependencies
**Why**: Creates tight coupling and makes testing difficult.
**Fix**: Extract shared code to new module, use dependency injection.

### 4. Don't commit secrets
**Why**: Security risk, cannot be easily removed from git history.
**Fix**: Use environment variables, rotate compromised secrets.

### 5. Don't skip tests
**Why**: Tests ensure code quality and prevent regressions.
**Fix**: Write tests alongside code, maintain 80% coverage.

## Emergency Procedures

If hooks are blocking urgent fixes:

1. **Ask user permission first**
2. Use `git commit --no-verify` ONLY with approval
3. Create follow-up issue to fix violations (required)
4. NEVER use `--no-verify` for routine commits

## File Organization

```
project/
├── docs/                # ALL documentation files
├── src/                 # Source code
│   ├── core/           # Core business logic
│   ├── api/            # API endpoints
│   ├── cli/            # CLI interface
│   └── utils/          # Shared utilities
├── tests/              # All tests
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
├── .claude/           # Claude Code configuration
│   ├── CLAUDE.md      # This file
│   ├── project_conventions.md
│   ├── architecture_decisions.md
│   └── common_patterns.md
└── scripts/           # Utility scripts
```

## Questions?

Refer to:
- [docs/SETUP.md](docs/SETUP.md) - Setup instructions
- [docs/HOOKS.md](docs/HOOKS.md) - Git hooks documentation
- [docs/SECURITY.md](docs/SECURITY.md) - Secret detection guide
- [.claude/project_conventions.md](.claude/project_conventions.md) - Coding standards
- [.claude/architecture_decisions.md](.claude/architecture_decisions.md) - Architecture patterns
- [.claude/common_patterns.md](.claude/common_patterns.md) - Reusable code patterns
