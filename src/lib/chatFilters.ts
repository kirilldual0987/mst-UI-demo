import type {
  Chat,
  ChatView,
  ConversationScope,
} from '../types';

export const VIEW_TITLES: Record<ChatView, string> = {
  all: 'Все сообщения',
  direct: 'Личные сообщения',
  groups: 'Групповые чаты',
  rooms: 'Комнаты и сообщества',
  favorites: 'Избранное',
  unread: 'Непрочитанные',
};

export const VIEW_BASE_PATHS: Record<ChatView, string> = {
  all: '/messages',
  direct: '/direct',
  groups: '/groups',
  rooms: '/rooms',
  favorites: '/favorites',
  unread: '/unread',
};

export function matchesScope(chat: Chat, scope: ConversationScope): boolean {
  if (scope.type === 'all') return true;
  if (scope.type === 'protocol') return chat.protocol === scope.protocol;
  return chat.accountId === scope.accountId;
}

export function matchesView(chat: Chat, view: ChatView): boolean {
  switch (view) {
    case 'all':
      return true;
    case 'direct':
      return chat.kind === 'direct';
    case 'groups':
      return chat.kind === 'group';
    case 'rooms':
      return chat.kind === 'room' || chat.kind === 'space';
    case 'favorites':
      return chat.favorite;
    case 'unread':
      return chat.unread > 0;
  }
}

export function filterChats(
  chats: Chat[],
  view: ChatView,
  scope: ConversationScope,
): Chat[] {
  return chats
    .filter((chat) => matchesScope(chat, scope) && matchesView(chat, view))
    .sort((left, right) => {
      if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
}

export function searchChats(chats: Chat[], query: string): Chat[] {
  const normalized = query.trim().toLocaleLowerCase('ru-RU');
  if (!normalized) return chats;
  return chats.filter((chat) => {
    const haystack = [chat.name, chat.lastMessage, chat.lastSender, chat.topic, chat.description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('ru-RU');
    return haystack.includes(normalized);
  });
}

export function countUnread(chats: Chat[]): number {
  return chats.reduce((total, chat) => total + chat.unread, 0);
}
