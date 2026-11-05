export type ProtocolId = 'matrix' | 'xmpp';
export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentId = 'jade' | 'teal' | 'indigo' | 'terracotta';
export type FontSize = 'small' | 'medium' | 'large';
export type Density = 'comfortable' | 'compact';
export type AccountStatus = 'connected' | 'syncing' | 'disconnected' | 'error';
export type Presence = 'online' | 'away' | 'busy' | 'offline';
export type AvatarTone = 0 | 1 | 2 | 3 | 4 | 5;
export type ChatKind = 'direct' | 'group' | 'room' | 'space';
export type ChatView = 'all' | 'direct' | 'groups' | 'rooms' | 'favorites' | 'unread';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ToastTone = 'neutral' | 'success' | 'warning' | 'error';

export interface Account {
  id: string;
  protocol: ProtocolId;
  displayName: string;
  shortName: string;
  handle: string;
  server: string;
  tone: AvatarTone;
  status: AccountStatus;
  lastSync: string;
  statusDetail: string;
  deviceLabel: string;
  encryptionLabel: string;
  readReceipts: boolean;
}

export interface Contact {
  id: string;
  name: string;
  handle: string;
  protocol: ProtocolId;
  accountId: string;
  presence: Presence;
  statusText: string;
  tone: AvatarTone;
  favorite: boolean;
  bio: string;
  organization: string;
  role: string;
  location: string;
  timezone: string;
  joined: string;
  email?: string;
}

export interface Chat {
  id: string;
  name: string;
  kind: ChatKind;
  accountId: string;
  protocol: ProtocolId;
  contactId?: string;
  tone: AvatarTone;
  unread: number;
  pinned: boolean;
  muted: boolean;
  favorite: boolean;
  lastMessage: string;
  lastSender?: string;
  updatedAt: string;
  typing?: boolean;
  encrypted: boolean;
  memberCount?: number;
  memberIds?: string[];
  topic?: string;
  description?: string;
}

export interface MessageAttachment {
  type: 'image' | 'file';
  name: string;
  url?: string;
  size?: string;
  meta?: string;
  alt?: string;
}

export interface MessageReply {
  author: string;
  text: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  mine?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  outgoing: boolean;
  createdAt: string;
  text?: string;
  attachment?: MessageAttachment;
  reply?: MessageReply;
  reactions?: MessageReaction[];
  status?: MessageStatus;
  system?: boolean;
  edited?: boolean;
}

export type ConversationScope =
  | { type: 'all' }
  | { type: 'protocol'; protocol: ProtocolId }
  | { type: 'account'; accountId: string };

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentId;
  fontSize: FontSize;
  density: Density;
  reduceMotion: boolean;
  showProtocolLabels: boolean;
  showInfoPanel: boolean;
  enterToSend: boolean;
  notificationsEnabled: boolean;
  notificationSound: boolean;
  messagePreviews: boolean;
  quietHours: boolean;
  mentionsOnly: boolean;
  sharePresence: boolean;
  sendReadReceipts: boolean;
  typingIndicators: boolean;
  appLock: boolean;
  autoLockMinutes: number;
  defaultMatrixEncryption: boolean;
  keyBackup: boolean;
  omemoEnabled: boolean;
  autoDownloadMedia: 'always' | 'wifi' | 'never';
  mediaRetention: 'forever' | 'month' | 'week';
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

export interface SearchHit {
  id: string;
  type: 'chat' | 'contact' | 'message';
  title: string;
  subtitle: string;
  chatId?: string;
  contactId?: string;
}

export interface SearchResults {
  chats: Chat[];
  contacts: Contact[];
  messages: ChatMessage[];
}
