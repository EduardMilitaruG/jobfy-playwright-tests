// Example unit tests for validation functions

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    test('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    test('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=value')).toBe(true);
    });

    test('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://invalid')).toBe(true); // URL constructor accepts ftp
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isEmptyObject', () => {
    const isEmptyObject = (obj) => {
      return Object.keys(obj).length === 0;
    };

    test('should return true for empty objects', () => {
      expect(isEmptyObject({})).toBe(true);
    });

    test('should return false for non-empty objects', () => {
      expect(isEmptyObject({ key: 'value' })).toBe(false);
      expect(isEmptyObject({ a: 1, b: 2 })).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    const sanitizeInput = (input) => {
      if (typeof input !== 'string') return '';
      return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .slice(0, 1000); // Limit length
    };

    test('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    test('should remove HTML characters', () => {
      expect(sanitizeInput('Hello<script>alert("xss")</script>')).toBe('Helloscriptalert("xss")/script');
    });

    test('should limit length', () => {
      const longString = 'a'.repeat(2000);
      expect(sanitizeInput(longString)).toHaveLength(1000);
    });

    test('should handle non-string input', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
    });
  });
});
