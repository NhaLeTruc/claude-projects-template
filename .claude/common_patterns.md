# Common Patterns

This document contains reusable code patterns and best practices for common scenarios in this project.

## Table of Contents

1. [Service Layer Patterns](#service-layer-patterns)
2. [Repository Patterns](#repository-patterns)
3. [API Controller Patterns](#api-controller-patterns)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Validation Patterns](#validation-patterns)
6. [Testing Patterns](#testing-patterns)
7. [Async Patterns](#async-patterns)
8. [Configuration Patterns](#configuration-patterns)

---

## Service Layer Patterns

### Basic Service Pattern

```typescript
export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger
  ) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    this.logger.info('Creating user', { email: data.email });

    // Validate
    this.validateUserData(data);

    // Check uniqueness
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('User already exists with this email');
    }

    // Create user
    const user = await this.userRepository.create(data);

    // Side effects
    await this.emailService.sendWelcome(user.email);

    this.logger.info('User created', { userId: user.id });
    return user;
  }

  private validateUserData(data: CreateUserDTO): void {
    if (!data.email || !data.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }
    if (!data.name || data.name.length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }
  }
}
```

### Service with Transaction Pattern

```typescript
export class OrderService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService,
    private readonly db: IDatabase
  ) {}

  async createOrder(data: CreateOrderDTO): Promise<Order> {
    return this.db.transaction(async (tx) => {
      // Reserve inventory
      await this.inventoryService.reserve(data.items, tx);

      // Process payment
      const payment = await this.paymentService.charge(
        data.paymentMethod,
        data.total
      );

      // Create order
      const order = await this.orderRepository.create(
        {
          ...data,
          paymentId: payment.id,
          status: 'confirmed',
        },
        tx
      );

      return order;
    });
  }
}
```

---

## Repository Patterns

### Basic CRUD Repository

```typescript
export class UserRepository implements IUserRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.queryOne<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return row ? this.mapToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.queryOne<UserRow>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return row ? this.mapToUser(row) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const id = generateId();
    const now = new Date();

    await this.db.execute(
      'INSERT INTO users (id, email, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, data.email, data.name, now, now]
    );

    return {
      id,
      email: data.email,
      name: data.name,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    updates.push('updated_at = ?');
    values.push(new Date());
    values.push(id);

    await this.db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    let query = 'SELECT * FROM users WHERE 1=1';
    const values: any[] = [];

    if (filters?.email) {
      query += ' AND email LIKE ?';
      values.push(`%${filters.email}%`);
    }
    if (filters?.name) {
      query += ' AND name LIKE ?';
      values.push(`%${filters.name}%`);
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      values.push(filters.limit);
    }
    if (filters?.offset) {
      query += ' OFFSET ?';
      values.push(filters.offset);
    }

    const rows = await this.db.query<UserRow>(query, values);
    return rows.map(row => this.mapToUser(row));
  }

  private mapToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

---

## API Controller Patterns

### REST Controller Pattern

```typescript
export class UserController {
  constructor(private readonly userService: UserService) {}

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);

      if (!user) {
        throw new NotFoundError('User', id);
      }

      res.json({
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, pageSize = 20, email, name } = req.query;

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const users = await this.userService.findAll({
        email: email as string,
        name: name as string,
        limit,
        offset,
      });

      const total = await this.userService.count({
        email: email as string,
        name: name as string,
      });

      res.json({
        data: users,
        meta: {
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total,
            totalPages: Math.ceil(total / Number(pageSize)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);

      res.status(201).json({
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);

      res.json({
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```

---

## Error Handling Patterns

### Custom Error Hierarchy

```typescript
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
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
  constructor(message: string, public readonly field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}
```

### Error Handling Middleware

```typescript
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle known errors
  if (error instanceof ApplicationError) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  // Handle validation errors (from libraries)
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        message: error.message,
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
```

---

## Validation Patterns

### DTO Validation Pattern

```typescript
import { z } from 'zod';

// Define schema
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(18, 'Must be at least 18 years old').optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

// Validation function
export function validateCreateUser(data: unknown): CreateUserDTO {
  try {
    return CreateUserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(firstError.message, firstError.path.join('.'));
    }
    throw error;
  }
}

// Middleware usage
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Route usage
router.post('/users', validateRequest(CreateUserSchema), userController.createUser);
```

---

## Testing Patterns

### Unit Test Pattern

```typescript
describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    mockEmailService = {
      sendWelcome: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    userService = new UserService(
      mockRepository,
      mockEmailService,
      mockLogger
    );
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const expectedUser = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(expectedUser);
      mockEmailService.sendWelcome.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockRepository.create).toHaveBeenCalledWith(userData);
      expect(mockEmailService.sendWelcome).toHaveBeenCalledWith(userData.email);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
      };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow(ValidationError);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcome).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if user exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };
      mockRepository.findByEmail.mockResolvedValue({
        id: '456',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow(ConflictError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Test Pattern

```typescript
describe('User API Integration Tests', () => {
  let app: Express;
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = createApp(testDb);
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clear();
  });

  describe('POST /api/users', () => {
    it('should create user and return 201', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body.data).toMatchObject({
        email: userData.email,
        name: userData.name,
      });
      expect(response.body.data.id).toBeDefined();

      // Verify in database
      const user = await testDb.query('SELECT * FROM users WHERE id = ?', [
        response.body.data.id,
      ]);
      expect(user).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      // Act
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          name: 'Test User',
        })
        .expect(400);

      // Assert
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
```

---

## Async Patterns

### Parallel Execution Pattern

```typescript
async function fetchUserData(userId: string): Promise<UserData> {
  // Execute multiple async operations in parallel
  const [user, orders, preferences] = await Promise.all([
    userRepository.findById(userId),
    orderRepository.findByUserId(userId),
    preferencesRepository.findByUserId(userId),
  ]);

  if (!user) {
    throw new NotFoundError('User', userId);
  }

  return {
    user,
    orders,
    preferences,
  };
}
```

### Sequential with Error Handling

```typescript
async function processOrder(orderId: string): Promise<void> {
  try {
    // Step 1: Validate order
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    // Step 2: Charge payment
    const payment = await paymentService.charge(order);

    // Step 3: Update order status
    await orderRepository.update(orderId, {
      status: 'paid',
      paymentId: payment.id,
    });

    // Step 4: Send confirmation
    await emailService.sendOrderConfirmation(order);
  } catch (error) {
    logger.error('Failed to process order', { orderId, error });
    throw error;
  }
}
```

### Retry Pattern

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      logger.warn('Operation failed, retrying', {
        attempt,
        maxRetries,
        error: error.message,
      });

      if (attempt < maxRetries) {
        await sleep(delayMs * attempt); // Exponential backoff
      }
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Configuration Patterns

### Environment Configuration

```typescript
import * as dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    apiKey: string;
    from: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

export const config: Config = {
  port: parseInt(getEnvVar('PORT', '3000'), 10),
  database: {
    host: getEnvVar('DB_HOST'),
    port: parseInt(getEnvVar('DB_PORT', '5432'), 10),
    name: getEnvVar('DB_NAME'),
    user: getEnvVar('DB_USER'),
    password: getEnvVar('DB_PASSWORD'),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  },
  email: {
    apiKey: getEnvVar('EMAIL_API_KEY'),
    from: getEnvVar('EMAIL_FROM'),
  },
};
```

---

## Summary

These patterns provide tested, reusable solutions for common scenarios. When implementing new features:

1. Check if a pattern exists for your use case
2. Follow the established pattern
3. Add new patterns as they emerge
4. Keep patterns simple and focused

For questions or pattern suggestions, discuss with the team.
