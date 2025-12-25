import { useCallback, useEffect } from 'react';

type KeyMap = {
  [key: string]: () => void;
};

/**
 * Hook para navegación por teclado
 *
 * @example
 * useKeyboardNav({
 *   'ArrowUp': () => setPrevItem(),
 *   'ArrowDown': () => setNextItem(),
 *   'Enter': () => selectItem(),
 * });
 */
export function useKeyboardNav(keyMap: KeyMap, enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const handler = keyMap[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    },
    [keyMap]
  );

  useEffect(() => {
    if (!enabled) return;

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
