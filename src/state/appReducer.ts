import type {
  Account,
  AccountStatus,
  AppSettings,
  Chat,
  ChatMessage,
  Contact,
  MessageStatus,
} from '../types';

export const SETTINGS_STORAGE_KEY = 'messthon.settings.v1';

export const defaultSettings: AppSettings = {
  theme: 'system',
  accent: 'jade',
  fontSize: 'medium',
  density: 'comfortable',
  reduceMotion: false,
  showProtocolLabels: true,
  showInfoPanel: true,
  enterToSend: true,
  notificationsEnabled: true,
  notificationSound: true,
  messagePreviews: true,
  quietHours: false,
  mentionsOnly: false,
  sharePresence: true,
  sendReadReceipts: true,
  typingIndicators: true,
  appLock: false,
  autoLockMinutes: 15,
  defaultMatrixEncryption: true,
  keyBackup: true,
  omemoEnabled: true,
  autoDownloadMedia: 'wifi',
  mediaRetention: 'month',
};

export interface AppState {
  accounts: Account[];
  contacts: Contact[];
  chats: Chat[];
  messages: ChatMessage[];
  settings: AppSettings;
}

export type AppAction =
  | { type: 'settings/update'; patch: Partial<AppSettings> }
  | { type: 'settings/reset' }
  | { type: 'chats/markRead'; chatId: string }
  | { type: 'chats/markUnread'; chatId: string }
  | { type: 'chats/toggleFlag'; chatId: string; flag: 'pinned' | 'muted' | 'favorite' }
  | { type: 'chats/add'; chat: Chat }
  | { type: 'messages/add'; message: ChatMessage }
  | { type: 'messages/status'; messageId: string; status: MessageStatus }
  | { type: 'messages/toggleReaction'; messageId: string; emoji: string }
  | { type: 'accounts/status'; accountId: string; status: AccountStatus; lastSync?: string }
  | { type: 'accounts/add'; account: Account }
  | { type: 'accounts/remove'; accountId: string }
  | { type: 'contacts/add'; contact: Contact }
  | { type: 'contacts/update'; contactId: string; patch: Partial<Contact> }
  | { type: 'data/reset'; state: AppState };

function messagePreview(message: ChatMessage): string {
  if (message.text) return message.text;
  if (message.attachment?.type === 'image') return 'Изображение';
  return message.attachment?.name ?? 'Вложение';
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'settings/reset':
      return { ...state, settings: defaultSettings };
    case 'chats/markRead':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.chatId ? { ...chat, unread: 0 } : chat,
        ),
      };
    case 'chats/markUnread':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.chatId && chat.unread === 0
            ? { ...chat, unread: 1 }
            : chat,
        ),
      };
    case 'chats/toggleFlag':
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.chatId
            ? { ...chat, [action.flag]: !chat[action.flag] }
            : chat,
        ),
      };
    case 'chats/add':
      if (state.chats.some((chat) => chat.id === action.chat.id)) return state;
      return { ...state, chats: [action.chat, ...state.chats] };
    case 'messages/add':
      return {
        ...state,
        messages: [...state.messages, action.message],
        chats: state.chats.map((chat) => {
          if (chat.id !== action.message.chatId) return chat;
          return {
            ...chat,
            lastMessage: messagePreview(action.message),
            lastSender: action.message.outgoing ? 'Вы' : action.message.senderName,
            updatedAt: action.message.createdAt,
            unread: action.message.outgoing ? 0 : chat.unread,
          };
        }),
      };
    case 'messages/status':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.messageId
            ? { ...message, status: action.status }
            : message,
        ),
      };
    case 'messages/toggleReaction':
      return {
        ...state,
        messages: state.messages.map((message) => {
          if (message.id !== action.messageId) return message;
          const reactions = [...(message.reactions ?? [])];
          const index = reactions.findIndex((reaction) => reaction.emoji === action.emoji);
          if (index === -1) {
            reactions.push({ emoji: action.emoji, count: 1, mine: true });
          } else {
            const current = reactions[index];
            reactions[index] = {
              ...current,
              count: current.mine ? Math.max(0, current.count - 1) : current.count + 1,
              mine: !current.mine,
            };
            if (reactions[index].count === 0) reactions.splice(index, 1);
          }
          return { ...message, reactions };
        }),
      };
    case 'accounts/status':
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === action.accountId
            ? {
                ...account,
                status: action.status,
                lastSync: action.lastSync ?? account.lastSync,
              }
            : account,
        ),
      };
    case 'accounts/add':
      return { ...state, accounts: [...state.accounts, action.account] };
    case 'accounts/remove': {
      const chatIds = new Set(
        state.chats
          .filter((chat) => chat.accountId === action.accountId)
          .map((chat) => chat.id),
      );
      return {
        ...state,
        accounts: state.accounts.filter((account) => account.id !== action.accountId),
        contacts: state.contacts.filter(
          (contact) => contact.accountId !== action.accountId,
        ),
        chats: state.chats.filter((chat) => chat.accountId !== action.accountId),
        messages: state.messages.filter((message) => !chatIds.has(message.chatId)),
      };
    }
    case 'contacts/add':
      return { ...state, contacts: [action.contact, ...state.contacts] };
    case 'contacts/update':
      return {
        ...state,
        contacts: state.contacts.map((contact) =>
          contact.id === action.contactId
            ? { ...contact, ...action.patch }
            : contact,
        ),
      };
    case 'data/reset':
      return action.state;
    default:
      return state;
  }
}
