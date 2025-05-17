"use client";

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    // This ensures that localStorage is only accessed on the client side
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        // If no item exists in localStorage, set the initialValue there
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        // No need to setStoredValue here, as it's already initialized with initialValue
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // In case of error, storedValue remains initialValue
    }
  // Only re-run the effect if key or initialValue changes (though typically they don't)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); 

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
