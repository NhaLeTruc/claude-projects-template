# Project Conventions

This document outlines the coding standards and conventions for this project.

## Table of Contents

1. [TypeScript/JavaScript Conventions](#typescriptjavascript-conventions)
2. [Python Conventions](#python-conventions)
3. [Java Conventions](#java-conventions)
4. [Naming Conventions](#naming-conventions)
5. [Code Organization](#code-organization)
6. [Error Handling](#error-handling)
7. [Testing Conventions](#testing-conventions)
8. [Documentation Standards](#documentation-standards)

## TypeScript/JavaScript Conventions

### Code Style

- Use TypeScript for all new code
- Always declare explicit types for function parameters and return values
- Use `const` by default, `let` only when reassignment is needed
- Never use `var`
- Prefer arrow functions for callbacks and short functions
- Use template literals instead of string concatenation

### Example

```typescript
// ✅ Good
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Bad
function calculateTotal(items) {
  var sum = 0;
  for (var i = 0; i < items.length; i++) {
    sum = sum + items[i].price;
  }
  return sum;
}
```

### Interfaces vs Types

- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, and mapped types
- Prefix interfaces with `I` only for abstract contracts (e.g., `IUserRepository`)

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

type UserId = string;
type UserRole = 'admin' | 'user' | 'guest';

interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

### Async/Await

- Always use `async/await` over raw promises
- Handle errors with try-catch blocks
- Avoid nested callbacks

```typescript
// ✅ Good
async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    throw error;
  }
}

// ❌ Bad
function fetchUserData(userId) {
  return userRepository.findById(userId).then(user => {
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }).catch(error => {
    console.log(error);
    throw error;
  });
}
```

## Python Conventions

### Code Style

- Follow PEP 8 style guide
- Use type hints for all function signatures
- Maximum line length: 100 characters
- Use docstrings for all public functions and classes
- Prefer list comprehensions over map/filter for simple operations

### Example

```python
# ✅ Good
from typing import List, Optional

def calculate_total(items: List[dict]) -> float:
    """
    Calculate the total price of items in the cart.

    Args:
        items: List of cart items with 'price' key

    Returns:
        Total price as float
    """
    return sum(item['price'] for item in items)

# ❌ Bad
def calculate_total(items):
    total = 0
    for item in items:
        total = total + item['price']
    return total
```

### Class Design

- Use dataclasses for simple data containers
- Implement `__repr__` for debugging
- Use property decorators for computed attributes

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    id: str
    email: str
    name: str
    created_at: datetime

    @property
    def display_name(self) -> str:
        return self.name or self.email.split('@')[0]
```

## Java Conventions

### Code Style

- Follow Google Java Style Guide
- Maximum line length: 120 characters
- Use meaningful variable names
- Always use braces for control structures
- Prefer composition over inheritance

### Example

```java
// ✅ Good
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public User createUser(UserData data) throws ValidationException {
        validateUserData(data);
        User user = userRepository.save(data);
        emailService.sendWelcome(user.getEmail());
        return user;
    }

    private void validateUserData(UserData data) throws ValidationException {
        if (data.getEmail() == null || data.getEmail().isEmpty()) {
            throw new ValidationException("Email is required");
        }
    }
}
```

## Naming Conventions

### General Rules

| Element | Convention | Example |
|---------|-----------|---------|
| **TypeScript/JavaScript** | | |
| Variables | camelCase | `userName`, `totalAmount` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_KEY` |
| Functions | camelCase | `calculateTotal`, `fetchUserData` |
| Classes | PascalCase | `UserService`, `PaymentProcessor` |
| Interfaces | PascalCase (I prefix for contracts) | `User`, `IUserRepository` |
| Types | PascalCase | `UserId`, `UserRole` |
| Enums | PascalCase | `UserStatus`, `PaymentMethod` |
| Files | kebab-case | `user-service.ts`, `payment-processor.ts` |
| **Python** | | |
| Variables | snake_case | `user_name`, `total_amount` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_KEY` |
| Functions | snake_case | `calculate_total`, `fetch_user_data` |
| Classes | PascalCase | `UserService`, `PaymentProcessor` |
| Files | snake_case | `user_service.py`, `payment_processor.py` |
| **Java** | | |
| Variables | camelCase | `userName`, `totalAmount` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_KEY` |
| Methods | camelCase | `calculateTotal`, `fetchUserData` |
| Classes | PascalCase | `UserService`, `PaymentProcessor` |
| Interfaces | PascalCase | `UserRepository`, `PaymentGateway` |
| Files | PascalCase | `UserService.java`, `PaymentProcessor.java` |

### Boolean Names

- Use positive names (avoid negatives)
- Start with `is`, `has`, `can`, `should`

```typescript
// ✅ Good
isValid, hasPermission, canEdit, shouldRetry

// ❌ Bad
notInvalid, noPermission, cantEdit, dontRetry
```

## Code Organization

### File Structure

```
src/
├── core/           # Business logic and domain models
│   ├── models/    # Data models
│   ├── services/  # Business services
│   └── utils/     # Core utilities
├── api/            # API endpoints and controllers
│   ├── routes/    # Route definitions
│   ├── controllers/ # Request handlers
│   └── middleware/ # API middleware
├── data/           # Data access layer
│   ├── repositories/ # Data repositories
│   └── entities/  # Database entities
└── config/         # Configuration files
```

### Module Boundaries

- Each module should have a clear responsibility
- Modules communicate through well-defined interfaces
- Avoid circular dependencies between modules
- Use dependency injection to manage cross-module dependencies

## Error Handling

### Custom Error Classes

```typescript
// TypeScript
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

```python
# Python
class UserNotFoundError(Exception):
    """Raised when a user is not found."""

    def __init__(self, user_id: str):
        super().__init__(f"User not found: {user_id}")
        self.user_id = user_id
```

### Error Handling Patterns

1. **Catch specific exceptions, not generic ones**
2. **Log errors with context**
3. **Don't swallow errors silently**
4. **Re-throw if you can't handle**

```typescript
// ✅ Good
try {
  await userService.createUser(userData);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  logger.error('Unexpected error creating user', { error, userData });
  return res.status(500).json({ error: 'Internal server error' });
}

// ❌ Bad
try {
  await userService.createUser(userData);
} catch (error) {
  // Silent failure
}
```

## Testing Conventions

### Test File Organization

- Mirror source structure in tests directory
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

```typescript
// tests/unit/services/user.service.test.ts
import { UserService } from '@/services/user.service';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    userService = new UserService(mockRepository);
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      mockRepository.save.mockResolvedValue({ id: '123', ...userData });

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toMatchObject(userData);
      expect(mockRepository.save).toHaveBeenCalledWith(userData);
    });

    it('should throw ValidationError when email is missing', async () => {
      // Arrange
      const userData = { name: 'Test User' };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

### Test Coverage Goals

- Unit tests: 80% minimum
- Integration tests: Critical paths
- E2E tests: Happy paths and critical user journeys

## Documentation Standards

### Code Comments

- Use comments to explain **why**, not **what**
- Avoid redundant comments
- Keep comments up to date

```typescript
// ✅ Good
// Retry failed requests to handle transient network errors
const MAX_RETRIES = 3;

// ❌ Bad
// Set MAX_RETRIES to 3
const MAX_RETRIES = 3;
```

### Function Documentation

```typescript
/**
 * Calculates the total price including tax and shipping.
 *
 * @param items - Cart items to calculate total for
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param shippingCost - Fixed shipping cost
 * @returns Total price including all fees
 * @throws {ValidationError} If items array is empty
 */
function calculateTotal(
  items: CartItem[],
  taxRate: number,
  shippingCost: number
): number {
  // Implementation
}
```

## Summary

Following these conventions ensures:
- Consistent code style across the project
- Easier code reviews
- Better maintainability
- Reduced bugs
- Improved collaboration

For questions or suggestions, please discuss with the team.
