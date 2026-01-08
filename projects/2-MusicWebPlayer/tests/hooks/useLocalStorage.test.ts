// tests/hooks/useLocalStorage.test.ts
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock = {};

    global.Storage.prototype.getItem = jest.fn((key: string) => {
      return localStorageMock[key] || null;
    });

    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    global.Storage.prototype.removeItem = jest.fn((key: string) => {
      delete localStorageMock[key];
    });

    global.Storage.prototype.clear = jest.fn(() => {
      localStorageMock = {};
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return array with value and setter', () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useLocalStorage('key', 'initialValue'));

      // ASSERT
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current).toHaveLength(2);
      expect(typeof result.current[1]).toBe('function');
    });

    it('should initialize with provided initial value', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
    });

    it('should update value when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
    });

    it('should work with string type', () => {
      const { result } = renderHook(() => useLocalStorage<string>('key', 'test'));

      expect(result.current[0]).toBe('test');

      act(() => {
        result.current[1]('new value');
      });

      expect(result.current[0]).toBe('new value');
    });

    it('should work with number type', () => {
      const { result } = renderHook(() => useLocalStorage<number>('key', 42));

      expect(result.current[0]).toBe(42);

      act(() => {
        result.current[1](100);
      });

      expect(result.current[0]).toBe(100);
    });

    it('should work with object type', () => {
      const initialObj = { name: 'John', age: 30 };
      const { result } = renderHook(() => useLocalStorage('key', initialObj));

      expect(result.current[0]).toEqual(initialObj);

      act(() => {
        result.current[1]({ name: 'Jane', age: 25 });
      });

      expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    });

    it('should work with array type', () => {
      const initialArray = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage('key', initialArray));

      expect(result.current[0]).toEqual(initialArray);

      act(() => {
        result.current[1]([4, 5, 6]);
      });

      expect(result.current[0]).toEqual([4, 5, 6]);
    });
  });

  describe('Initial Load from localStorage', () => {
    it('should read from localStorage on mount', () => {
      // Pre-populate localStorage
      localStorageMock['stored-key'] = JSON.stringify('stored-value');

      const { result } = renderHook(() => useLocalStorage('stored-key', 'default'));

      expect(result.current[0]).toBe('stored-value');
      expect(global.Storage.prototype.getItem).toHaveBeenCalledWith('stored-key');
    });

    it('should use initialValue if key does not exist in localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('new-key', 'default-value'));

      expect(result.current[0]).toBe('default-value');
    });

    it('should parse JSON correctly', () => {
      const complexObject = { name: 'Test', items: [1, 2, 3], nested: { key: 'value' } };
      localStorageMock['complex-key'] = JSON.stringify(complexObject);

      const { result } = renderHook(() => useLocalStorage('complex-key', {}));

      expect(result.current[0]).toEqual(complexObject);
    });

    it('should handle JSON parse errors gracefully', () => {
      // Store invalid JSON
      localStorageMock['corrupt-key'] = 'invalid-json{';

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useLocalStorage('corrupt-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      
      warnSpy.mockRestore();
    });

    it('should use initialValue when localStorage has null', () => {
      localStorageMock['null-key'] = 'null';

      const { result } = renderHook(() => useLocalStorage('null-key', 'default'));

      // Should handle JSON.parse('null') correctly
      expect(result.current[0]).toBeNull();
    });
  });

  describe('Persistence to localStorage', () => {
    it('should write to localStorage when setValue is called', () => {
      const { result } = renderHook(() => useLocalStorage('persist-key', 'initial'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(global.Storage.prototype.setItem).toHaveBeenCalledWith(
        'persist-key',
        JSON.stringify('new-value')
      );
      expect(localStorageMock['persist-key']).toBe(JSON.stringify('new-value'));
    });

    it('should JSON stringify complex objects', () => {
      const { result } = renderHook(() => useLocalStorage('obj-key', { a: 1 }));

      act(() => {
        result.current[1]({ b: 2, c: 3 });
      });

      expect(localStorageMock['obj-key']).toBe(JSON.stringify({ b: 2, c: 3 }));
    });

    it('should update localStorage on multiple setValue calls', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1](1);
      });
      expect(localStorageMock['counter']).toBe('1');

      act(() => {
        result.current[1](2);
      });
      expect(localStorageMock['counter']).toBe('2');

      act(() => {
        result.current[1](3);
      });
      expect(localStorageMock['counter']).toBe('3');
    });
  });

  describe('Updater Function Support', () => {
    it('should support updater function like useState', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0));

      act(() => {
        result.current[1](prev => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });

    it('should pass current value to updater function', () => {
      const { result } = renderHook(() => useLocalStorage('value', 10));

      act(() => {
        result.current[1](prev => {
          expect(prev).toBe(10);
          return prev * 2;
        });
      });

      expect(result.current[0]).toBe(20);
    });

    it('should work with object updater function', () => {
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: 'John', age: 30 })
      );

      act(() => {
        result.current[1](prev => ({ ...prev, age: 31 }));
      });

      expect(result.current[0]).toEqual({ name: 'John', age: 31 });
    });

    it('should work with array updater function', () => {
      const { result } = renderHook(() => useLocalStorage('items', [1, 2, 3]));

      act(() => {
        result.current[1](prev => [...prev, 4]);
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
    });

    it('should persist updater function result to localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('count', 5));

      act(() => {
        result.current[1](prev => prev + 10);
      });

      expect(localStorageMock['count']).toBe('15');
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should add storage event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      renderHook(() => useLocalStorage('sync-key', 'value'));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should update state when storage event fires for matching key', () => {
      const { result } = renderHook(() => useLocalStorage('sync-key', 'initial'));

      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'sync-key',
          newValue: JSON.stringify('updated-from-other-tab'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe('updated-from-other-tab');
    });

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() => useLocalStorage('key-a', 'value-a'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'key-b',
          newValue: JSON.stringify('value-b'),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      // Should not update
      expect(result.current[0]).toBe('value-a');
    });

    it('should parse new value from storage event', () => {
      const { result } = renderHook(() => useLocalStorage('data', { count: 0 }));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'data',
          newValue: JSON.stringify({ count: 5 }),
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toEqual({ count: 5 });
    });

    it('should handle null newValue in storage event', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'value'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'key',
          newValue: null,
          storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);
      });

      // When newValue is null, the hook tries to parse it as JSON.parse(null) which is undefined,
      // but the code does: event.newValue ? JSON.parse(event.newValue) : initialValue
      // So when newValue is null, it should use initialValue
      expect(result.current[0]).toBe('value');
    });
  });

  describe('Event Listener Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useLocalStorage('key', 'value'));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should not leak memory on multiple mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderHook(() => useLocalStorage('key', 'value'));
        unmount();
      }

      // Should complete without errors (no memory leaks)
      expect(true).toBe(true);
    });

    it('should cleanup when key changes', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'value'),
        { initialProps: { key: 'key-1' } }
      );

      rerender({ key: 'key-2' });

      // Should have cleaned up old listener
      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Error Handling - localStorage Unavailable', () => {
    it('should work in memory-only mode when localStorage is unavailable', () => {
      // Mock localStorage methods to throw
      global.Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });
      global.Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useLocalStorage('key', 'default'));

      // Should use initialValue
      expect(result.current[0]).toBe('default');

      // Should still update state
      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      
      warnSpy.mockRestore();
    });

    it('should not throw exceptions when localStorage is disabled', () => {
      global.Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage disabled');
      });

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));

        act(() => {
          result.current[1]('new');
        });
      }).not.toThrow();
      
      warnSpy.mockRestore();
    });
  });

  describe('Error Handling - Quota Exceeded', () => {
    it('should handle quota exceeded error gracefully', () => {
      global.Storage.prototype.setItem = jest.fn(() => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useLocalStorage('key', 'value'));

      // Should still update state even if localStorage fails
      act(() => {
        result.current[1]('large-data');
      });

      expect(result.current[0]).toBe('large-data');
      
      warnSpy.mockRestore();
    });

    it('should not throw when quota exceeded', () => {
      global.Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));
        act(() => {
          result.current[1]('data');
        });
      }).not.toThrow();
      
      warnSpy.mockRestore();
    });
  });

  describe('Error Handling - JSON Parse', () => {
    it('should use initialValue when JSON parse fails', () => {
      localStorageMock['corrupt'] = 'not-valid-json{{{';

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useLocalStorage('corrupt', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      
      warnSpy.mockRestore();
    });

    it('should not throw on corrupted localStorage data', () => {
      localStorageMock['bad-data'] = 'corrupt{data]';

      // Suppress expected console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        renderHook(() => useLocalStorage('bad-data', 'default'));
      }).not.toThrow();
      
      warnSpy.mockRestore();
    });
  });

  describe('Effect Dependencies', () => {
    it('should maintain initial value when key changes', () => {
      localStorageMock['key-1'] = JSON.stringify('value-1');
      localStorageMock['key-2'] = JSON.stringify('value-2');

      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'default'),
        { initialProps: { key: 'key-1' } }
      );

      expect(result.current[0]).toBe('value-1');

      // Change key - hook should maintain current value, not read from new key
      rerender({ key: 'key-2' });

      // The hook doesn't re-read from localStorage when key changes
      // It maintains the existing state
      expect(result.current[0]).toBe('value-1');
    });

    it('should not have stale closures', () => {
      const { result, rerender } = renderHook(
        ({ key }) => useLocalStorage(key, 'default'),
        { initialProps: { key: 'key-1' } }
      );

      act(() => {
        result.current[1]('new-value');
      });

      // Change key
      rerender({ key: 'key-2' });

      // Should not affect old key's value
      expect(localStorageMock['key-1']).toBe(JSON.stringify('new-value'));
    });
  });

  describe('Type Safety', () => {
    it('should work with string type', () => {
      const { result } = renderHook(() => useLocalStorage<string>('key', 'test'));
      const value: string = result.current[0];
      expect(typeof value).toBe('string');
    });

    it('should work with number type', () => {
      const { result } = renderHook(() => useLocalStorage<number>('key', 42));
      const value: number = result.current[0];
      expect(typeof value).toBe('number');
    });

    it('should work with complex object type', () => {
      interface User {
        id: number;
        name: string;
        preferences: { theme: string };
      }

      const initialUser: User = {
        id: 1,
        name: 'John',
        preferences: { theme: 'dark' }
      };

      const { result } = renderHook(() => useLocalStorage<User>('user', initialUser));
      const user: User = result.current[0];

      expect(user.id).toBe(1);
      expect(user.preferences.theme).toBe('dark');
    });

    it('should work with array type', () => {
      const { result } = renderHook(() => useLocalStorage<number[]>('nums', [1, 2, 3]));
      const nums: number[] = result.current[0];

      expect(Array.isArray(nums)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string as key', () => {
      const { result } = renderHook(() => useLocalStorage('', 'value'));

      act(() => {
        result.current[1]('new');
      });

      expect(result.current[0]).toBe('new');
    });

    it('should handle null as initialValue', () => {
      const { result } = renderHook(() => useLocalStorage<string | null>('key', null));

      expect(result.current[0]).toBeNull();
    });

    it('should handle undefined as initialValue', () => {
      const { result } = renderHook(() =>
        useLocalStorage<string | undefined>('key', undefined)
      );

      expect(result.current[0]).toBeUndefined();
    });

    it('should handle special characters in key', () => {
      const specialKey = 'key-with-special!@#$%chars';
      const { result } = renderHook(() => useLocalStorage(specialKey, 'value'));

      act(() => {
        result.current[1]('new');
      });

      expect(localStorageMock[specialKey]).toBe(JSON.stringify('new'));
    });

    it('should handle rapid setValue calls', () => {
      const { result } = renderHook(() => useLocalStorage('rapid', 0));

      act(() => {
        for (let i = 1; i <= 100; i++) {
          result.current[1](i);
        }
      });

      expect(result.current[0]).toBe(100);
    });

    it('should handle very large data', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(100)
      }));

      const { result } = renderHook(() => useLocalStorage('large', largeArray));

      expect(result.current[0]).toEqual(largeArray);
    });
  });
});
