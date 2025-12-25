/**
 * Global type declarations for analytics
 * Supports both window and globalThis access patterns
 */

type VaFunction = (event: string, eventName: string, eventParams?: Record<string, unknown>) => void;

type GtagFunction = (
  command: 'config' | 'event' | 'js' | 'set' | 'consent',
  targetId: string | Date,
  config?: Record<string, unknown>
) => void;

declare global {
  /**
   * Window interface extensions (for window.* access)
   */
  interface Window {
    va?: VaFunction;
    gtag?: GtagFunction;
  }

  /**
   * Global variables (for globalThis.* access)
   * Using var is required for global declarations
   */
  var va: VaFunction | undefined;
  var gtag: GtagFunction | undefined;
}

// Export types to make this a module (required for global augmentation)
export type { VaFunction, GtagFunction };
