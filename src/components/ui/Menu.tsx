import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/cn';
import { IconButton } from './Button';

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
  checked?: boolean;
}

interface ActionMenuProps {
  items: MenuItem[];
  label: string;
  trigger?: ReactNode;
  triggerIcon?: ReactNode;
  align?: 'start' | 'end';
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md';
}

export function ActionMenu({
  items,
  label,
  trigger,
  triggerIcon,
  align = 'end',
  className,
  buttonClassName,
  size = 'md',
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        (rootRef.current?.querySelector('button') as HTMLButtonElement | null)?.focus();
      }
    };
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
    });
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={cn('menu-anchor', className)} ref={rootRef}>
      {trigger ? (
        <span
          className="menu-anchor__custom"
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setOpen((value) => !value);
            }
          }}
        >
          {trigger}
        </span>
      ) : (
        <IconButton
          label={label}
          size={size}
          aria-haspopup="menu"
          aria-expanded={open}
          className={buttonClassName}
          onClick={() => setOpen((value) => !value)}
        >
          {triggerIcon ?? <MoreVertical size={18} />}
        </IconButton>
      )}
      {open && (
        <div
          className={cn('menu-popover', align === 'start' && 'menu-popover--start')}
          role="menu"
          aria-label={label}
          ref={menuRef}
          onKeyDown={(event) => {
            const buttons = Array.from(
              menuRef.current?.querySelectorAll<HTMLButtonElement>(
                'button:not([disabled])',
              ) ?? [],
            );
            const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              buttons[(current + 1) % buttons.length]?.focus();
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              buttons[(current - 1 + buttons.length) % buttons.length]?.focus();
            }
            if (event.key === 'Home') {
              event.preventDefault();
              buttons[0]?.focus();
            }
            if (event.key === 'End') {
              event.preventDefault();
              buttons[buttons.length - 1]?.focus();
            }
          }}
        >
          {items.map((item) => (
            <div key={item.id}>
              {item.separatorBefore && <div className="menu-separator" role="separator" />}
              <button
                type="button"
                role="menuitem"
                className={cn(
                  'menu-item',
                  item.danger && 'menu-item--danger',
                  item.checked && 'is-checked',
                )}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.icon && <span className="menu-item__icon">{item.icon}</span>}
                <span>{item.label}</span>
                {item.checked && (
                  <span className="menu-item__check" aria-hidden="true">
                    <Check size={14} />
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  items: MenuItem[];
  label: string;
  onClose: () => void;
}

export function ContextMenu({ position, items, label, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState(position);

  useEffect(() => {
    if (!position) {
      setAdjusted(null);
      return;
    }
    const width = 228;
    const estimatedHeight = items.length * 38 + 24;
    setAdjusted({
      x: Math.min(position.x, window.innerWidth - width - 12),
      y: Math.min(position.y, window.innerHeight - estimatedHeight - 12),
    });
  }, [position, items.length]);

  useEffect(() => {
    if (!position) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
    });
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [position, onClose]);

  if (!position || !adjusted) return null;

  return (
    <div
      className="menu-popover menu-popover--context"
      role="menu"
      aria-label={label}
      style={{ left: adjusted.x, top: adjusted.y }}
      ref={menuRef}
    >
      {items.map((item) => (
        <div key={item.id}>
          {item.separatorBefore && <div className="menu-separator" role="separator" />}
          <button
            type="button"
            role="menuitem"
            className={cn(
              'menu-item',
              item.danger && 'menu-item--danger',
              item.checked && 'is-checked',
            )}
            disabled={item.disabled}
            onClick={() => {
              onClose();
              item.onSelect?.();
            }}
          >
            {item.icon && <span className="menu-item__icon">{item.icon}</span>}
            <span>{item.label}</span>
            {item.checked && (
              <span className="menu-item__check" aria-hidden="true">
                <Check size={14} />
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
