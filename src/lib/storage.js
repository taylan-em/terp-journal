import { useState, useEffect } from 'react';

export function useStorage(key, fallback) {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {
      console.warn('Storage write failed for', key, e);
    }
  }, [data, key]);

  return [data, setData];
}
