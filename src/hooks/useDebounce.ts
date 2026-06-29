// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

// Returns `value` but only AFTER it has stopped changing for `delayMs`.
// Generic <T> so it debounces strings, numbers, objects — anything.
export function useDebounce<T>(value: T, delayMs = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delayMs);
        // Cleanup runs before the next effect (i.e. on the next keystroke):
        // it cancels the pending timer, so only a PAUSE lets the value through.
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}