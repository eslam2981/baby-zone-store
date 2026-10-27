// Custom hook managing floating toast notification queue with auto-dismiss timers
import { useState, useCallback } from 'react';

export function useToasts(defaultDuration = 3800) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = defaultDuration) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, [defaultDuration]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    addToast,
    removeToast
  };
}
