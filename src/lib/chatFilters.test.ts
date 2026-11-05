import { describe, expect, it } from 'vitest';
import {
  filterChats,
  matchesScope,
  matchesView,
  searchChats,
  VIEW_TITLES,
} from './chatFilters';
import type { Chat, ConversationScope } from '../types';

const baseChat: Chat = {
  id: 'chat',
  name: 'Alina Morozova',
  kind: 'direct',
  accountId: 'mx-kira',
  protocol: 'matrix',
  tone: 1,
  unread: 2,
  pinned: false,
  muted: false,
  favorite: true,
  lastMessage: 'Да, давай зафиксируем этот вариант.',
  updatedAt: '2026-11-06T09:42:00+03:00',
  encrypted: true,
};

const groupChat: Chat = {
  ...baseChat,
  id: 'group',
  name: 'Дизайн-команда',
  kind: 'group',
  accountId: 'xmpp-kira',
  protocol: 'xmpp',
  unread: 0,
  favorite: false,
  lastMessage: 'Обсуждение макетов и дизайн-системы',
  updatedAt: '2026-11-06T10:42:00+03:00',
};

describe('chat filters', () => {
  it('filters by view', () => {
    expect(matchesView(baseChat, 'direct')).toBe(true);
    expect(matchesView(baseChat, 'groups')).toBe(false);
    expect(matchesView(groupChat, 'groups')).toBe(true);
    expect(matchesView(groupChat, 'unread')).toBe(false);
    expect(matchesView(groupChat, 'rooms')).toBe(false);
  });

  it('filters by protocol and account scope', () => {
    const matrix: ConversationScope = { type: 'protocol', protocol: 'matrix' };
    const account: ConversationScope = { type: 'account', accountId: 'xmpp-kira' };
    expect(matchesScope(baseChat, matrix)).toBe(true);
    expect(matchesScope(groupChat, matrix)).toBe(false);
    expect(matchesScope(groupChat, account)).toBe(true);
    expect(matchesScope(baseChat, { type: 'all' })).toBe(true);
  });

  it('sorts pinned chats before recent chats', () => {
    const pinned = { ...baseChat, pinned: true };
    const filtered = filterChats([groupChat, pinned], 'all', { type: 'all' });
    expect(filtered.map((chat) => chat.id)).toEqual(['chat', 'group']);
  });

  it('searches names and last messages case-insensitively', () => {
    expect(searchChats([baseChat, groupChat], 'дизайн')).toHaveLength(1);
    expect(searchChats([baseChat, groupChat], 'ЗАФИКСИРУЕМ')).toHaveLength(1);
    expect(searchChats([baseChat, groupChat], '')).toHaveLength(2);
  });

  it('has labels for every chat view', () => {
    expect(Object.keys(VIEW_TITLES)).toHaveLength(6);
  });
});
