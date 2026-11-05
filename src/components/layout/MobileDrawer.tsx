import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useUi } from '../../state/UiContext';
import { Sidebar } from './Sidebar';
import { IconButton } from '../ui/Button';

export function MobileDrawer() {
  const { mobileNavOpen, setMobileNavOpen } = useUi();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  if (!mobileNavOpen) return null;

  const close = () => setMobileNavOpen(false);

  return createPortal(
    <div className="drawer-layer">
      <button
        type="button"
        className="drawer-scrim"
        aria-label="Закрыть навигацию"
        onClick={close}
      />
      <div
        className="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Навигация Messthon"
      >
        <IconButton
          label="Закрыть навигацию"
          className="mobile-drawer__close"
          size="sm"
          ref={closeRef}
          onClick={close}
        >
          <X size={18} />
        </IconButton>
        <Sidebar variant="drawer" onNavigate={close} />
      </div>
    </div>,
    document.body,
  );
}
