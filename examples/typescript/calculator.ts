/**
 * Calculator class demonstrating TypeScript best practices
 * - Explicit types
 * - Single responsibility
 * - Error handling
 */
export class Calculator {
  /**
   * Adds two numbers together
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtracts second number from first
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * Multiplies two numbers
   */
  multiply(a: number, b: number): number {
    return a * b;
  }

  /**
   * Divides first number by second
   * @throws {Error} When dividing by zero
   */
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  }

  /**
   * Calculates percentage of a number
   */
  percentage(value: number, percent: number): number {
    return (value * percent) / 100;
  }
}
