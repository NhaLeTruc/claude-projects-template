# Architecture Decisions

This document records important architectural decisions made for this project using the Architecture Decision Record (ADR) format.

## Table of Contents

1. [ADR-001: Use Layered Architecture](#adr-001-use-layered-architecture)
2. [ADR-002: Dependency Injection Pattern](#adr-002-dependency-injection-pattern)
3. [ADR-003: Repository Pattern for Data Access](#adr-003-repository-pattern-for-data-access)
4. [ADR-004: Error Handling Strategy](#adr-004-error-handling-strategy)
5. [ADR-005: API Response Format](#adr-005-api-response-format)
6. [ADR-006: Logging Strategy](#adr-006-logging-strategy)
7. [ADR-007: Testing Strategy](#adr-007-testing-strategy)
8. [ADR-008: Git Hooks for Quality Gates](#adr-008-git-hooks-for-quality-gates)

---

## ADR-001: Use Layered Architecture

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need a clear structure for organizing code that separates concerns and makes the codebase maintainable as it grows.

### Decision

Adopt a layered architecture with the following layers:

1. **Presentation Layer** (`api/`): Handles HTTP requests, validation, and response formatting
2. **Business Logic Layer** (`core/services/`): Contains business rules and orchestration
3. **Data Access Layer** (`data/repositories/`): Abstracts database operations
4. **Domain Models** (`core/models/`): Defines data structures and entities

### Consequences

**Positive**:
- Clear separation of concerns
- Each layer has a single responsibility
- Easier to test in isolation
- Better maintainability

**Negative**:
- More files and structure to navigate
- Slight overhead for simple operations
- Requires discipline to maintain boundaries

### Implementation

```
src/
├── api/
│   ├── controllers/
│   ├── middleware/
│   └── routes/
├── core/
│   ├── models/
│   ├── services/
│   └── utils/
└── data/
    ├── repositories/
    └── entities/
```

---

## ADR-002: Dependency Injection Pattern

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need a way to manage dependencies between classes that:
- Makes code testable
- Reduces coupling
- Allows for flexible configuration

### Decision

Use constructor-based dependency injection throughout the codebase.

### Rationale

Constructor injection:
- Makes dependencies explicit
- Enables easy mocking in tests
- Prevents circular dependencies
- Works well with TypeScript's type system

### Implementation

```typescript
// ✅ Good: Dependencies injected via constructor
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger
  ) {}

  async createUser(data: UserData): Promise<User> {
    // Use injected dependencies
    const user = await this.userRepository.create(data);
    await this.emailService.sendWelcome(user.email);
    this.logger.info('User created', { userId: user.id });
    return user;
  }
}

// Factory or container manages instantiation
export function createUserService(): UserService {
  const userRepository = new UserRepository();
  const emailService = new EmailService();
  const logger = new Logger();
  return new UserService(userRepository, emailService, logger);
}
```

### Testing Benefits

```typescript
describe('UserService', () => {
  it('should send welcome email on user creation', async () => {
    // Easy to inject mocks
    const mockRepository = createMockRepository();
    const mockEmailService = createMockEmailService();
    const mockLogger = createMockLogger();

    const service = new UserService(
      mockRepository,
      mockEmailService,
      mockLogger
    );

    await service.createUser({ email: 'test@example.com' });

    expect(mockEmailService.sendWelcome).toHaveBeenCalled();
  });
});
```

---

## ADR-003: Repository Pattern for Data Access

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need to abstract database operations to:
- Switch databases if needed
- Test business logic without real database
- Keep data access concerns separate

### Decision

Implement the Repository pattern for all data access.

### Implementation

```typescript
// Interface defines the contract
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: UserData): Promise<User>;
  update(id: string, data: Partial<UserData>): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(filters?: UserFilters): Promise<User[]>;
}

// Implementation handles database specifics
export class UserRepository implements IUserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapToUser(row) : null;
  }

  // Other methods...

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    };
  }
}
```

### Benefits

- Business logic depends on interface, not implementation
- Easy to mock for testing
- Can swap database implementations
- Centralizes query logic

---

## ADR-004: Error Handling Strategy

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need consistent error handling across the application that:
- Provides useful information for debugging
- Protects sensitive information from users
- Enables proper logging and monitoring

### Decision

Implement a three-tier error strategy:

1. **Custom Error Classes**: Define semantic error types
2. **Error Middleware**: Centralized error handling
3. **Error Logging**: Structured logging with context

### Implementation

```typescript
// 1. Custom Error Classes
export class ApplicationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// 2. Error Middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error with context
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Send appropriate response
  if (error instanceof ApplicationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
  } else {
    // Hide internal errors from users
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
```

---

## ADR-005: API Response Format

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need a consistent API response format for:
- Success responses
- Error responses
- Pagination
- Metadata

### Decision

Use a standardized JSON response format:

```typescript
// Success response
{
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2026-01-07T12:00:00Z",
    "requestId": "abc-123"
  }
}

// List response with pagination
{
  "data": [ /* array of resources */ ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// Error response
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## ADR-006: Logging Strategy

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need structured logging that:
- Provides debugging information
- Enables monitoring and alerting
- Doesn't expose sensitive data

### Decision

Implement structured JSON logging with log levels and context.

### Log Levels

- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages
- `fatal`: Critical errors requiring immediate attention

### Implementation

```typescript
interface LogContext {
  [key: string]: any;
}

class Logger {
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  private log(level: string, message: string, context?: LogContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };
    console.log(JSON.stringify(logEntry));
  }
}
```

### Usage

```typescript
logger.info('User created', {
  userId: user.id,
  email: user.email,
  action: 'user.created',
});

logger.error('Database connection failed', {
  error: error.message,
  database: 'users',
  retries: 3,
});
```

---

## ADR-007: Testing Strategy

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need a comprehensive testing strategy that balances coverage, speed, and maintainability.

### Decision

Implement a testing pyramid:

1. **Unit Tests (70%)**: Test individual functions and classes
2. **Integration Tests (20%)**: Test interactions between components
3. **E2E Tests (10%)**: Test critical user workflows

### Guidelines

**Unit Tests**:
- Fast execution (< 100ms each)
- Test one thing per test
- Use mocks for dependencies
- 80% coverage minimum

**Integration Tests**:
- Test real database interactions
- Test API endpoints
- Use test database

**E2E Tests**:
- Test critical user journeys
- Run in CI/CD before deployment
- Keep minimal (only happy paths + critical errors)

### Implementation Structure

```
tests/
├── unit/
│   ├── services/
│   │   └── user.service.test.ts
│   └── utils/
│       └── validator.test.ts
├── integration/
│   ├── api/
│   │   └── user.api.test.ts
│   └── repositories/
│       └── user.repository.test.ts
└── e2e/
    ├── user-registration.test.ts
    └── checkout-flow.test.ts
```

---

## ADR-008: Git Hooks for Quality Gates

**Date**: 2026-01-07

**Status**: Accepted

### Context

We need to enforce code quality automatically before code enters the repository.

### Decision

Implement multi-layered quality gates using Git hooks:

**Pre-commit**:
- Linting (ESLint/pylint/Checkstyle)
- Unit tests
- File size checks
- Documentation location checks
- Secret scanning (Gitleaks)
- Format checking (Prettier/Black)

**Commit-msg**:
- Enforce Conventional Commits format

**Pre-push**:
- Circular dependency checks
- Full test coverage
- Build verification
- Optional deep secret scan

### Implementation

Using Husky v9 for hook management with scripts in `scripts/hooks/`:
- `check-file-size.js`: Enforces 500-line limit
- `check-documentation.js`: Ensures docs in `docs/` directory
- `detect-languages.js`: Auto-detects project languages

### Bypass Policy

Hooks can be bypassed with `--no-verify` ONLY:
- In emergencies
- With explicit approval
- With follow-up issue created

### Benefits

- Prevents bad code from entering repository
- Catches issues early (shift-left approach)
- Reduces code review time
- Ensures consistency

---

## Decision Template

For future ADRs, use this template:

```markdown
## ADR-XXX: [Title]

**Date**: YYYY-MM-DD

**Status**: [Proposed | Accepted | Deprecated | Superseded]

### Context

What is the issue we're addressing?

### Decision

What is the change we're making?

### Consequences

What becomes easier or harder as a result?

### Implementation

How will this be implemented?
```

---

## Review and Updates

These architectural decisions should be reviewed quarterly and updated as needed. Deprecated decisions should be marked but not removed to maintain history.

**Last Review**: 2026-01-07
**Next Review**: 2026-04-07
