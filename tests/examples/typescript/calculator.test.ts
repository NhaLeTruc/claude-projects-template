import { Calculator } from '../../../examples/typescript/calculator';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(calculator.add(-5, -3)).toBe(-8);
    });

    it('should add positive and negative numbers', () => {
      expect(calculator.add(10, -3)).toBe(7);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(calculator.subtract(10, 3)).toBe(7);
    });

    it('should handle negative results', () => {
      expect(calculator.subtract(3, 10)).toBe(-7);
    });
  });

  describe('multiply', () => {
    it('should multiply two positive numbers', () => {
      expect(calculator.multiply(4, 5)).toBe(20);
    });

    it('should multiply by zero', () => {
      expect(calculator.multiply(10, 0)).toBe(0);
    });

    it('should multiply negative numbers', () => {
      expect(calculator.multiply(-3, -4)).toBe(12);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should handle decimal results', () => {
      expect(calculator.divide(10, 3)).toBeCloseTo(3.333, 2);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });

  describe('percentage', () => {
    it('should calculate percentage of a number', () => {
      expect(calculator.percentage(100, 25)).toBe(25);
    });

    it('should calculate percentage greater than 100', () => {
      expect(calculator.percentage(50, 200)).toBe(100);
    });

    it('should handle zero percentage', () => {
      expect(calculator.percentage(100, 0)).toBe(0);
    });
  });
});
