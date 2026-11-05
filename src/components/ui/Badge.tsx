import type { KeyboardEventHandler, ReactNode } from 'react';
import { Check, Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { AccountStatus, ProtocolId } from '../../types';

export { ProtocolBadge } from './Avatar';

interface StatusChipProps {
  status: AccountStatus;
  label?: string;
  className?: string;
}

const STATUS_LABELS: Record<AccountStatus, string> = {
  connected: 'Подключён',
  syncing: 'Синхронизация',
  disconnected: 'Отключён',
  error: 'Ошибка',
};

export function StatusChip({ status, label, className }: StatusChipProps) {
  return (
    <span
      className={cn('status-chip', `status-chip--${status}`, className)}
      title={label ?? STATUS_LABELS[status]}
    >
      <span className="status-chip__dot" aria-hidden="true" />
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

interface ToggleRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled = false,
  className,
  icon,
}: ToggleRowProps) {
  return (
    <label className={cn('toggle-row', disabled && 'is-disabled', className)}>
      {icon && <span className="toggle-row__icon">{icon}</span>}
      <span className="toggle-row__copy">
        <span className="toggle-row__title">{title}</span>
        {description && <span className="toggle-row__description">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className="switch"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </label>
  );
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  shortcut?: string;
  className?: string;
  onFocus?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Поиск',
  label,
  autoFocus = false,
  shortcut,
  className,
  onFocus,
  onKeyDown,
}: SearchFieldProps) {
  return (
    <div className={cn('search-field', className)}>
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
      {value ? (
        <button
          type="button"
          className="search-field__clear"
          aria-label="Очистить поиск"
          onClick={() => onChange('')}
        >
          <X size={14} />
        </button>
      ) : (
        shortcut && <kbd className="search-field__shortcut">{shortcut}</kbd>
      )}
    </div>
  );
}

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn('segmented', compact && 'segmented--compact', className)}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={cn('segmented__option', option.value === value && 'is-selected')}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}

interface TabsProps {
  tabs: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export function Tabs({ tabs, value, onChange, label, className }: TabsProps) {
  return (
    <div className={cn('tabs', className)} role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          type="button"
          className={cn('tabs__tab', tab.value === value && 'is-active')}
          role="tab"
          aria-selected={tab.value === value}
          key={tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface SelectChipProps {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

export function SelectChip({
  selected,
  children,
  onClick,
  className,
  ariaLabel,
}: SelectChipProps) {
  return (
    <button
      type="button"
      className={cn('chip', selected && 'is-selected', className)}
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {selected && <Check size={13} aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ProtocolFilterChip({
  protocol,
  selected,
  onSelect,
}: {
  protocol: ProtocolId;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn('chip chip--protocol', selected && 'is-selected')}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={cn('protocol-glyph', `protocol-glyph--${protocol}`)} aria-hidden="true">
        {protocol === 'matrix' ? (
          <svg viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="1.5" width="3.2" height="3.2" rx=".8" fill="currentColor" />
            <rect x="7.3" y="1.5" width="3.2" height="3.2" rx=".8" fill="currentColor" />
            <rect x="1.5" y="7.3" width="3.2" height="3.2" rx=".8" fill="currentColor" />
            <rect x="7.3" y="7.3" width="3.2" height="3.2" rx=".8" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M6.8 1.3 2.4 6.7h2.9l-.5 4 4.8-5.6H6.5l.3-3.8Z" fill="currentColor" />
          </svg>
        )}
      </span>
      {protocol === 'matrix' ? 'Matrix' : 'XMPP'}
    </button>
  );
}
