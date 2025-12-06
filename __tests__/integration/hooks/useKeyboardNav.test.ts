import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardNav } from '@/lib/hooks/useKeyboardNav';

describe('useKeyboardNav', () => {
  it('should call handler on matching key', () => {
    const handleArrowUp = vi.fn();
    const handleArrowDown = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        ArrowUp: handleArrowUp,
        ArrowDown: handleArrowDown,
      })
    );

    // Simulate ArrowUp key
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    window.dispatchEvent(event);

    expect(handleArrowUp).toHaveBeenCalledTimes(1);
    expect(handleArrowDown).not.toHaveBeenCalled();
  });

  it('should call correct handler for different keys', () => {
    const handleEnter = vi.fn();
    const handleEscape = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        Enter: handleEnter,
        Escape: handleEscape,
      })
    );

    // Simulate Enter key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(handleEnter).toHaveBeenCalledTimes(1);

    // Simulate Escape key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when disabled', () => {
    const handler = vi.fn();

    renderHook(() =>
      useKeyboardNav(
        {
          Enter: handler,
        },
        false // disabled
      )
    );

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    window.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler for unregistered keys', () => {
    const handler = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        Enter: handler,
      })
    );

    // Simulate a key that's not registered
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));

    expect(handler).not.toHaveBeenCalled();
  });

  it('should clean up event listeners on unmount', () => {
    const handler = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useKeyboardNav({
        Enter: handler,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should update handlers when keyMap changes', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(({ keyMap }) => useKeyboardNav(keyMap), {
      initialProps: { keyMap: { Enter: handler1 } },
    });

    // First handler should be called
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(handler1).toHaveBeenCalledTimes(1);

    // Update keyMap
    rerender({ keyMap: { Enter: handler2 } });

    // Second handler should be called
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
