import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { ChatKind, Presence, ProtocolId } from '../../types';
import { presenceLabel, protocolLabel } from '../../lib/format';

interface ProtocolGlyphProps {
  protocol: ProtocolId;
  className?: string;
}

export function ProtocolGlyph({ protocol, className }: ProtocolGlyphProps) {
  return (
    <span
      className={cn('protocol-glyph', `protocol-glyph--${protocol}`, className)}
      aria-hidden="true"
    >
      {protocol === 'matrix' ? (
        <svg viewBox="0 0 12 12" fill="none">
          <rect x="1.5" y="1.5" width="3.2" height="3.2" rx=".8" fill="currentColor" />
          <rect x="7.3" y="1.5" width="3.2" height="3.2" rx=".8" fill="currentColor" />
          <rect x="1.5" y="7.3" width="3.2" height="3.2" rx=".8" fill="currentColor" />
          <rect
            x="7.3"
            y="7.3"
            width="3.2"
            height="3.2"
            rx=".8"
            stroke="currentColor"
            strokeWidth="1.1"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" fill="none">
          <path
            d="M6.8 1.3 2.4 6.7h2.9l-.5 4 4.8-5.6H6.5l.3-3.8Z"
            fill="currentColor"
          />
        </svg>
      )}
    </span>
  );
}

interface ProtocolBadgeProps {
  protocol: ProtocolId;
  compact?: boolean;
  className?: string;
}

export function ProtocolBadge({ protocol, compact = false, className }: ProtocolBadgeProps) {
  return (
    <span
      className={cn('protocol-badge', `protocol-badge--${protocol}`, className)}
      title={`Протокол ${protocolLabel(protocol)}`}
    >
      <ProtocolGlyph protocol={protocol} />
      {!compact && <span>{protocolLabel(protocol)}</span>}
    </span>
  );
}

interface AvatarProps {
  name: string;
  tone: number;
  size?: number;
  kind?: ChatKind;
  presence?: Presence;
  protocol?: ProtocolId;
  className?: string;
  badge?: ReactNode;
}

function initialsForAvatar(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({
  name,
  tone,
  size = 44,
  kind = 'direct',
  presence,
  protocol,
  className,
  badge,
}: AvatarProps) {
  const isRound = kind === 'direct';
  const glyph =
    kind === 'group' ? (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9.1 11.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.8.3a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM3.8 18.1c0-2.7 2.4-4.8 5.3-4.8s5.3 2.1 5.3 4.8M14.2 13.9c2.4.2 4.3 1.9 4.3 4.2"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
      </svg>
    ) : kind === 'room' ? (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 5.5 5.8 18.5M15.8 5.5l-3.2 13M4.5 9.3h13.7M3.7 14.7h13.7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ) : kind === 'space' ? (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="6.4" height="6.4" rx="1.4" stroke="currentColor" strokeWidth="1.65" />
        <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.4" stroke="currentColor" strokeWidth="1.65" />
        <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.4" stroke="currentColor" strokeWidth="1.65" />
        <path d="M13.6 16.8h6.4M16.8 13.6v6.4" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
      </svg>
    ) : null;

  return (
    <span
      className={cn(
        'avatar',
        `tone-${tone}`,
        isRound ? 'avatar--round' : 'avatar--soft',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
      aria-hidden="true"
    >
      {glyph ? <span className="avatar-glyph">{glyph}</span> : initialsForAvatar(name)}
      {presence && (
        <span
          className="presence-dot"
          data-presence={presence}
          title={presenceLabel(presence)}
        />
      )}
      {protocol && (
        <span className="avatar-protocol">
          <ProtocolGlyph protocol={protocol} />
        </span>
      )}
      {badge}
    </span>
  );
}

interface PresenceDotProps {
  presence: Presence;
  label?: string;
  className?: string;
}

export function PresenceDot({ presence, label, className }: PresenceDotProps) {
  return (
    <span
      className={cn('presence-dot presence-dot--inline', className)}
      data-presence={presence}
      title={label ?? presenceLabel(presence)}
      aria-label={label ?? presenceLabel(presence)}
      role="img"
    />
  );
}

interface UnreadBadgeProps {
  count: number;
  muted?: boolean;
  className?: string;
}

export function UnreadBadge({ count, muted = false, className }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={cn('unread-badge', muted && 'unread-badge--muted', className)}
      aria-label={`${count} непрочитанных`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
