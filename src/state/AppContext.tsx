import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { demoAccounts, demoChats, demoContacts, demoMessages } from '../data/demo';
import { defaultSettings, appReducer, SETTINGS_STORAGE_KEY } from './appReducer';
import type {
  Account,
  AccountStatus,
  AppSettings,
  Chat,
  ChatMessage,
  Contact,
  MessageAttachment,
  MessageReply,
  MessageStatus,
} from '../types';

interface SendMessageInput {
  chatId: string;
  text?: string;
  attachment?: MessageAttachment;
  reply?: MessageReply;
}

interface CreateContactInput {
  name: string;
  handle: string;
  accountId: string;
  protocol: Contact['protocol'];
  organization?: string;
  role?: string;
  bio?: string;
}

interface AppContextValue {
  accounts: Account[];
  contacts: Contact[];
  chats: Chat[];
  messages: ChatMessage[];
  settings: AppSettings;
  resolvedTheme: 'light' | 'dark';
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  markChatRead: (chatId: string) => void;
  markChatUnread: (chatId: string) => void;
  toggleChatFlag: (chatId: string, flag: 'pinned' | 'muted' | 'favorite') => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  sendMessage: (input: SendMessageInput) => ChatMessage;
  setAccountStatus: (accountId: string, status: AccountStatus, lastSync?: string) => void;
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  addContact: (input: CreateContactInput) => Contact;
  updateContact: (contactId: string, patch: Partial<Contact>) => void;
  createDirectChat: (contact: Contact) => Chat;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

function freshState() {
  return {
    accounts: demoAccounts.map((account) => ({ ...account })),
    contacts: demoContacts.map((contact) => ({ ...contact })),
    chats: demoChats.map((chat) => ({ ...chat })),
    messages: demoMessages.map((message) => ({
      ...message,
      reactions: message.reactions?.map((reaction) => ({ ...reaction })),
    })),
    settings: loadSettings(),
  };
}

function resolveTheme(theme: AppSettings['theme']): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function makeId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${suffix}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, freshState);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(loadSettings().theme),
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(state.settings),
    );
  }, [state.settings]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = resolveTheme(state.settings.theme);
      root.dataset.theme = theme;
      root.dataset.accent = state.settings.accent;
      root.dataset.font = state.settings.fontSize;
      root.dataset.density = state.settings.density;
      root.dataset.motion = state.settings.reduceMotion ? 'reduced' : 'full';
      root.style.colorScheme = theme;
      const themeColor = getComputedStyle(root).getPropertyValue('--surface').trim();
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta && themeColor) meta.setAttribute('content', themeColor);
      setResolvedTheme(theme);
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [
    state.settings.theme,
    state.settings.accent,
    state.settings.fontSize,
    state.settings.density,
    state.settings.reduceMotion,
  ]);

  useEffect(() => {
    const scheduledTimers = timers.current;
    return () => {
      scheduledTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    dispatch({ type: 'settings/update', patch });
  }, []);

  const resetSettings = useCallback(() => dispatch({ type: 'settings/reset' }), []);
  const markChatRead = useCallback(
    (chatId: string) => dispatch({ type: 'chats/markRead', chatId }),
    [],
  );
  const markChatUnread = useCallback(
    (chatId: string) => dispatch({ type: 'chats/markUnread', chatId }),
    [],
  );
  const toggleChatFlag = useCallback(
    (chatId: string, flag: 'pinned' | 'muted' | 'favorite') =>
      dispatch({ type: 'chats/toggleFlag', chatId, flag }),
    [],
  );
  const toggleReaction = useCallback(
    (messageId: string, emoji: string) =>
      dispatch({ type: 'messages/toggleReaction', messageId, emoji }),
    [],
  );
  const setAccountStatus = useCallback(
    (accountId: string, status: AccountStatus, lastSync?: string) =>
      dispatch({ type: 'accounts/status', accountId, status, lastSync }),
    [],
  );
  const addAccount = useCallback(
    (account: Account) => dispatch({ type: 'accounts/add', account }),
    [],
  );
  const removeAccount = useCallback(
    (accountId: string) => dispatch({ type: 'accounts/remove', accountId }),
    [],
  );
  const updateContact = useCallback(
    (contactId: string, patch: Partial<Contact>) =>
      dispatch({ type: 'contacts/update', contactId, patch }),
    [],
  );
  const resetDemoData = useCallback(
    () => dispatch({ type: 'data/reset', state: freshState() }),
    [],
  );

  const sendMessage = useCallback(
    ({ chatId, text, attachment, reply }: SendMessageInput): ChatMessage => {
      const chat = state.chats.find((item) => item.id === chatId);
      const account = state.accounts.find((item) => item.id === chat?.accountId);
      const message: ChatMessage = {
        id: makeId('msg'),
        chatId,
        senderId: 'me',
        senderName: 'Вы',
        outgoing: true,
        createdAt: new Date().toISOString(),
        text,
        attachment,
        reply,
        status: 'sending',
      };
      dispatch({ type: 'messages/add', message });

      schedule(() => {
        dispatch({ type: 'messages/status', messageId: message.id, status: 'sent' });
      }, 280);
      schedule(() => {
        dispatch({
          type: 'messages/status',
          messageId: message.id,
          status: 'delivered',
        });
      }, 720);
      if (account?.readReceipts && state.settings.sendReadReceipts) {
        schedule(() => {
          dispatch({ type: 'messages/status', messageId: message.id, status: 'read' });
        }, 1500);
      }
      return message;
    },
    [schedule, state.accounts, state.chats, state.settings.sendReadReceipts],
  );

  const addContact = useCallback(
    (input: CreateContactInput): Contact => {
      const account = state.accounts.find((item) => item.id === input.accountId);
      const contact: Contact = {
        id: makeId('contact'),
        name: input.name,
        handle: input.handle,
        protocol: input.protocol,
        accountId: input.accountId,
        presence: 'offline',
        statusText: 'Новый контакт',
        tone: ((state.contacts.length + 1) % 6) as Contact['tone'],
        favorite: false,
        bio: input.bio || 'Контакт добавлен в демонстрационном режиме.',
        organization: input.organization || account?.displayName || 'Messthon',
        role: input.role || 'Контакт',
        location: 'Не указано',
        timezone: 'Не указано',
        joined: 'сейчас',
        email: undefined,
      };
      dispatch({ type: 'contacts/add', contact });
      return contact;
    },
    [state.accounts, state.contacts.length],
  );

  const createDirectChat = useCallback(
    (contact: Contact): Chat => {
      const existing = state.chats.find(
        (chat) => chat.contactId === contact.id && chat.kind === 'direct',
      );
      if (existing) return existing;
      const chat: Chat = {
        id: makeId('chat'),
        name: contact.name,
        kind: 'direct',
        accountId: contact.accountId,
        protocol: contact.protocol,
        contactId: contact.id,
        tone: contact.tone,
        unread: 0,
        pinned: false,
        muted: false,
        favorite: contact.favorite,
        lastMessage: 'Начните новый разговор',
        updatedAt: new Date().toISOString(),
        encrypted: true,
      };
      dispatch({ type: 'chats/add', chat });
      return chat;
    },
    [state.chats],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      resolvedTheme,
      updateSettings,
      resetSettings,
      markChatRead,
      markChatUnread,
      toggleChatFlag,
      toggleReaction,
      sendMessage,
      setAccountStatus,
      addAccount,
      removeAccount,
      addContact,
      updateContact,
      createDirectChat,
      resetDemoData,
    }),
    [
      state,
      resolvedTheme,
      updateSettings,
      resetSettings,
      markChatRead,
      markChatUnread,
      toggleChatFlag,
      toggleReaction,
      sendMessage,
      setAccountStatus,
      addAccount,
      removeAccount,
      addContact,
      updateContact,
      createDirectChat,
      resetDemoData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Context hooks intentionally live beside their provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export type { AccountStatus, MessageStatus };
