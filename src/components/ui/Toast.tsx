import { createPortal } from 'react-dom';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useUi } from '../../state/UiContext';
import { cn } from '../../lib/cn';
import type { ToastTone } from '../../types';

const ICONS: Record<ToastTone, typeof Info> = {
  neutral: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: XCircle,
};

export function ToastViewport() {
  const { toasts, dismissToast } = useUi();

  if (!toasts.length) return null;

  return createPortal(
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.tone];
        return (
          <div className={cn('toast', `toast--${toast.tone}`)} key={toast.id} role="status">
            <span className="toast__icon">
              <Icon size={19} />
            </span>
            <div className="toast__copy">
              <strong>{toast.title}</strong>
              {toast.description && <span>{toast.description}</span>}
            </div>
            <button
              type="button"
              className="toast__close"
              aria-label="Закрыть уведомление"
              onClick={() => dismissToast(toast.id)}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
