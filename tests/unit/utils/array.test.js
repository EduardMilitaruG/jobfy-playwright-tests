// Example unit tests for array utility functions

describe('Array Utilities', () => {
  describe('unique', () => {
    const unique = (arr) => [...new Set(arr)];

    test('should remove duplicate values', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    test('should handle empty array', () => {
      expect(unique([])).toEqual([]);
    });

    test('should handle array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('chunk', () => {
    const chunk = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    test('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    test('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    test('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
    });
  });

  describe('groupBy', () => {
    const groupBy = (arr, key) => {
      return arr.reduce((groups, item) => {
        const groupKey = item[key];
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      }, {});
    };

    test('should group objects by key', () => {
      const jobs = [
        { id: 1, source: 'RemoteOK' },
        { id: 2, source: 'Tecnoempleo' },
        { id: 3, source: 'RemoteOK' }
      ];

      const grouped = groupBy(jobs, 'source');
      expect(grouped).toEqual({
        RemoteOK: [
          { id: 1, source: 'RemoteOK' },
          { id: 3, source: 'RemoteOK' }
        ],
        Tecnoempleo: [
          { id: 2, source: 'Tecnoempleo' }
        ]
      });
    });

    test('should handle empty array', () => {
      expect(groupBy([], 'key')).toEqual({});
    });
  });

  describe('sortBy', () => {
    const sortBy = (arr, key, order = 'asc') => {
      return [...arr].sort((a, b) => {
        if (order === 'asc') {
          return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
      });
    };

    test('should sort array by key in ascending order', () => {
      const items = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
      ];

      const sorted = sortBy(items, 'name');
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[2].name).toBe('Charlie');
    });

    test('should sort array by key in descending order', () => {
      const items = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
        { name: 'Charlie', age: 30 }
      ];

      const sorted = sortBy(items, 'age', 'desc');
      expect(sorted[0].age).toBe(35);
      expect(sorted[2].age).toBe(25);
    });
  });

  describe('filterJobs', () => {
    const filterJobs = (jobs, searchTerm, source = null) => {
      return jobs.filter(job => {
        const matchesSearch = !searchTerm ||
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSource = !source || job.source === source;

        return matchesSearch && matchesSource;
      });
    };

    const mockJobs = [
      { id: 1, title: 'Frontend Developer', company: 'TechCorp', source: 'RemoteOK' },
      { id: 2, title: 'Backend Engineer', company: 'StartupXYZ', source: 'Tecnoempleo' },
      { id: 3, title: 'Full Stack Developer', company: 'TechCorp', source: 'RemoteOK' }
    ];

    test('should filter jobs by search term', () => {
      const result = filterJobs(mockJobs, 'Frontend');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Frontend Developer');
    });

    test('should filter jobs by company', () => {
      const result = filterJobs(mockJobs, 'TechCorp');
      expect(result).toHaveLength(2);
    });

    test('should filter jobs by source', () => {
      const result = filterJobs(mockJobs, null, 'RemoteOK');
      expect(result).toHaveLength(2);
    });

    test('should filter jobs by search term and source', () => {
      const result = filterJobs(mockJobs, 'Developer', 'RemoteOK');
      expect(result).toHaveLength(2);
    });

    test('should return all jobs when no filters applied', () => {
      const result = filterJobs(mockJobs, null, null);
      expect(result).toHaveLength(3);
    });
  });
});
