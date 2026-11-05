import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SettingsIntroProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function SettingsIntro({ title, description, action }: SettingsIntroProps) {
  return (
    <div className="settings-intro">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

interface SettingsGroupProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsGroup({
  title,
  description,
  children,
  className,
}: SettingsGroupProps) {
  return (
    <section className={cn('settings-group', className)}>
      {(title || description) && (
        <header className="settings-group__header">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </header>
      )}
      <div className="settings-group__body">{children}</div>
    </section>
  );
}

interface SettingsRowProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  vertical?: boolean;
}

export function SettingsRow({
  title,
  description,
  children,
  className,
  vertical = false,
}: SettingsRowProps) {
  return (
    <div className={cn('settings-row', vertical && 'settings-row--vertical', className)}>
      <div className="settings-row__copy">
        <span className="settings-row__title">{title}</span>
        {description && <span className="settings-row__description">{description}</span>}
      </div>
      {children && <div className="settings-row__control">{children}</div>}
    </div>
  );
}

interface SettingsSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
}

export function SettingsSelect({
  value,
  onChange,
  options,
  label,
}: SettingsSelectProps) {
  return (
    <span className="settings-select">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </span>
  );
}

export function SettingsNotice({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'warning';
}) {
  return <div className={cn('settings-notice', tone === 'warning' && 'is-warning')}>{children}</div>;
}
