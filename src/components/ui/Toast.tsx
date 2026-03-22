import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

type ToastContextValue = {
  show: (toast: Omit<ToastItem, 'id'> & { durationMs?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<ToastItem, 'id'> & { durationMs?: number }) => {
      const id = crypto.randomUUID();
      const durationMs = toast.durationMs ?? 3500;

      setToasts((prev) => [{ id, type: toast.type, title: toast.title, message: toast.message }, ...prev].slice(0, 5));

      window.setTimeout(() => remove(id), durationMs);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, title) => show({ type: 'success', message, title }),
      error: (message, title) => show({ type: 'error', message, title, durationMs: 6000 }),
      info: (message, title) => show({ type: 'info', message, title }),
    }),
    [show]
  );

  const typeStyles: Record<ToastType, string> = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`border rounded-xl shadow-sm px-4 py-3 ${typeStyles[t.type]}`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-semibold leading-5">{t.title}</p>}
                <p className="text-sm leading-5 break-words">{t.message}</p>
              </div>
              <button
                className="p-1 rounded-md hover:bg-black/5 transition-colors"
                onClick={() => remove(t.id)}
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

