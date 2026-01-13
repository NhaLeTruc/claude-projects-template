# Examples

This directory contains example code in multiple languages to demonstrate and test the project's setup.

## Purpose

These examples serve to:
- Verify that linters and formatters are configured correctly
- Test that the testing frameworks work as expected
- Demonstrate code quality standards enforced by the project
- Provide templates for writing new code

## Structure

```
examples/
├── typescript/         # TypeScript examples
│   └── calculator.ts   # Simple calculator class
├── python/            # Python examples
│   └── validator.py   # Email and password validator
└── java/              # Java examples
    └── StringUtils.java # String utility methods
```

## Running Examples

### TypeScript

Compile and test:
```bash
npm run build
npm run test -- tests/examples/typescript
```

Run linting:
```bash
npm run lint
```

### Python

Run tests:
```bash
pytest tests/examples/python/
```

Run linting:
```bash
pylint examples/python/*.py
```

Format code:
```bash
black examples/python/
```

### Java

Compile and test:
```bash
javac examples/java/StringUtils.java
javac -cp .:junit-platform-console-standalone.jar tests/examples/java/StringUtilsTest.java
```

Run Checkstyle:
```bash
java -jar checkstyle.jar -c .config/java/checkstyle.xml examples/java/
```

## Code Quality Standards

All examples follow the project's quality standards:

### TypeScript
- ✅ Explicit type annotations
- ✅ JSDoc comments for public methods
- ✅ Error handling where appropriate
- ✅ ESLint compliance
- ✅ Prettier formatting
- ✅ 100% test coverage

### Python
- ✅ Type hints for all functions
- ✅ Docstrings following Google style
- ✅ PEP 8 compliance
- ✅ Pylint compliance
- ✅ Black formatting
- ✅ Comprehensive unit tests

### Java
- ✅ Javadoc comments
- ✅ Final classes/methods where appropriate
- ✅ Proper encapsulation
- ✅ Checkstyle compliance
- ✅ JUnit 5 test coverage

## Test Coverage

All examples have comprehensive unit tests demonstrating:
- Happy path scenarios
- Edge cases
- Error handling
- Input validation

Expected test results:
- **TypeScript**: 18 passing tests
- **Python**: 14 passing tests
- **Java**: 20 passing tests

## Modifying Examples

When adding or modifying examples:

1. Follow the existing code style
2. Add comprehensive unit tests
3. Ensure all quality checks pass:
   ```bash
   npm run check:all
   ```
4. Update this README if adding new examples

## Learning Resources

These examples demonstrate:
- **Single Responsibility Principle**: Each class has one clear purpose
- **Error Handling**: Proper exception handling and validation
- **Type Safety**: Explicit types in all languages
- **Testing Best Practices**: AAA pattern (Arrange, Act, Assert)
- **Documentation**: Clear comments and docstrings
