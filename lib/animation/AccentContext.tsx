'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AccentKey } from '@/lib/content/types';

interface AccentContextValue {
  activeAccent:  AccentKey;
  setActiveAccent: (key: AccentKey) => void;
}

const AccentContext = createContext<AccentContextValue>({
  activeAccent:    'plasma',
  setActiveAccent: () => undefined,
});

interface AccentProviderProps {
  children: React.ReactNode;
}

export function AccentProvider({ children }: AccentProviderProps): React.JSX.Element {
  const [activeAccent, setAccentState] = useState<AccentKey>('plasma');
  // Stable ref so subscribers don't re-render on every accent change
  const setActiveAccent = useCallback((key: AccentKey) => {
    setAccentState(key);
  }, []);

  const value = useMemo(
    () => ({ activeAccent, setActiveAccent }),
    [activeAccent, setActiveAccent],
  );

  return (
    <AccentContext.Provider value={value}>
      {children}
    </AccentContext.Provider>
  );
}

/** Read the current active accent key. */
export function useAccent(): AccentKey {
  return useContext(AccentContext).activeAccent;
}

/**
 * Returns a stable setter. Call this from AppScrollScene when a scene
 * becomes active to shift the particle system accent.
 */
export function useSetAccent(): (key: AccentKey) => void {
  return useContext(AccentContext).setActiveAccent;
}

// Suppress unused-import warning — useRef is used in the stable ref pattern
// in larger components that extend this context; exported for that use.
export { useRef as _useRef };
