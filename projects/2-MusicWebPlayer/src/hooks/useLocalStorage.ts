/**
 * University of La Laguna
 * School of Engineering and Technology
 * Degree in Computer Engineering
 * Final Degree Project (TFG)
 *
 * @author Fabián González Lence <alu0101549491@ull.edu.es>
 * @since January 8, 2026
 * @file src/hooks/useLocalStorage.ts
 * @desc Custom React hook for managing state synchronized with localStorage. It supports cross-tab
 *       synchronization, error handling, and follows the same API pattern as useState.
 * @see {@link https://github.com/alu0101549491/TFG-Fabian-Gonzalez-Lence/tree/main/projects/2-MusicWebPlayer}
 * @see {@link https://typescripttutorial.net}
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing state synchronized with localStorage.
 * @template T The type of value to store (must be JSON-serializable)
 * @param key The localStorage key under which to store the value
 * @param initialValue The default value to use if nothing is in localStorage
 * @returns A tuple with the stored value and a setter function (similar to useState)
 * @example
 * // Simple usage
 * const [name, setName] = useLocalStorage<string>('userName', 'Guest');
 * setName('John'); // Saves 'John' to localStorage under 'userName'
 *
 * // Array usage (playlist)
 * const [songs, setSongs] = useLocalStorage<Song[]>('playlist', []);
 * setSongs([...songs, newSong]); // Adds song and persists
 *
 * // Object usage
 * const [settings, setSettings] = useLocalStorage<Settings>('appSettings', defaultSettings);
 *
 * // Updater function
 * setSongs(prevSongs => [...prevSongs, newSong]);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    return readValue<T>(key, initialValue);
  });

  // Set up storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        // Only update if the change came from another tab/window
        try {
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  /**
   * Updates the stored value in both state and localStorage.
   * Uses useCallback for stability.
   * @param value New value or updater function
   */
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Handle updater function pattern
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Update state
        setStoredValue(valueToStore);

        // Update localStorage
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          // Handle quota exceeded or other localStorage errors
          console.warn(`Error saving to localStorage for key "${key}":`, error);

          // Optionally notify user about storage issues
          if (process.env.NODE_ENV === 'development') {
            console.warn('localStorage may be full or disabled. Data will not persist.');
          }
        }
      } catch (error) {
        console.warn(`Error in setValue for key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Reads and parses value from localStorage.
 * @template T The type of value to read
 * @param key The localStorage key
 * @param initialValue The default value if nothing is in localStorage
 * @returns Parsed value from localStorage, or initialValue if not found or error occurs
 */
function readValue<T>(key: string, initialValue: T): T {
  // Validate key
  if (!key || typeof key !== 'string') {
    return initialValue;
  }

  // Guard for non-browser environments
  if (typeof window === 'undefined' || !window.localStorage) {
    return initialValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    // Handle JSON parse errors or other issues
    console.warn(`Error reading localStorage key "${key}":`, error);

    // If there's an error, we might want to clear the bad data
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.warn(`Error removing corrupted data for key "${key}":`, removeError);
    }

    return initialValue;
  }
}
