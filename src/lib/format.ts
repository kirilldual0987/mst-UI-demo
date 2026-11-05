import type { Chat, ChatKind, ProtocolId } from '../types';

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

const shortDayFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
});

const fullDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function startOfDay(value: Date): number {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function formatMessageTime(value: string): string {
  return timeFormatter.format(new Date(value));
}

export function formatChatTime(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const deltaDays = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);

  if (deltaDays === 0) return timeFormatter.format(date);
  if (deltaDays === 1) return 'Вчера';
  if (deltaDays > 1 && deltaDays < 7) {
    return weekdayFormatter.format(date).replace('.', '');
  }
  if (date.getFullYear() === today.getFullYear()) {
    return shortDayFormatter.format(date).replace('.', '');
  }
  return fullDateFormatter.format(date);
}

export function formatDayLabel(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const deltaDays = Math.round((startOfDay(today) - startOfDay(date)) / 86_400_000);

  if (deltaDays === 0) return 'Сегодня';
  if (deltaDays === 1) return 'Вчера';
  return dayFormatter.format(date);
}

export function formatFullDate(value: string): string {
  return fullDateFormatter.format(new Date(value));
}

export function dayKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function pluralizeRu(
  count: number,
  forms: [one: string, few: string, many: string],
): string {
  const absolute = Math.abs(count) % 100;
  const last = absolute % 10;
  if (absolute > 10 && absolute < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function unreadLabel(count: number): string {
  return count > 99 ? '99+' : count > 0 ? String(count) : '';
}

export function protocolLabel(protocol: ProtocolId): string {
  return protocol === 'matrix' ? 'Matrix' : 'XMPP';
}

export function presenceLabel(presence: string): string {
  switch (presence) {
    case 'online':
      return 'в сети';
    case 'away':
      return 'отошёл';
    case 'busy':
      return 'не беспокоить';
    default:
      return 'не в сети';
  }
}

export function chatKindLabel(kind: ChatKind): string {
  switch (kind) {
    case 'direct':
      return 'Личный чат';
    case 'group':
      return 'Групповой чат';
    case 'room':
      return 'Комната';
    case 'space':
      return 'Пространство';
  }
}

export function chatSubtitle(chat: Chat): string {
  if (chat.kind === 'direct') return protocolLabel(chat.protocol);
  if (chat.kind === 'space') return 'Space';
  if (chat.kind === 'room') return 'Комната';
  return 'Группа';
}

export function isChatViewPath(pathname: string): boolean {
  return /^\/(messages|direct|groups|rooms|favorites|unread)(\/|$)/.test(pathname);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} МБ`;
}
