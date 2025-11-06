'use client';

import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';

interface UseFormAutoSaveOptions {
  formKey: string;
  autosaveInterval?: number; // milliseconds
  enabled?: boolean;
}

export function useFormAutoSave<T extends Record<string, any>>({
  formKey,
  autosaveInterval = 30000, // 30 seconds
  enabled = true,
}: UseFormAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const saveToLocalStorage = (data: T) => {
    try {
      localStorage.setItem(formKey, JSON.stringify(data));
      setLastSaved(new Date());
      setIsDirty(false);
      message.success('Koncept uložen', 1);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      message.error('Chyba při ukládání konceptu');
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = (): T | null => {
    try {
      const saved = localStorage.getItem(formKey);
      if (saved) {
        return JSON.parse(saved) as T;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(formKey);
      setLastSaved(null);
      setIsDirty(false);
      message.info('Koncept smazán');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  // Auto-save with interval
  const startAutoSave = (data: T) => {
    if (!enabled) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      if (isDirty) {
        saveToLocalStorage(data);
      }
    }, autosaveInterval);
  };

  // Check if draft exists
  const hasDraft = (): boolean => {
    return localStorage.getItem(formKey) !== null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    startAutoSave,
    hasDraft,
    lastSaved,
    isDirty,
    setIsDirty,
  };
}
