// Example unit tests for string utility functions

describe('String Utilities', () => {
  describe('capitalize', () => {
    // Function to test
    const capitalize = (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    test('should capitalize first letter of a word', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    test('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });

    test('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    test('should lowercase rest of string', () => {
      expect(capitalize('hELLO')).toBe('Hello');
    });

    test('should handle null/undefined', () => {
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
    });
  });

  describe('truncate', () => {
    const truncate = (str, maxLength = 50) => {
      if (!str || str.length <= maxLength) return str;
      return str.slice(0, maxLength) + '...';
    };

    test('should truncate long strings', () => {
      const longString = 'This is a very long string that should be truncated';
      expect(truncate(longString, 20)).toBe('This is a very long ...');
    });

    test('should not truncate short strings', () => {
      expect(truncate('Short', 20)).toBe('Short');
    });

    test('should use default max length', () => {
      const str = 'a'.repeat(100);
      expect(truncate(str)).toHaveLength(53); // 50 + '...'
    });
  });

  describe('slugify', () => {
    const slugify = (str) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    test('should convert string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Software Engineer')).toBe('software-engineer');
    });

    test('should remove special characters', () => {
      expect(slugify('Hello@World!')).toBe('helloworld');
    });

    test('should handle multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    test('should trim dashes', () => {
      expect(slugify('-Hello World-')).toBe('hello-world');
    });
  });
});
