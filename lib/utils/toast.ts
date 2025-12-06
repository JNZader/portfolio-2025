/**
 * Utilidad centralizada para notificaciones toast
 * Configuración consistente en toda la aplicación
 */
import toast from 'react-hot-toast';

const DEFAULT_POSITION = 'bottom-center' as const;
const SUCCESS_DURATION = 5000;
const ERROR_DURATION = 4000;

/**
 * Muestra una notificación de éxito
 */
export function showSuccess(message: string, duration = SUCCESS_DURATION) {
  return toast.success(message, {
    duration,
    position: DEFAULT_POSITION,
  });
}

/**
 * Muestra una notificación de error
 */
export function showError(message: string, duration = ERROR_DURATION) {
  return toast.error(message, {
    duration,
    position: DEFAULT_POSITION,
  });
}

/**
 * Muestra un toast de carga con promesa
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: DEFAULT_POSITION,
    }
  );
}

/**
 * Cierra todos los toasts activos
 */
export function dismissAll() {
  toast.dismiss();
}
